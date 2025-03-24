import React from 'react';
import YamlViewerTool from './component/viewer/YamlViewerTool';

function Page() {
	return (
		<div>
			<h3>YAML Edit/View 테스트</h3>
			<YamlViewerTool />
		</div>
	);
}

Page.propTypes = {};

export default Page;
