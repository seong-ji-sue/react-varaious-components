import React, {useState, useMemo, useCallback} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

// 좌측 데이터 (수정 가능한 데이터)
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

// 우측 데이터 (비교 대상, 수정 불가)
const rightData = [
	{key: 'server.por123t', value: '8081'},
	{
		key: 'spring.datasource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL=False',
	},
	{key: 'spring.datasource.username', value: 'eddy-am'},
	{key: 'spring.datasource.password', value: 'qwelz3!'},
	{key: '', value: ''},
	// 우측에 추가 행이 있는 경우:
	{key: 'extra.row', value: 'extraValue'},
];

export default function CompareTable() {
	const [compareData, setCompareData] = useState(initialLeftData);

	// 좌측 데이터 수정 시 idx를 기준으로 업데이트
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

	// 두 데이터셋 중 행 개수가 더 큰 값으로 테이블의 행을 구성합니다.
	const combinedData = useMemo(() => {
		const maxRows = Math.max(compareData.length, rightData.length);
		return Array.from({length: maxRows}, (_, idx) => ({idx}));
	}, [compareData, rightData]);

	// 하나의 테이블에서 좌측/우측 데이터를 모두 보여줄 5개의 열을 구성합니다.
	const columns = useMemo(
		() => [
			{
				accessorKey: 'leftKey',
				header: 'Left Key',
				cell: ({row}) => {
					const idx = row.original.idx;
					const leftItem = compareData[idx];
					const rightItem = rightData[idx];
					const value = leftItem ? leftItem.key : '';
					const isDifferent =
						rightItem && leftItem && rightItem.key !== leftItem.key;
					return (
						<input
							type='text'
							value={value}
							style={{backgroundColor: isDifferent ? 'lightgreen' : 'white'}}
							onChange={(e) => {
								if (leftItem) {
									handleEditKey(idx, e.target.value);
								}
							}}
						/>
					);
				},
			},
			{
				accessorKey: 'leftValue',
				header: 'Left Value',
				cell: ({row}) => {
					const idx = row.original.idx;
					const leftItem = compareData[idx];
					const rightItem = rightData[idx];
					const value = leftItem ? leftItem.value : '';
					const isDifferent =
						rightItem && leftItem && rightItem.value !== leftItem.value;
					return (
						<input
							type='text'
							value={value}
							style={{backgroundColor: isDifferent ? 'lightgreen' : 'white'}}
							onChange={(e) => {
								if (leftItem) {
									handleEditValue(idx, e.target.value);
								}
							}}
						/>
					);
				},
			},
			{
				accessorKey: 'action',
				header: 'Action',
				cell: ({row}) => {
					const idx = row.original.idx;
					const leftItem = compareData[idx];
					const rightItem = rightData[idx];
					// diff: 좌측 데이터가 없거나, 값이 다르면 diff 버튼 활성화
					const isDifferent =
						!leftItem ||
						(rightItem &&
							(leftItem.key !== rightItem.key ||
								leftItem.value !== rightItem.value));
					if (!rightItem) return null;
					return isDifferent ? (
						<button
							onClick={() => {
								setCompareData((prevData) => {
									// 좌측 데이터가 없다면 추가, 있다면 업데이트
									if (!prevData.find((item) => item.idx === idx)) {
										return [
											...prevData,
											{idx, key: rightItem.key, value: rightItem.value},
										];
									} else {
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
				accessorKey: 'rightKey',
				header: 'Right Key',
				cell: ({row}) => {
					const idx = row.original.idx;
					const leftItem = compareData[idx];
					const rightItem = rightData[idx];
					const value = rightItem ? rightItem.key : '';
					const isDifferent =
						leftItem && rightItem && leftItem.key !== rightItem.key;
					return (
						<span
							style={{
								backgroundColor: isDifferent ? 'lightcoral' : 'white',
								padding: '2px',
							}}
						>
							{value}
						</span>
					);
				},
			},
			{
				accessorKey: 'rightValue',
				header: 'Right Value',
				cell: ({row}) => {
					const idx = row.original.idx;
					const leftItem = compareData[idx];
					const rightItem = rightData[idx];
					const value = rightItem ? rightItem.value : '';
					const isDifferent =
						leftItem && rightItem && leftItem.value !== rightItem.value;
					return (
						<span
							style={{
								backgroundColor: isDifferent ? 'lightcoral' : 'white',
								padding: '2px',
							}}
						>
							{value}
						</span>
					);
				},
			},
		],
		[compareData, rightData, handleEditKey, handleEditValue],
	);

	const table = useReactTable({
		data: combinedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div style={{display: 'flex', justifyContent: 'center'}}>
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
}
