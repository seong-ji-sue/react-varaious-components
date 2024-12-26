import React from 'react';
import ButtonEx from '../component/ButtonEx';
import {Container, ThemeProvider, Typography} from '@mui/material';
import theme from './theme';
import FieldEx from '../component/FieldEx';
function Page(props) {
	return (
		<ThemeProvider theme={theme}>
			<Container maxWidth={'xl'}>
				<Typography variant={'h6'}>버튼</Typography>
				<ButtonEx />
				<Typography variant={'h6'}>필드</Typography>
				<FieldEx />
			</Container>
		</ThemeProvider>
	);
}

Page.propTypes = {};

export default Page;
