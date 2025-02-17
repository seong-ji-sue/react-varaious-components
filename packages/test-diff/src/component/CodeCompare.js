import React, {useState} from 'react';
import DiffViewer from 'react-diff-viewer';

export default function CodeCompare() {
	// ✅ 최신 코드 (좌측, 연두색)
	const [latestCode, setLatestCode] = useState(`
function greet(name) {
  return "Hello, " + name + "!";
  
  
  
  
  
}

console.log(greet("World"));
  `);

	// ✅ 이전 코드 (우측, 빨간색)
	const [oldCode, setOldCode] = useState(`
function greet(name) {
  return "Hi, " + name + "!";
}

console.log(greet("John"));
  `);

	// 🔹 `<<` 버튼 클릭 시 최신 코드(좌측) = 이전 코드(우측)로 변경
	const handleApplyOldCode = () => {
		setLatestCode(oldCode); // 최신 코드 업데이트
	};

	return (
		<div style={{maxWidth: '800px', margin: '0 auto'}}>
			<h2>Code Compare</h2>

			{/* Diff Viewer */}
			<DiffViewer
				oldValue={latestCode} // ✅ 최신 코드 (좌측, 연두색)
				newValue={oldCode} // ✅ 이전 코드 (우측, 빨간색)
				splitView={true} // 좌우 비교
				showDiffOnly={false} // 전체 표시
			/>

			{/* `<<` 버튼 */}
			<button
				onClick={handleApplyOldCode}
				style={{marginTop: '10px', padding: '8px 16px', fontSize: '16px'}}
			>
				{'<<'} Apply Old Code
			</button>
		</div>
	);
}
