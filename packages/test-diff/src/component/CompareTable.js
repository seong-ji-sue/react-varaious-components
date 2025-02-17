import React, {useState, useMemo, useCallback} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

const initialLeftData = [
	{key: 'server.port', value: '8080'},
	{
		key: 'spring.datasource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL123=False',
	},
	{key: 'spring.datasource.username', value: 'eddy-am'},
	{key: 'spring.datasource.password', value: 'ewq*23'},
	{key: 'spring.jpa.hibernate.ddl-auto', value: ''},
];

const initialRightData = [
	{key: 'server.port', value: '8081'},
	{
		key: 'spring.datasource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL=False',
	},
	{key: 'spring.datasource.username', value: 'eddy-am'},
	{key: 'spring.datasource.password', value: 'qwelz3!'},
	{key: 'spring.jpa.hibernate.ddl-auto', value: 'update'},
];

const CompareTable = (props) => {
	// ✅ 비교 데이터 상태 (New Value: 최신 데이터, Old Value: 기존 데이터)
	const [compareData, setCompareData] = useState(
		initialLeftData.map((item) => {
			const rightItem = initialRightData.find((r) => r.key === item.key);
			return {
				key: item.key,
				newValue: item.value,
				oldValue: rightItem?.value || '',
			};
		}),
	);

	// ✅ << 버튼 클릭 시 New Value를 Old Value로 변경
	const handleUpdate = useCallback((key, oldValue) => {
		setCompareData((prevData) =>
			prevData.map((item) =>
				item.key === key ? {...item, newValue: oldValue} : item,
			),
		);
	}, []);

	// ✅ 테이블 컬럼 정의 (Key → New Value → Action → Old Value)
	const columns = useMemo(
		() => [
			{
				accessorKey: 'key',
				header: 'Key',
			},
			{
				accessorKey: 'newValue',
				header: 'New Value',
				cell: ({row}) => (
					<span
						style={{
							backgroundColor:
								row.original.oldValue !== row.original.newValue
									? '#e6ffed'
									: 'transparent',
						}}
					>
						{row.original.newValue}
					</span>
				),
			},
			{
				accessorKey: 'action',
				header: 'Action',
				cell: ({row}) => {
					const isDifferent = row.original.oldValue !== row.original.newValue;

					return isDifferent ? (
						<button
							onClick={() =>
								handleUpdate(row.original.key, row.original.oldValue)
							}
						>
							{'<<'}
						</button>
					) : null;
				},
			},
			{
				accessorKey: 'oldValue',
				header: 'Old Value',
				cell: ({row}) => (
					<span
						style={{
							backgroundColor:
								row.original.oldValue !== row.original.newValue
									? '#ffebeb'
									: 'transparent',
						}}
					>
						{row.original.oldValue}
					</span>
				),
			},
		],
		[handleUpdate],
	);

	const table = useReactTable({
		data: compareData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
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

CompareTable.propTypes = {};

export default CompareTable;
