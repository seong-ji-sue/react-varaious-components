// CodeCompare.jsx
import React, {useState, useMemo, useCallback, useRef} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {yaml} from '@codemirror/lang-yaml';
import {EditorView, Decoration, ViewPlugin, WidgetType} from '@codemirror/view';
import {lineNumbers} from '@codemirror/gutter';
import './CodeCompare.scss';

const compareText = `server:
  port: 8080
  host: localhost
database:
  name: oracledb
  user: admin`;

const rightText = `server:
  port: 8080
  host: 129.0.0.1
database:
  name: oracledb
  user: root
    port: 8081
  host: 127.0.1.1
database:
  name: oracledb
  user: root  port: 8081
  host: 127.0.1.1
database:
  name: oracledb
  user: root  port: 8081
  host: 127.0.1.1
database:
  name: oracledb
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
 * - WidgetType를 상속받아, 우측 gutter에 표시되는 위젯으로, "←"를 표시합니다.
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
		span.textContent = '←';
		span.style.color = 'red';
		span.style.fontWeight = 'bold';
		span.style.cursor = 'pointer';
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
						// side: -1 ensures the widget appears before the line content
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
	// 좌측과 우측 텍스트 간 diff 라인 번호 계산
	const diffSet = useMemo(
		() => calculateDiffLines(leftText, rightText),
		[leftText],
	);
	// 우측 에디터의 EditorView 참조 (좌측 선택 동기화에 사용)
	const rightEditorRef = useRef(null);

	/**
	 * 우측 화살표 클릭 시 호출되는 콜백.
	 * 전달받은 라인 번호의 오른쪽 텍스트 내용을 좌측 텍스트의 해당 라인에 덮어씌웁니다.
	 */
	const onArrowClick = useCallback(
		(lineNumber) => {
			const leftLines = leftText.split('\n');
			const rightLines = rightText.split('\n');
			if (lineNumber - 1 < rightLines.length) {
				leftLines[lineNumber - 1] = rightLines[lineNumber - 1];
				setLeftText(leftLines.join('\n'));
			}
		},
		[leftText],
	);

	/**
	 * 좌측 에디터 확장:
	 * - YAML 모드 적용
	 * - diffHighlighter를 통해 'diff-green' 클래스로 초록 하이라이팅 적용
	 * - updateListener를 통해 좌측 에디터의 선택이 변경되면 해당 라인의 선택 범위를 우측 에디터에 동기화
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
	 * - diffWidgetMarker를 통해 우측 gutter에 클릭 가능한 화살표 위젯 삽입 (라인 앞에)
	 * - readOnly 설정, 기본 selection 스타일 제거, 마우스 이벤트 차단
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
		<div className='container'>
			<div className='editor-container'>
				<h3 className='title'>최신 (좌측, 수정 가능 / 초록 하이라이팅)</h3>
				<CodeMirror
					value={leftText}
					height='300px'
					extensions={leftExtensions}
					onChange={onLeftChange}
				/>
			</div>
			<div className='editor-container'>
				<h3 className='title'>
					이전 (우측, 읽기 전용 / 빨간 하이라이팅 / 라인 앞 화살표 표시)
				</h3>
				<CodeMirror
					value={rightText}
					height='300px'
					extensions={rightExtensions}
					onCreateEditor={(view) => {
						rightEditorRef.current = view;
					}}
				/>
			</div>
		</div>
	);
};

export default CodeCompare;
