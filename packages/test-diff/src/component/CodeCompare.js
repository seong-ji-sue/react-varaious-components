import React, {useState, useMemo, useCallback, useRef} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {yaml} from '@codemirror/lang-yaml';
import {EditorView, Decoration, ViewPlugin, WidgetType} from '@codemirror/view';
import {
	diff_match_patch,
	DIFF_EQUAL,
	DIFF_INSERT,
	DIFF_DELETE,
} from 'diff-match-patch';
import './CodeCompare.scss';

/**
 * 예시 데이터
 * (질문에서 주신 공백 포함 버전)
 */
const initialLeftText = `server:
  port: 8080
  host: localhost
  
  
database:
  name: oracledb
  user: admin
`;

const initialRightText = `server:
  port: 8080
  host: 129.0.0.1
database:
  name: oracledb
  user: root
  port: 8081
  host: 127.0.1.1
`;

/**
 * diff-match-patch를 이용해
 * 1) 라인 단위로 다른지 체크 -> lineDiffSet
 * 2) 문자 단위 diff -> leftCharDiffs, rightCharDiffs
 *    (공백만 다른 구간은 isWhitespaceDiff = true)
 */
function computeDiffsDMP(leftText, rightText) {
	const leftLines = leftText.split('\n');
	const rightLines = rightText.split('\n');

	const leftLineDiffSet = new Set();
	const rightLineDiffSet = new Set();

	const leftCharDiffs = [];
	const rightCharDiffs = [];

	const dmp = new diff_match_patch();

	const maxLen = Math.max(leftLines.length, rightLines.length);
	for (let i = 0; i < maxLen; i++) {
		const leftLine = leftLines[i] ?? '';
		const rightLine = rightLines[i] ?? '';

		// 라인 단위: 내용이 다르면 해당 라인 번호에 표시
		if (leftLine !== rightLine) {
			leftLineDiffSet.add(i + 1); // 1-based
			rightLineDiffSet.add(i + 1);
		}

		// 문자 단위: diff-match-patch로 각 라인을 diff
		const diffs = dmp.diff_main(leftLine, rightLine);
		dmp.diff_cleanupSemantic(diffs);

		let leftPos = 0;
		let rightPos = 0;

		for (const [op, text] of diffs) {
			if (op === DIFF_EQUAL) {
				// 동일 구간은 강조 표시 없음
				leftPos += text.length;
				rightPos += text.length;
			} else if (op === DIFF_DELETE) {
				// 좌측(Left)에서 삭제된 구간
				const start = leftPos;
				const end = leftPos + text.length;
				leftPos = end;

				const isWhitespace = text.trim() === '' && text !== '';
				leftCharDiffs.push({
					lineNumber: i + 1,
					from: start,
					to: end,
					isWhitespaceDiff: isWhitespace,
				});
			} else if (op === DIFF_INSERT) {
				// 우측(Right)에서 새로 추가된 구간
				const start = rightPos;
				const end = rightPos + text.length;
				rightPos = end;

				const isWhitespace = text.trim() === '' && text !== '';
				rightCharDiffs.push({
					lineNumber: i + 1,
					from: start,
					to: end,
					isWhitespaceDiff: isWhitespace,
				});
			}
		}
	}

	return {
		leftLineDiffSet,
		rightLineDiffSet,
		leftCharDiffs,
		rightCharDiffs,
	};
}

/**
 * CodeMirror에서 "라인 단위" 배경 + 테두리 (Decoration.line)
 */
function lineDiffHighlighter(lineNumbers, className) {
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
					if (lineNumbers.has(i)) {
						const line = view.state.doc.line(i);
						widgets.push(Decoration.line({class: className}).range(line.from));
					}
				}
				return Decoration.set(widgets);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

/**
 * CodeMirror에서 "문자 단위" 배경 (Decoration.mark)
 * -> isWhitespaceDiff면 회색, 아니면 진한 색
 */
function charDiffHighlighter(
	charDiffs,
	classForFullDiff,
	classForWhitespaceDiff,
) {
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
				const ranges = [];
				for (const {lineNumber, from, to, isWhitespaceDiff} of charDiffs) {
					if (lineNumber > view.state.doc.lines) continue;
					const line = view.state.doc.line(lineNumber);

					const startPos = Math.min(line.from + from, line.to);
					const endPos = Math.min(line.from + to, line.to);
					if (startPos < endPos) {
						ranges.push(
							Decoration.mark({
								class: isWhitespaceDiff
									? classForWhitespaceDiff
									: classForFullDiff,
							}).range(startPos, endPos),
						);
					}
				}
				return Decoration.set(ranges);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

/**
 * 우측 화살표(←) 아이콘 위젯
 * -> 클릭하면 해당 라인의 우측 텍스트를 좌측에 복사
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
 * 우측 라인에 diff가 있는 곳마다 화살표 위젯 표시
 */
function diffWidgetMarker(diffLines, onArrowClick) {
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
					if (diffLines.has(i)) {
						const line = view.state.doc.line(i);
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
	const [showDiff, setShowDiff] = useState(false);

	// 좌측(최신) 텍스트 (수정 가능)
	const [leftText, setLeftText] = useState(initialLeftText);

	// 우측(이전) 텍스트 (읽기 전용)
	const [rightText] = useState(initialRightText);

	// diff-match-patch로 계산된 결과
	const {leftLineDiffSet, rightLineDiffSet, leftCharDiffs, rightCharDiffs} =
		useMemo(() => {
			if (!showDiff) {
				return {
					leftLineDiffSet: new Set(),
					rightLineDiffSet: new Set(),
					leftCharDiffs: [],
					rightCharDiffs: [],
				};
			}
			return computeDiffsDMP(leftText, rightText);
		}, [leftText, rightText, showDiff]);

	// 우측 편집기 참조 (화살표 클릭 시 사용)
	const rightEditorRef = useRef(null);

	/**
	 * 우측 화살표 클릭 -> 해당 라인 복사
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
		[leftText, rightText],
	);

	/**
	 * Replace All -> 모든 다른 라인을 우측 내용으로 교체
	 */
	const handleReplaceAll = useCallback(() => {
		const leftLines = leftText.split('\n');
		const rightLines = rightText.split('\n');
		rightLineDiffSet.forEach((lineNumber) => {
			if (lineNumber - 1 < rightLines.length) {
				leftLines[lineNumber - 1] = rightLines[lineNumber - 1];
			}
		});
		setLeftText(leftLines.join('\n'));
	}, [leftText, rightText, rightLineDiffSet]);

	/**
	 * 좌측 에디터 확장
	 */
	const leftExtensions = useMemo(() => {
		const exts = [yaml()];
		if (showDiff) {
			// 라인 단위: 옅은 빨강 + 테두리
			exts.push(lineDiffHighlighter(leftLineDiffSet, 'diff-line-red'));
			// 문자 단위: 진한 빨강 or 회색
			exts.push(
				charDiffHighlighter(
					leftCharDiffs,
					'diff-chars-red',
					'diff-chars-whitespace',
				),
			);
		}
		// 좌측에서 selection이 바뀌면 우측에서도 동일 라인 선택
		exts.push(
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
		);
		return exts;
	}, [showDiff, leftLineDiffSet, leftCharDiffs]);

	/**
	 * 우측 에디터 확장
	 */
	const rightExtensions = useMemo(() => {
		const exts = [yaml()];
		if (showDiff) {
			// 라인 단위: 옅은 초록 + 테두리
			exts.push(lineDiffHighlighter(rightLineDiffSet, 'diff-line-green'));
			// 문자 단위: 진한 초록 or 회색
			exts.push(
				charDiffHighlighter(
					rightCharDiffs,
					'diff-chars-green',
					'diff-chars-whitespace',
				),
			);
			// 화살표
			exts.push(diffWidgetMarker(rightLineDiffSet, onArrowClick));
		}
		// 읽기 전용 + selection 숨김 + 마우스 이벤트 차단
		exts.push(
			EditorView.editable.of(false),
			EditorView.theme({
				'.cm-selectionMatch': {backgroundColor: 'transparent !important'},
				'.cm-selectionMatch *': {backgroundColor: 'transparent !important'},
			}),
			EditorView.domEventHandlers({
				mousedown: (event) => {
					event.preventDefault();
					return true;
				},
				mouseup: (event) => {
					event.preventDefault();
					return true;
				},
				mousemove: (event) => {
					event.preventDefault();
					return true;
				},
			}),
		);
		return exts;
	}, [showDiff, rightLineDiffSet, rightCharDiffs, onArrowClick]);

	return (
		<div>
			<div style={{marginBottom: '1em'}}>
				{!showDiff && (
					<button onClick={() => setShowDiff(true)}>Compare</button>
				)}
				{showDiff && (
					<button onClick={handleReplaceAll} style={{marginLeft: '1em'}}>
						Replace All
					</button>
				)}
			</div>

			<div className='text-container'>
				<div className='editor-container'>
					<h3 className='title'>최신 (좌측, 수정 가능)</h3>
					<CodeMirror
						value={leftText}
						height='300px'
						extensions={leftExtensions}
						onChange={(value) => setLeftText(value)}
					/>
				</div>
				<div className='editor-container'>
					<h3 className='title'>이전 (우측, 읽기 전용)</h3>
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
		</div>
	);
};

export default CodeCompare;
