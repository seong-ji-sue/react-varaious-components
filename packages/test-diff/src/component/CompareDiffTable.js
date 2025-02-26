import React, {useState} from 'react';
import './CompareDiffTable.scss';
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import TextBoxCell from '../cell/TextBoxCell';
import DiffCell from '../cell/DiffCell';

const compareType = {
	update: 'update',
	delete: 'delete',
	create: 'create',
};

// -------------------------------------------------------------------
// 초기 데이터 (예시)
// -------------------------------------------------------------------
const initialData = [
	{
		key: 'port',
		value: '9000',
		defaultKey: 'port',
		defaultValue: '9000',
		keyState: null,
		valueState: null,
		isDiff: false,
	},
	{
		key: 'url',
		value: '2e',
		defaultKey: 'url',
		defaultValue: '3',
	},
	{
		key: '',
		value: 'jisu-table',
		defaultKey: 'react',
		defaultValue: 'jisu-table',
	},
	{
		key: 'oracle',
		value: 'asd',
		defaultKey: 'mysql',
		defaultValue: '',
	},
	{
		key: '',
		value: '',
		defaultKey: '',
		defaultValue: '',
	},
	{
		key: 'extra.row',
		value: 'extraValue',
		defaultKey: '',
		defaultValue: '',
	},
];

const newCols = [
	{
		accessorKey: 'key',
		header: 'Key',
		cell: ({row, column}) => <TextBoxCell row={row} column={column} />,
	},
	// 왼쪽 value 셀: diffAfter에서 해당 행의 value diff 정보 전달
	{
		accessorKey: 'value',
		header: 'Value',
		cell: ({row, column}) => <TextBoxCell row={row} column={column} />,
	},
];

const prevCols = [
	{
		accessorKey: 'defaultKey',
		header: 'Default Key',
		cell: ({row, column}) => <TextBoxCell row={row} column={column} readOnly />,
	},
	{
		accessorKey: 'defaultValue',
		header: 'Default Value',
		cell: ({row, column}) => <TextBoxCell row={row} column={column} readOnly />,
	},
];

const diffCol = {
	accessorKey: 'action',
	header: () => <DiffCell />,
	cell: ({row}) => <DiffCell row={row} />,
};

const splitVersionArr = (items) => {
	const currentArray = items.map(({key, value}) => ({key, value}));
	// 이전 상태 배열 생성 (beforeKey가 존재하는 항목만 선택)
	const previousArray = items
		.filter(({defaultKey}) => defaultKey)
		.map(({defaultKey, defaultValue}) => ({
			key: defaultKey,
			value: defaultValue,
		}));
	return [currentArray, previousArray];
};

const CompareDiffTable = () => {
	const [isCompare, setIsCompare] = useState(false);

	const table = useReactTable({
		data: initialData,
		columns: [...newCols, ...(isCompare ? [diffCol] : []), ...prevCols],
		getCoreRowModel: getCoreRowModel(),
	});

	const onClickCompare = () => {
		setIsCompare(true);
		const [currentArray, previousArray] = splitVersionArr(initialData);
		console.log(currentArray, previousArray);
		console.log(diff(currentArray, previousArray));
	};

	return (
		<div
			style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
		>
			<div style={{marginBottom: '10px'}}>
				<button style={{marginRight: '10px'}}>Add</button>
				<button>Delete Selected</button>
				{!isCompare && <button onClick={onClickCompare}>Compare</button>}
			</div>
			<table border='1'>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id}>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default CompareDiffTable;
