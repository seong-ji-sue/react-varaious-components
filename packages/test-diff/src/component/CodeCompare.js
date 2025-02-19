// CodeCompare.jsx
import React, {useState, useMemo, useCallback, useRef} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {yaml} from '@codemirror/lang-yaml';
import {EditorView, Decoration, ViewPlugin} from '@codemirror/view';
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
  user: root
  
  `;

// 좌측(최신)와 우측(이전) 텍스트를 줄 단위로 비교하여 diff가 발생한 줄 번호를 반환 (1-indexed)
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

// CodeMirror의 Decoration을 사용하여 diff가 발생한 줄에 지정된 CSS 클래스를 부여하는 확장
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
		{
			decorations: (v) => v.decorations,
		},
	);
}

const CodeCompare = () => {
	// 기본 YAML 텍스트 예시
	const [leftText, setLeftText] = useState(compareText);

	// 좌측과 우측 텍스트 간 diff가 발생한 라인 번호 계산 (1-indexed)
	const diffSet = useMemo(
		() => calculateDiffLines(leftText, rightText),
		[leftText],
	);

	// 우측 에디터의 EditorView 참조 (좌측 선택 동기화에 사용)
	const rightEditorRef = useRef(null);

	/**
	 * 좌측 에디터 확장:
	 * - YAML 모드 적용
	 * - diffHighlighter를 통해 초록색(diff-green) 하이라이팅 적용
	 * - updateListener를 통해 좌측 에디터의 선택이 변경될 때 해당 라인의 선택을 우측 에디터에 동기화
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

	// 우측 에디터 확장: YAML, diff 하이라이팅(빨강), readOnly, 기본 selection 동작 차단
	const rightExtensions = useMemo(
		() => [
			yaml(),
			diffHighlighter(diffSet, 'diff-red'),
			EditorView.editable.of(false),
			// 우측 에디터에서 마우스 이벤트로 인한 selection 변경을 차단
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
		[diffSet],
	);

	// 좌측 텍스트 변경 핸들러
	const onLeftChange = useCallback((value) => {
		setLeftText(value);
	}, []);

	return (
		<Container>
			<EditorContainer>
				<Title>최신 (좌측, 수정 가능 / 초록 하이라이트)</Title>
				<CodeMirror
					value={leftText}
					height='300px'
					extensions={leftExtensions}
					onChange={onLeftChange}
				/>
			</EditorContainer>
			<EditorContainer>
				<Title>이전 (우측, 읽기 전용 / 빨간 하이라이트)</Title>
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

// Global 스타일: diff 하이라이팅 CSS 클래스 정의
const GlobalStyle = createGlobalStyle`
  .diff-green {
    background-color: #e0ffe0;
  }
  .diff-red {
    background-color: #ffe0e0;
  }
`;

// styled-components로 레이아웃 스타일 정의
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
