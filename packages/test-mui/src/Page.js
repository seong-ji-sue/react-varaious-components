import React from 'react';
import ButtonEx from './component/ButtonEx';
import {Container, ThemeProvider, Typography} from '@mui/material';
import theme from './theme';
import FieldEx from './component/FieldEx';
import AlertEx from './component/AlertEx';
import TableEx from './component/TableEx';
import DynamicLayoutEx from './component/DynamicLayoutEx';
function Page(props) {
	return (
		<ThemeProvider theme={theme}>
			<Container maxWidth={'xl'}>
				<Typography variant={'h6'}>버튼</Typography>
				<ButtonEx />
				<Typography variant={'h6'}>필드</Typography>
				<FieldEx />
				<Typography variant={'h6'}>알림창</Typography>
				<AlertEx />
				<Typography variant={'h6'}>테이블</Typography>
				<TableEx />
				{/*<Typography variant={'h6'}>반응형</Typography>*/}
				{/*<DynamicLayoutEx />*/}
			</Container>
		</ThemeProvider>
	);
}

Page.propTypes = {};

export default Page;
