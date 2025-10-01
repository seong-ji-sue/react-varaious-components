import React, {useCallback} from 'react';
import * as FileSaver from 'file-saver';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';

const pdfHeadStyle = {
	fillColor: [68, 60, 109], // 어두운 보라색 계열
	fontStyle: 'bold',
	textColor: 'white',
};

const malgunBase64Font = '';

const getTableData = (data, columns) => {
	// 1. 헤더 추출
	const tableHead = [columns.map((v) => v.header)];

	// 2. 바디 데이터 추출 및 정렬
	const tableArr = data.map((row) =>
		columns.map((col) => {
			const val = row[col.accessorKey];
			// 원본 코드의 printCell 로직은 제외하고, 데이터만 추출합니다.
			return val || '';
		}),
	);

	return {
		tableHead: tableHead,
		tableArr: tableArr,
	};
};

const Export = ({data, columns}) => {
	const checkValidation = useCallback(() => {
		if (!data || data.length < 1) {
			console.warn('내보낼 데이터가 없습니다.');
			return false;
		}
		if (!columns || columns.length < 1) {
			console.warn('컬럼 정보가 정의되지 않았습니다.');
			return false;
		}
		return true;
	}, [data, columns]);

	// 엑셀 내보내기 함수
	const exportExcel = useCallback(async () => {
		if (!checkValidation()) return;

		try {
			// xlsx 라이브러리 동적 임포트 (설치 필수)
			const XLSX = await import('xlsx');

			// columns prop을 getTableData에 전달
			const tableData = getTableData(data, columns);

			// 헤더와 바디 데이터를 합쳐 2차원 배열 생성
			const tableArr = [...tableData.tableHead, ...tableData.tableArr];

			const ws = XLSX.utils.aoa_to_sheet(tableArr);
			const wb = XLSX.utils.book_new();

			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

			const excelBuffer = XLSX.write(wb, {
				bookType: 'xlsx',
				type: 'array',
			});

			FileSaver.saveAs(
				new Blob([excelBuffer], {type: 'application/octet-stream'}),
				'data_export.xlsx',
			);
		} catch (e) {
			console.error('Excel 내보내기 오류:', e);
		}
	}, [data, columns, checkValidation]);

	// PDF 내보내기 함수
	const exportPdf = useCallback(async () => {
		if (!checkValidation()) return;

		try {
			// jspdf 라이브러리 동적 임포트 (설치 필수)
			const {jsPDF} = await import('jspdf');

			// jspdf-autotable 플러그인 임포트 및 autoTable 함수 가져오기 (설치 필수)
			const autoTableModule = await import('jspdf-autotable');
			const autoTableFn = autoTableModule.default || autoTableModule;

			const doc = new jsPDF('l', 'mm', 'a4'); // 'l' (Landscape), A4 용지 설정

			// 폰트 파일 동적 임포트: font.js에서 excelFont (Base64 데이터)를 가져옵니다.
			const {excelFont} = await import('./font.js');

			const fontData = excelFont; // font.js에서 가져온 Base64 폰트 데이터
			const fontFileName = '바른바탕체.ttf'; // VFS에 등록할 폰트 파일명
			const fontLogicalName = 'malgun'; // doc.setFont에 사용할 논리적 폰트 이름

			const isFontLoaded = fontData && fontData.length > 100;

			// 폰트 설정 (한글 지원)
			if (isFontLoaded) {
				// 폰트 데이터를 VFS에 추가하고 폰트를 설정합니다.
				doc.addFileToVFS(fontFileName, fontData);
				doc.addFont(fontFileName, fontLogicalName, 'normal');
				doc.setFont(fontLogicalName);
			} else {
				console.warn(
					'한글 폰트 데이터(excelFont)를 font.js에서 불러오지 못했거나 비어 있습니다. 한글이 깨질 수 있습니다.',
				);
			}

			// columns prop을 getTableData에 전달
			const tableData = getTableData(data, columns);
			const tableArr = tableData.tableArr;
			const tableHead = tableData.tableHead;

			// doc 인스턴스를 첫 번째 인자로 명시적 전달
			autoTableFn(doc, {
				styles: {
					fontSize: 8,
					// 폰트 로드 여부에 따라 설정
					font: isFontLoaded ? fontLogicalName : 'helvetica',
					fontStyle: 'normal',
				},
				headStyles: pdfHeadStyle,
				startY: 15, // PDF 상단 마진 설정
				head: tableHead,
				body: tableArr,
			});

			doc.save('data_export.pdf');
		} catch (e) {
			console.error('PDF 내보내기 오류:', e);
		}
	}, [data, columns, checkValidation]);

	return (
		<div style={{margin: '10px', fontSize: '20px'}}>
			{/* Excel 내보내기 버튼 */}
			<button
				onClick={exportExcel}
				style={{
					fontSize: '15px',
					marginRight: '10px',
					padding: '8px 15px',
					cursor: 'pointer',
					border: '1px solid #ddd',
					borderRadius: '4px',
				}}
			>
				Excel 내보내기
			</button>

			{/* PDF 내보내기 버튼 */}
			<button
				onClick={exportPdf}
				style={{
					fontSize: '15px',
					padding: '8px 15px',
					cursor: 'pointer',
					border: '1px solid #ddd',
					borderRadius: '4px',
				}}
			>
				PDF 내보내기
			</button>
		</div>
	);
};

export default Export;
