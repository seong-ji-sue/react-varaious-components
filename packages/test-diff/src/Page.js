import React from 'react';
import CodeCompare from './component/CodeCompare';
import CompareDiffTable from './component/CompareDiffTable';

function Page() {
	return (
		<div>
			<CompareDiffTable />
			{/*<CompareTable />*/}
			<CodeCompare />
		</div>
	);
}

Page.propTypes = {};

export default Page;
