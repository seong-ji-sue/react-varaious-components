import React from 'react';
import CodeCompare from './component/editor/CodeCompare';
import CompareDiffTable from './component/form/CompareDiffTable';
import CompareTable from './component/form/CompareTable';
import TestCompare from './component/editor/TestCompare';
import YamlDiffView from './component/editor/YamlDiffView';

function Page() {
	return (
		<div>
			<h3>Form diff 테스트</h3>
			<CompareDiffTable />
			<CompareTable />
			<h3>YAML diff 테스트</h3>
			<CodeCompare />
			<TestCompare />
			<YamlDiffView />
			<h3>YAML Edit/View 테스트</h3>
		</div>
	);
}

Page.propTypes = {};

export default Page;
