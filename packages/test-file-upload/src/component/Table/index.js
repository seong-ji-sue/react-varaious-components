// Table.jsx

import React, {useState} from 'react';
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import './Table.scss';

// 이 함수는 칼럼 고정을 위한 스타일을 계산합니다.
// 첫 번째 예제 코드의 getCommonPinningStyles와 유사한 역할을 합니다.
const getColumnStyles = (column) => {
	const isPinned = column.getIsPinned();
	const isLastLeftPinnedColumn =
		isPinned === 'left' && column.getIsLastColumn('left');
	const isFirstRightPinnedColumn =
		isPinned === 'right' && column.getIsFirstColumn('right');

	return {
		position: isPinned ? 'sticky' : 'relative',
		left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
		right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
		zIndex: isPinned ? 1 : 0,
		// 그림자 효과로 고정된 칼럼을 시각적으로 구분합니다.
		boxShadow: isLastLeftPinnedColumn
			? '2px 0 5px -2px #888'
			: isFirstRightPinnedColumn
				? '-2px 0 5px -2px #888'
				: undefined,
	};
};

const Table = ({data, columns}) => {
	const [columnPinning, setColumnPinning] = useState({
		left: ['name'],
	});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnPinning,
		},
		onColumnPinningChange: setColumnPinning,
	});

	const exportTableData = () => {
		const finalRows = table.getRowModel().rows;

		const columnIds = table.getVisibleFlatColumns().map((column) => column.id);

		// 3. 데이터를 변환합니다. (행의 배열 -> 행별 셀 값 배열)
		const tableArr = finalRows.map((row) => {
			const rowArray = row.getVisibleCells().map((cell) => {
				return cell.getValue();
			});

			return rowArray;
		});

		// 5. 콘솔에 출력합니다.
		console.log('tableArr', tableArr);
	};

	exportTableData();

	return (
		<div className='table-container'>
			<table style={{width: table.getTotalSize()}}>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const {column} = header;
								return (
									<th
										key={header.id}
										colSpan={header.colSpan}
										style={{...getColumnStyles(column)}}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => {
								const {column} = cell;
								return (
									<td key={cell.id} style={{...getColumnStyles(column)}}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Table;
