// Table.jsx

import React, {useState} from 'react';
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import './Table.scss';

const Table = ({data, columns}) => {
	const [columnPinning, setColumnPinning] = useState({
		left: ['name'],
	});
	const table = useReactTable({
		data,
		columns,
		getRowId: (v) => v.id,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnPinning,
		},
		onColumnPinningChange: setColumnPinning,
	});

	return (
		<div className='table-container'>
			<table>
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

export default Table;
