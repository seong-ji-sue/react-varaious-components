import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Nav from './Nav';

function Layout({children}) {
	return (
		<GridContainer>
			<Header />
			<Nav />
			<ContentContainer>{children}</ContentContainer>
		</GridContainer>
	);
}

export default Layout;

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 250px 1fr;
	grid-template-rows: 50px 1fr;
	grid-template-areas:
		'nav header'
		'nav content';
	height: 100vh;
`;

const ContentContainer = styled.main`
	grid-area: content;
	padding: 20px;
	overflow: auto;
	min-width: 500px;
`;
