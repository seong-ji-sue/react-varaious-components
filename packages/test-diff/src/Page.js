import React from 'react';
import CodeCompare from './component/CodeCompare';
import CompareDiffTable from './component/CompareDiffTable';
import CompareTable from './component/CompareTable';
import TestCompare from './component/TestCompare';

function Page() {
	return (
		<div>
			<CompareDiffTable />
			<CompareTable />
			<CodeCompare />
			<TestCompare />
		</div>
	);
}

Page.propTypes = {};

export default Page;
