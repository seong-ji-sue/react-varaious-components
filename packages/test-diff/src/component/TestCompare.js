import React, {useState} from 'react';

// diff2html 최신 방식: parse, html 함수 import
import {parse, html} from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css'; // diff2html 기본 CSS

// diff 라이브러리에서 Unified Patch 생성 함수
import {createTwoFilesPatch} from 'diff';

import './CodeCompare.scss';

/**
 * 예시 데이터
 */
const initialLeftText = `1=1
123=123a
123a=1231a
`;

const initialRightText = `1=1
123a=123
123=1231a
ZXC=ZXC
`;

function TestCompare() {
	// 좌측(최신) 텍스트
	const [leftText, setLeftText] = useState(initialLeftText);

	// 우측(이전) 텍스트
	const [rightText, setRightText] = useState(initialRightText);

	// Compare 버튼 클릭 시 diff2html로 만든 HTML
	const [showDiff, setShowDiff] = useState(false);
	const [diffHtml, setDiffHtml] = useState('');

	/**
	 * Compare 버튼
	 * 1) diff 라이브러리로 patch 생성
	 * 2) diff2html의 parse(...) → html(...)로 HTML 생성
	 */
	const handleCompare = () => {
		// 1) Unified Patch 생성
		const patch = createTwoFilesPatch(
			'LeftFile',
			'RightFile',
			leftText,
			rightText,
		);

		console.log('patch', patch);

		// 2) diff2html parse
		const diffJson = parse(patch);
		console.log('diffJson', diffJson);

		// 3) diff2html html
		const outputHtml = html(diffJson, {
			drawFileList: false, // 상단 파일 목록 숨김
			outputFormat: 'side-by-side', // 사이드바이사이드
			matching: 'lines', // 라인 매칭
		});

		setDiffHtml(outputHtml);
		setShowDiff(true);
	};

	/**
	 * Replace All 버튼
	 * -> 우측 내용 전체를 좌측에 복사
	 */
	const handleReplaceAll = () => {
		setLeftText(rightText);
		setShowDiff(false);
		setDiffHtml('');
	};

	return (
		<div>
			<div style={{marginBottom: '1em'}}>
				<button onClick={handleCompare}>Compare</button>
				<button onClick={handleReplaceAll} style={{marginLeft: '1em'}}>
					Replace All
				</button>
			</div>

			{/* Compare 전: 좌/우 textarea 보여주기 */}
			{!showDiff && (
				<div style={{display: 'flex', gap: '1em'}}>
					<div>
						<h3>최신 (좌측, 수정 가능)</h3>
						<textarea
							style={{width: '400px', height: '300px'}}
							value={leftText}
							onChange={(e) => setLeftText(e.target.value)}
						/>
					</div>
					<div>
						<h3>이전 (우측, 읽기 전용)</h3>
						<textarea
							style={{width: '400px', height: '300px'}}
							value={rightText}
							readOnly
						/>
					</div>
				</div>
			)}

			{/* Compare 후: diff2html HTML 렌더 */}
			{showDiff && <div dangerouslySetInnerHTML={{__html: diffHtml}} />}
		</div>
	);
}

export default TestCompare;
