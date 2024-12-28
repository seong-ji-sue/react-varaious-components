import React from 'react';
import PropTypes from 'prop-types';
import TextBoxTW from './library/TextBoxTW';
import TextBoxNon from './library/TextBoxNon';
import TextBoxClassnames from './library/TextBoxClassnames';

function Page(props) {
	return (
		<div>
			<h2>동적 스타일링 테스트</h2>
			<TextBoxTW />
			<TextBoxNon />
			<TextBoxClassnames />
		</div>
	);
}

Page.propTypes = {};

export default Page;
