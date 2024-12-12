import React from 'react';
import styled from 'styled-components';
import {message} from '../../utils/message';
import {urlPath} from '../../utils/url';

export const navItems = [
	{
		label: message.menu.main,
		url: urlPath.base,
		subItems: [],
	},
	{
		label: message.menu.webhooks,
		url: urlPath.webhooks,
		subItems: [],
	},
	{
		label: message.menu.sse,
		url: urlPath.sse,
		subItems: [],
	},
	{
		label: message.menu.tailwind,
		url: urlPath.tailwind,
		subItems: [],
	},
];

function Nav(props) {
	return <NavContainer>Nav</NavContainer>;
}

export default Nav;

const NavContainer = styled.nav`
	grid-area: nav;
	padding: 15px 20px 20px 20px;
	border: 1px solid black;
`;
