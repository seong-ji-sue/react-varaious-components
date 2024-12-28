import React from 'react';
import PropTypes from 'prop-types';
import TextBox from './TextBox';

function Page(props) {
	return (
		<div>
			<h2>동적 스타일링 테스트</h2>
			<TextBox />
		</div>
	);
}

Page.propTypes = {};

export default Page;
