import React from 'react';
import PropTypes from 'prop-types';
import CompareTable from './component/CompareTable';
import CodeCompare from './component/CodeCompare';

function Page(props) {
	return (
		<div>
			test 페이지
			<CompareTable />
			<CodeCompare />
		</div>
	);
}

Page.propTypes = {};

export default Page;
