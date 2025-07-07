import React from 'react';
import MultiFileUpload from './component/multi/MultiFileUpload';
import SingleFileUpload from './component/one/SingleFileUpload';

function Page() {
	return (
		<div>
			<h3>다건 File Upload 테스트</h3>
			<MultiFileUpload />
			<h3>단건 File Upload 테스트</h3>
			<SingleFileUpload />
		</div>
	);
}

Page.propTypes = {};

export default Page;
