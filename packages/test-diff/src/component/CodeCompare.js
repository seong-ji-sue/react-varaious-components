// CodeCompare.jsx
import React, {useState, useMemo, useCallback, useRef} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {yaml} from '@codemirror/lang-yaml';
import {EditorView, Decoration, ViewPlugin, WidgetType} from '@codemirror/view';
import {lineNumbers} from '@codemirror/gutter';
import styled, {createGlobalStyle} from 'styled-components';

const compareText = `server:
  port: 8080
  host: localhost
database:
  name: mydb
  user: admin`;

const rightText = `server:
  port: 8080
  host: 127.0.0.1
database:
  name: mydb
  user: root
    port: 8080
  host: 127.0.0.1
database:
  name: mydb
  user: root  port: 8080
  host: 127.0.0.1
database:
  name: mydb
  user: root  port: 8080
  host: 127.0.0.1
database:
  name: mydb
  user: root`;

/**
 * 두 텍스트를 줄 단위로 비교하여, 내용이 다른 라인의 번호(1-indexed)를 Set으로 반환합니다.
 */
const calculateDiffLines = (leftText, rightText) => {
	const leftLines = leftText.split('\n');
	const rightLines = rightText.split('\n');
	const diffSet = new Set();
	const maxLines = Math.max(leftLines.length, rightLines.length);
	for (let i = 0; i < maxLines; i++) {
		if (leftLines[i] !== rightLines[i]) {
			diffSet.add(i + 1);
		}
	}
	return diffSet;
};

/**
 * CodeMirror의 Decoration API를 사용하여, diffSet에 포함된 라인에 지정한 CSS 클래스를 적용하는 확장입니다.
 */
function diffHighlighter(diffSet, colorClass) {
	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDecorations(view);
			}
			update(update) {
				if (update.docChanged) {
					this.decorations = this.buildDecorations(update.view);
				}
			}
			buildDecorations(view) {
				const widgets = [];
				for (let i = 1; i <= view.state.doc.lines; i++) {
					const line = view.state.doc.line(i);
					if (diffSet.has(i)) {
						widgets.push(Decoration.line({class: colorClass}).range(line.from));
					}
				}
				return Decoration.set(widgets);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

/**
 * ClickableArrowWidget
 * - WidgetType를 상속받아, 우측 gutter에 표시되는 위젯으로, "←X" (X는 라인 번호)를 표시합니다.
 * - 클릭 시 onArrowClick 콜백을 호출합니다.
 */
class ClickableArrowWidget extends WidgetType {
	constructor(lineNumber, onArrowClick) {
		super();
		this.lineNumber = lineNumber;
		this.onArrowClick = onArrowClick;
	}
	toDOM() {
		const span = document.createElement('span');
		span.textContent = `←`;
		span.style.color = 'red';
		span.style.fontWeight = 'bold';
		span.style.cursor = 'pointer';
		// 클릭 이벤트 처리: 콜백 호출
		span.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.onArrowClick(this.lineNumber);
		};
		return span;
	}
}

/**
 * diffWidgetMarker: diffSet에 포함된 각 라인의 시작에 ClickableArrowWidget 위젯을 삽입하는 확장입니다.
 * @param {Set} diffSet - diff 발생 라인 번호 Set
 * @param {function(number): void} onArrowClick - 화살표 클릭 시 호출되는 콜백 (라인 번호 전달)
 */
function diffWidgetMarker(diffSet, onArrowClick) {
	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDecorations(view);
			}
			update(update) {
				if (update.docChanged) {
					this.decorations = this.buildDecorations(update.view);
				}
			}
			buildDecorations(view) {
				const widgets = [];
				for (let i = 1; i <= view.state.doc.lines; i++) {
					if (diffSet.has(i)) {
						const line = view.state.doc.line(i);
						// side: -1 ensures the widget is placed before the line content
						widgets.push(
							Decoration.widget({
								widget: new ClickableArrowWidget(i, onArrowClick),
								side: -1,
							}).range(line.from),
						);
					}
				}
				return Decoration.set(widgets);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

const CodeCompare = () => {
	// 좌측(최신) 텍스트 상태 (수정 가능)
	const [leftText, setLeftText] = useState(compareText);
	// 우측 텍스트는 상수(rightText)
	// 좌측과 우측 텍스트 간 diff 라인 번호 계산
	const diffSet = useMemo(
		() => calculateDiffLines(leftText, rightText),
		[leftText],
	);
	// 우측 에디터의 EditorView 참조 (좌측 선택 동기화에 사용)
	const rightEditorRef = useRef(null);

	/**
	 * 우측 화살표 클릭 시 호출되는 콜백.
	 * 전달받은 라인 번호의 오른쪽 에디터 내용을 좌측 에디터에 덮어씌웁니다.
	 */
	const onArrowClick = useCallback(
		(lineNumber) => {
			// 좌측, 우측 텍스트를 줄 단위 배열로 분리
			const leftLines = leftText.split('\n');
			const rightLines = rightText.split('\n');
			// 해당 라인의 내용(배열 인덱스는 lineNumber - 1)
			if (lineNumber - 1 < rightLines.length) {
				leftLines[lineNumber - 1] = rightLines[lineNumber - 1];
				// 업데이트된 라인 배열을 다시 문자열로 결합
				const newLeftText = leftLines.join('\n');
				setLeftText(newLeftText);
			}
		},
		[leftText],
	);

	/**
	 * 좌측 에디터 확장:
	 * - YAML 모드 적용
	 * - diffHighlighter를 통해 'diff-green' 클래스로 초록 하이라이팅 적용
	 * - updateListener: 좌측 에디터의 선택 변경 시 우측 에디터의 선택을 동기화
	 */
	const leftExtensions = useMemo(
		() => [
			yaml(),
			diffHighlighter(diffSet, 'diff-green'),
			EditorView.updateListener.of((update) => {
				if (update.selectionSet && rightEditorRef.current) {
					const pos = update.state.selection.main.head;
					const lineNumber = update.state.doc.lineAt(pos).number;
					const rightState = rightEditorRef.current.state;
					if (lineNumber <= rightState.doc.lines) {
						const line = rightState.doc.line(lineNumber);
						rightEditorRef.current.dispatch({
							selection: {anchor: line.from, head: line.to},
						});
					}
				}
			}),
		],
		[diffSet],
	);

	/**
	 * 우측 에디터 확장:
	 * - YAML 모드 적용
	 * - diffHighlighter를 통해 'diff-red' 클래스로 빨간 하이라이팅 적용
	 * - diffWidgetMarker를 통해 우측 gutter에 ClickableArrowWidget을 삽입하여, 라인 앞에 화살표와 숫자 표시
	 * - readOnly 설정 및 기본 selection 스타일 제거, 마우스 이벤트 차단
	 */
	const rightExtensions = useMemo(
		() => [
			yaml(),
			diffHighlighter(diffSet, 'diff-red'),
			diffWidgetMarker(diffSet, onArrowClick),
			EditorView.editable.of(false),
			EditorView.theme({
				'.cm-selectionLayer': {backgroundColor: 'transparent !important'},
				'.cm-selectionLayer *': {backgroundColor: 'transparent !important'},
				'.cm-selectionMatch': {backgroundColor: 'transparent !important'},
				'.cm-selectionMatch *': {backgroundColor: 'transparent !important'},
			}),
			EditorView.domEventHandlers({
				mousedown: (event, view) => {
					event.preventDefault();
					return true;
				},
				mouseup: (event, view) => {
					event.preventDefault();
					return true;
				},
				mousemove: (event, view) => {
					event.preventDefault();
					return true;
				},
			}),
		],
		[diffSet, onArrowClick],
	);

	const onLeftChange = useCallback((value) => {
		setLeftText(value);
	}, []);

	return (
		<Container>
			<EditorContainer>
				<Title>최신 (좌측, 수정 가능 / 초록 하이라이팅)</Title>
				<CodeMirror
					value={leftText}
					height='300px'
					extensions={leftExtensions}
					onChange={onLeftChange}
				/>
			</EditorContainer>
			<EditorContainer>
				<Title>
					이전 (우측, 읽기 전용 / 빨간 하이라이팅 / 라인 앞 화살표 표시)
				</Title>
				<CodeMirror
					value={rightText}
					height='300px'
					extensions={rightExtensions}
					onCreateEditor={(view) => {
						rightEditorRef.current = view;
					}}
				/>
			</EditorContainer>
			<GlobalStyle />
		</Container>
	);
};

export default CodeCompare;

/* GlobalStyle: diff 하이라이팅 및 gutter 영역 스타일 정의 */
const GlobalStyle = createGlobalStyle`
	.diff-green {
		background-color: #e0ffe0;
	}
	.diff-red {
		background-color: #ffe0e0;
	}
	.cm-gutters {
		background-color: #f5f5f5;
		color: black;
		border-right: 1px solid #ddd;
	}
`;

/* styled-components 레이아웃 스타일 정의 */
const Container = styled.div`
	display: flex;
	gap: 1em;
	padding: 1em;
`;
const EditorContainer = styled.div`
	flex: 1;
	border: 1px solid #ddd;
	padding: 0.5em;
`;
const Title = styled.h3`
	margin-bottom: 0.5em;
`;
