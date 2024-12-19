import React, {useState} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {useLocation} from 'react-router-dom';
import {message} from '@jsproject/common/src/utils/message';
import {urlPath} from '@jsproject/common/src/utils/url';
import {
	GREY,
	LIGHT_GREY,
	SIZE_10,
	SIZE_16,
	SIZE_8,
	WHITE,
} from '@jsproject/common/src/utils/color';

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

function Nav({navigate}) {
	const [openMenu, setOpenMenu] = useState({});
	const {pathname} = useLocation();

	const renderSubItems = (items, parentKey) => {
		return items.map((item) => {
			const isSelected =
				item.subItems?.length || item.url === urlPath.base
					? pathname === item.url
					: pathname.startsWith(item.url);
			return (
				<_NavItem key={`nav-${item.label}`}>
					<_NavMenu $isSelected={isSelected} onClick={() => navigate(item.url)}>
						{item.label}
					</_NavMenu>
				</_NavItem>
			);
		});
	};

	return (
		<_NavContainer>
			<_TitleContainer>
				<_Title>Test Project</_Title>
			</_TitleContainer>
			<div>{renderSubItems(navItems)}</div>
		</_NavContainer>
	);
}

Nav.propTypes = {
	navigate: PropTypes.func,
};

export default Nav;

const _NavContainer = styled.nav`
	grid-area: nav;
	padding: 15px 20px 20px 20px;
	border: 1px solid black;
`;

const _TitleContainer = styled.div`
	height: 35px;
	margin-bottom: 15px;
`;

const _Title = styled.h3`
	font-weight: bold;
	width: fit-content;
`;

export const _NavItem = styled.div`
	padding: 5px 0;
`;

export const _NavMenu = styled.button`
	display: flex;
	justify-content: space-between;
	width: 100%;
	background: ${(props) => (props.$isSelected ? GREY : 'none')};
	border: none;
	color: ${(props) => (props.$isSelected ? WHITE : 'inherit')};
	padding: ${SIZE_8};
	cursor: pointer;
	text-align: left;
	border-radius: ${SIZE_10};
	font-size: ${SIZE_16};
	font-weight: ${(props) => !props.$length && '800'};
	&:focus {
		outline: none;
	}
	&:hover {
		background-color: ${(props) => (props.$isSelected ? GREY : LIGHT_GREY)};
	}
	div {
		color: inherit;
	}
`;
