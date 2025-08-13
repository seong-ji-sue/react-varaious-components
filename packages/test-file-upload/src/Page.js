import React from 'react';
import TableTest from './component/Page/TableTest';

function Page() {
	return (
		<div>
			{/*<h3>다건 File Upload 테스트</h3>*/}
			{/*<MultiFileUpload />*/}
			{/*<h3>단건 File Upload 테스트</h3>*/}
			{/*<SingleFileUpload />*/}
			{/*<h3>DatePicker 이동 테스트</h3>*/}
			{/*<DatePickerTest />*/}
			<h3>테이블 테스트</h3>
			<TableTest />
		</div>
	);
}

Page.propTypes = {};

export default Page;
