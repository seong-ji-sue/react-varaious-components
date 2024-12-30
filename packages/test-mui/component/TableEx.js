import React, {useState} from 'react';
import {Stack} from '@mui/material';
import TableMui from './TableMui';
import TableMuiGrid from './TableMuiGrid';

const TableEx = () => {
	//칼럼 행
	return (
		<Stack spacing={2}>
			<TableMui />
			<TableMuiGrid />
		</Stack>
	);
};

export default TableEx;
