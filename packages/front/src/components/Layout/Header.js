import React from 'react';
import styled from 'styled-components';

function Header(props) {
	return <Container>Header</Container>;
}

export default Header;

const Container = styled.header`
	grid-area: header;
	border: 1px solid black;
	text-align: center;

	display: flex;
	padding: 0 20px;
	align-items: center;
	justify-content: space-between;
`;
