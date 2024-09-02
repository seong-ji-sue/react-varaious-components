import React from 'react';
import styled from 'styled-components';

function Nav(props) {
	return <NavContainer>Nav</NavContainer>;
}

export default Nav;

const NavContainer = styled.nav`
	grid-area: nav;
	padding: 15px 20px 20px 20px;
	border: 1px solid black;
`;
