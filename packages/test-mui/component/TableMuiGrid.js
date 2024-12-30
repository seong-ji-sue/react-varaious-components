import React, {useState} from 'react';
import {
	Button,
	TextField,
	Popover,
	MenuItem,
	IconButton,
	Box,
} from '@mui/material';
import {DataGrid, GridToolbar} from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const rowsData = Array.from({length: 30}, (_, index) => ({
	id: index + 1, // DataGrid는 `id` 필드가 필수
	name: `name${index + 1}`,
	versions: index % 10,
	date: `2024-12-${(index % 31) + 1}T${(index % 24)
		.toString()
		.padStart(2, '0')}:00:00Z`,
}));

const formatDate = (dateString) =>
	new Date(dateString).toLocaleString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

const TableMuiGrid = () => {
	const [searchText, setSearchText] = useState('');
	const [filteredRows, setFilteredRows] = useState(rowsData);

	// 검색 핸들러
	const handleSearch = () => {
		const filtered = rowsData.filter((row) =>
			row.name.toLowerCase().includes(searchText.toLowerCase()),
		);
		setFilteredRows(filtered);
	};

	// Popover 상태 관리
	const [anchorEl, setAnchorEl] = useState(null);
	const handlePopoverOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handlePopoverClose = () => {
		setAnchorEl(null);
	};
	const handleMenuAction = (action) => {
		console.log(`${action} clicked`);
		handlePopoverClose();
	};

	// DataGrid 칼럼 정의
	const columns = [
		{field: 'name', headerName: 'Name', flex: 1},
		{
			field: 'versions',
			headerName: 'Versions',
			flex: 1,
			renderCell: (params) => <strong>{params.value}</strong>,
		},
		{
			field: 'date',
			headerName: 'Date',
			flex: 2,
			valueGetter: (params) => {
				// params.row와 date 필드가 존재하는지 확인
				if (!params.row || !params.row.date) return 'N/A';
				return formatDate(params.row.date);
			},
		},
		{
			field: 'actions',
			headerName: 'Actions',
			sortable: false,
			filterable: false,
			renderCell: (params) => (
				<IconButton onClick={handlePopoverOpen}>
					<MoreVertIcon />
				</IconButton>
			),
		},
	];

	return (
		<Box sx={{height: 600, width: '100%'}}>
			{/* 검색 필드 */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					mb: 2,
				}}
			>
				<TextField
					label='Search by Name'
					variant='outlined'
					size='small'
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					sx={{mr: 2}}
				/>
				<Button variant='contained' onClick={handleSearch}>
					Search
				</Button>
			</Box>

			{/* DataGrid */}
			<DataGrid
				rows={filteredRows}
				columns={columns}
				initialState={{pagination: {paginationModel: {page: 0, pageSize: 10}}}}
				pageSizeOptions={[5, 10, 25, 100]}
				disableSelectionOnClick
				components={{
					Toolbar: GridToolbar,
				}}
			/>

			{/* Popover */}
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handlePopoverClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				<MenuItem onClick={() => handleMenuAction('View')}>View</MenuItem>
				<MenuItem onClick={() => handleMenuAction('Delete')}>Delete</MenuItem>
				<MenuItem onClick={() => handleMenuAction('Scripts')}>Scripts</MenuItem>
			</Popover>
		</Box>
	);
};

export default TableMuiGrid;
