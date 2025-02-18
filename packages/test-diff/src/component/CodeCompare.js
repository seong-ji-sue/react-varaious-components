import React, {useState, useEffect} from 'react';
import DiffMatchPatch from 'diff-match-patch';
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {EditorView} from '@codemirror/view';

export default function CodeCompare() {
	// ✅ 최신 코드 (좌측)
	const [latestCode, setLatestCode] = useState(`
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));
  `);

	// ✅ 이전 코드 (우측)
	const [oldCode, setOldCode] = useState(`
function greet(name) {
  return "Hi, " + name + "!";
}

console.log(greet("John"));
  `);

	// ✅ 변경된 부분을 저장할 상태
	const [highlightedLatest, setHighlightedLatest] = useState(latestCode);
	const [highlightedOld, setHighlightedOld] = useState(oldCode);

	// ✅ diff-match-patch 사용하여 변경 사항 비교
	useEffect(() => {
		const dmp = new DiffMatchPatch();
		const diffs = dmp.diff_main(oldCode, latestCode);
		dmp.diff_cleanupSemantic(diffs);

		// 🔹 변경된 부분을 감지하여 하이라이트 적용
		const getHighlightedCode = (diffs, isLatest) => {
			let highlighted = '';
			diffs.forEach(([type, text]) => {
				const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // HTML 태그 회피
				if (type === 0) {
					// 공통 부분
					highlighted += safeText;
				} else if ((type === 1 && isLatest) || (type === -1 && !isLatest)) {
					// 추가(초록색) or 삭제(빨간색)
					highlighted += `<span class="${
						type === 1 ? 'added' : 'removed'
					}">${safeText}</span>`;
				}
			});
			return highlighted;
		};

		// ✅ 변경된 부분을 감지하여 상태 업데이트
		setHighlightedLatest(getHighlightedCode(diffs, true));
		setHighlightedOld(getHighlightedCode(diffs, false));
	}, [latestCode, oldCode]); // latestCode가 변경될 때마다 실행

	return (
		<div style={{maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial'}}>
			<h2 style={{textAlign: 'center'}}>Code Compare</h2>

			<div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
				{/* ✅ 최신 코드 (수정 가능) */}
				<div style={{flex: 1, backgroundColor: '#e6ffed', padding: '10px'}}>
					<h3 style={{textAlign: 'center'}}>Latest Code (수정 가능)</h3>
					<CodeMirror
						value={latestCode}
						height='400px'
						extensions={[
							javascript(),
							EditorView.theme({
								'&.cm-editor .added': {backgroundColor: '#a6f3a6'},
								'&.cm-editor .removed': {backgroundColor: '#ffb3b3'},
							}),
						]}
						onChange={(value) => setLatestCode(value)}
					/>
				</div>

				{/* ✅ 이전 코드 (읽기 전용) */}
				<div style={{flex: 1, backgroundColor: '#ffebeb', padding: '10px'}}>
					<h3 style={{textAlign: 'center'}}>Old Code (읽기 전용)</h3>
					<CodeMirror
						value={oldCode}
						height='400px'
						extensions={[
							javascript(),
							EditorView.theme({
								'&.cm-editor .added': {backgroundColor: '#a6f3a6'},
								'&.cm-editor .removed': {backgroundColor: '#ffb3b3'},
							}),
						]}
						editable={false}
					/>
				</div>
			</div>

			{/* ✅ 전체 변경 적용 버튼 */}
			<button
				onClick={() => setLatestCode(oldCode)}
				style={{
					marginTop: '15px',
					padding: '10px 16px',
					fontSize: '16px',
					display: 'block',
					backgroundColor: '#007bff',
					color: 'white',
					border: 'none',
					cursor: 'pointer',
					width: '200px',
					marginLeft: 'auto',
					marginRight: 'auto',
					textAlign: 'center',
				}}
			>
				{'<<'} Apply Old Code
			</button>
		</div>
	);
}
