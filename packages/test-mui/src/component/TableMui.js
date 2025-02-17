import React, {useState} from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	TextField,
	Button,
	TablePagination,
	Popover,
	MenuItem,
	TableSortLabel,
	Checkbox,
	FormGroup,
	FormControlLabel,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import dayjs from 'dayjs';

const formatDate = (dateString) => dayjs(dateString).format('YYYY-M-D H:m:s');

//행 관련 데이터(몫) 30개 세팅
const rowsData = Array.from({length: 30}, (_, index) => ({
	name: `name${index + 1}`,
	versions: index % 10,
	date: `2024-12-${(index % 31) + 1}T${(index % 24)
		.toString()
		.padStart(2, '0')}:00:00Z`,
}));

//칼럼 데이터
const initialColumns = [
	{header: 'Name', field: 'name', render: (row) => row.name, visible: true},
	{
		header: 'Versions',
		field: 'versions',
		render: (row) => <strong>{row.versions}</strong>,
		visible: true,
	},
	{
		header: 'Date',
		field: 'date',
		render: (row) => formatDate(row.date),
		visible: true,
	},
];

const TableMui = () => {
	//칼럼 행
	const [rows, setRows] = useState(rowsData); // 전체 데이터
	const [columns, setColumns] = useState(initialColumns); // 칼럼 정보
	const toggleColumnVisibility = (field) => {
		setColumns((prevColumns) =>
			prevColumns.map((col) =>
				col.field === field ? {...col, visible: !col.visible} : col,
			),
		);
	};

	//검색
	const [searchText, setSearchText] = useState('');
	const handleSearch = () => {
		const filtered = rowsData.filter((row) =>
			row.name.toLowerCase().includes(searchText.toLowerCase()),
		);
		setRows(filtered);
		setPage(0); // 검색 시 첫 페이지로 이동
	};
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			handleSearch(); // 엔터 키로 검색 실행
		}
	};

	//페이지
	const [page, setPage] = useState(0); //몇 페이지인지
	const [rowsPerPage, setRowsPerPage] = useState(10); //몇개씩 보여줄껀지
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const paginatedRows = rows.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	//정렬
	const [sortConfig, setSortConfig] = useState({field: null, direction: 'asc'});
	const handleSort = (field) => {
		if (!field) return;
		const isAsc = sortConfig.field === field && sortConfig.direction === 'asc';
		const direction = isAsc ? 'desc' : 'asc';
		setSortConfig({field, direction});

		const sortedRows = [...rows].sort((a, b) => {
			if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
			if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
			return 0;
		});
		setRows(sortedRows);
	};

	//popper
	const [anchorEl, setAnchorEl] = useState(null); // Popover 상태
	const handlePopoverOpen = (event) => {
		setAnchorEl(event.currentTarget); // 클릭한 버튼의 위치를 기준으로 Popover를 띄움
	};
	const handlePopoverClose = () => {
		setAnchorEl(null); // Popover 닫기
	};
	const handleMenuAction = (action) => {
		console.log(`${action} clicked`);
		handlePopoverClose(); // 메뉴 클릭 시 Popover 닫기
	};

	// 렌더링
	return (
		<Paper>
			{/* 검색 필드 */}
			<div style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
				<TextField
					label='Search by Name'
					variant='outlined'
					size='small'
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={handleKeyDown}
					style={{marginRight: '16px', flex: 1}}
				/>
				<Button variant='default' onClick={handleSearch}>
					New
				</Button>
			</div>

			{/* 칼럼 가시성 제어 */}
			<div style={{padding: '16px'}}>
				<FormGroup row>
					{columns.map((col, index) => (
						<FormControlLabel
							key={index}
							control={
								<Checkbox
									checked={col.visible}
									onChange={() => toggleColumnVisibility(col.field)}
								/>
							}
							label={col.header}
						/>
					))}
				</FormGroup>
			</div>

			{/* 테이블 */}
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							{columns
								.filter((col) => col.visible)
								.map((col, index) => (
									<TableCell
										key={index}
										onClick={() => handleSort(col.field)}
										style={{cursor: col.field ? 'pointer' : 'default'}}
									>
										<TableSortLabel
											active={sortConfig.field === col.field}
											direction={
												sortConfig.field === col.field
													? sortConfig.direction
													: 'asc'
											}
										>
											{col.header}
										</TableSortLabel>
									</TableCell>
								))}
							<TableCell>
								<SettingsIcon />
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedRows.map((row, rowIndex) => (
							<TableRow key={rowIndex}>
								{columns
									.filter((col) => col.visible)
									.map((col, colIndex) => (
										<TableCell key={colIndex}>{col.render(row)}</TableCell>
									))}
								<TableCell>
									<IconButton onClick={handlePopoverOpen}>
										<MoreVertIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* 페이지네이션 */}
			<TablePagination
				component='div'
				count={rows.length}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
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
		</Paper>
	);
};

export default TableMui;
