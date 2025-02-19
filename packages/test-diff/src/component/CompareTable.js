import React, {useState, useMemo, useCallback} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

// 초기 leftData에 idx를 추가합니다.
const initialLeftData = [
	{idx: 0, key: 'server.por123t', value: '8080'},
	{
		idx: 1,
		key: 'spring.dat123asource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL123=False',
	},
	{
		idx: 2,
		key: 'spring.datasource.username',
		value: 'eddy-am',
	},
	{
		idx: 3,
		key: 'spring.datasource.password',
		value: 'ewq*23',
	},
	{
		idx: 4,
		key: 'spring.jpa.hibernate.ddl-auto',
		value: '',
	},
	{
		idx: 5,
		key: 'spring.jpa.hibernate.ddl-auto',
		value: '',
	},
];

const rightData = [
	{key: 'server.por123t', value: '8081'},
	{
		key: 'spring.datasource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL=False',
	},
	{key: 'spring.datasource.username', value: 'eddy-am'},
	{key: 'spring.datasource.password', value: 'qwelz3!'},
	{key: '', value: ''},
	// 예를 들어 우측 데이터에 추가 행이 있다고 가정할 경우:
	{key: 'extra.row', value: 'extraValue'},
];

export default function CompareTable() {
	const [compareData, setCompareData] = useState(initialLeftData);

	// 좌측 데이터 수정 시 인덱스를 기준으로 업데이트
	const handleEditValue = useCallback((idx, newValue) => {
		setCompareData((prevData) =>
			prevData.map((item) =>
				item.idx === idx ? {...item, value: newValue} : item,
			),
		);
	}, []);

	const handleEditKey = useCallback((idx, newKey) => {
		setCompareData((prevData) =>
			prevData.map((item) =>
				item.idx === idx ? {...item, key: newKey} : item,
			),
		);
	}, []);

	// 좌측 테이블 컬럼: 인덱스(idx)를 사용하여 우측 데이터와 비교
	const leftColumns = useMemo(
		() => [
			{
				accessorKey: 'key',
				header: 'Key',
				cell: ({row}) => {
					const {idx, key} = row.original;
					const rightItem = rightData[idx];
					const isDifferent = !rightItem || rightItem.key !== key;
					return (
						<input
							type='text'
							value={key}
							style={{backgroundColor: isDifferent ? 'lightgreen' : 'white'}}
							onChange={(e) => handleEditKey(idx, e.target.value)}
						/>
					);
				},
			},
			{
				accessorKey: 'value',
				header: 'Value',
				cell: ({row}) => {
					const {idx, value} = row.original;
					const rightItem = rightData[idx];
					const isDifferent = !rightItem || rightItem.value !== value;
					return (
						<input
							type='text'
							value={value}
							style={{backgroundColor: isDifferent ? 'lightgreen' : 'white'}}
							onChange={(e) => handleEditValue(idx, e.target.value)}
						/>
					);
				},
			},
		],
		[handleEditKey, handleEditValue],
	);

	// 우측 테이블 컬럼: row.index를 사용하여 좌측 데이터(compareData)와 비교
	const rightColumns = useMemo(
		() => [
			{
				accessorKey: 'action',
				header: 'Action',
				cell: ({row}) => {
					const idx = row.index;
					// 좌측 데이터가 없으면 leftItem은 undefined
					const leftItem = compareData[idx];
					const rightItem = rightData[idx];
					// 행이 누락되었거나 값이 다르면 diff 적용
					const isDifferent =
						!leftItem ||
						leftItem.key !== rightItem.key ||
						leftItem.value !== rightItem.value;

					return isDifferent ? (
						<button
							onClick={() => {
								setCompareData((prevData) => {
									// 만약 해당 idx에 좌측 데이터가 없다면, 추가합니다.
									if (!prevData.find((item) => item.idx === idx)) {
										// 새 배열로 추가 (배열 순서가 idx 기준으로 정렬되어 있다고 가정)
										return [
											...prevData,
											{idx, key: rightItem.key, value: rightItem.value},
										];
									} else {
										// 이미 존재하면 해당 행을 업데이트합니다.
										return prevData.map((item) =>
											item.idx === idx
												? {...item, key: rightItem.key, value: rightItem.value}
												: item,
										);
									}
								});
							}}
						>
							{'<<'}
						</button>
					) : null;
				},
			},
			{
				accessorKey: 'key',
				header: 'Key',
				cell: ({row}) => {
					const idx = row.index;
					const leftItem = compareData[idx];
					// 만약 좌측 항목이 없다면 diff 처리
					const isDifferent = !leftItem || leftItem.key !== row.original.key;
					return (
						<span
							style={{
								backgroundColor: isDifferent ? 'lightcoral' : 'white',
								padding: '2px',
							}}
						>
							{row.original.key}
						</span>
					);
				},
			},
			{
				accessorKey: 'value',
				header: 'Value',
				cell: ({row}) => {
					const idx = row.index;
					const leftItem = compareData[idx];
					const isDifferent =
						!leftItem || leftItem.value !== row.original.value;
					return (
						<span
							style={{
								backgroundColor: isDifferent ? 'lightcoral' : 'white',
								padding: '2px',
							}}
						>
							{row.original.value}
						</span>
					);
				},
			},
		],
		[compareData],
	);

	// 테이블 생성
	const leftTable = useReactTable({
		data: compareData,
		columns: leftColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const rightTable = useReactTable({
		data: rightData,
		columns: rightColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div style={{display: 'flex', justifyContent: 'center', gap: '20px'}}>
			{/* 좌측 테이블 */}
			<table border='1'>
				<thead>
					{leftTable.getHeaderGroups().map((headerGroup) => (
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
					{leftTable.getRowModel().rows.map((row) => (
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

			{/* 우측 테이블 */}
			<table border='1'>
				<thead>
					{rightTable.getHeaderGroups().map((headerGroup) => (
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
					{rightTable.getRowModel().rows.map((row) => (
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
}
