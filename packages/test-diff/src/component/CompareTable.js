import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

// TextInput 컴포넌트: 로컬 상태를 사용해 onBlur 시 부모로 commit
const TextInput = React.memo(({initialValue, style, onCommit, inputId}) => {
	const [localValue, setLocalValue] = useState(initialValue);
	const inputRef = useRef(null);

	useEffect(() => {
		setLocalValue(initialValue);
	}, [initialValue]);

	return (
		<input
			ref={inputRef}
			type='text'
			id={inputId}
			value={localValue}
			style={style}
			onChange={(e) => setLocalValue(e.target.value)}
			onBlur={() => onCommit(localValue)}
		/>
	);
});

// 초기 좌측 데이터
const initialLeftData = [
	{idx: 0, key: 'server.por123t', value: '8080'},
	{
		idx: 1,
		key: 'spring.dat123asource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL123=False',
	},
	{idx: 2, key: 'spring.datasource.username', value: 'eddy-am'},
	{idx: 3, key: 'spring.datasource.password', value: 'ewq*23'},
	{idx: 4, key: 'spring.jpa.hibernate.ddl-auto', value: ''},
	{idx: 5, key: 'spring.jpa.hibernate.ddl-auto', value: ''},
];

// 초기 우측 데이터 (좌측과 같은 길이로 기본값 설정)
const initialRightData = [
	{key: 'server.por123t', value: '8081'},
	{
		key: 'spring.datasource.url',
		value: 'jdbc:mysql://192.168.100.3306/eddy?useSSL=False',
	},
	{key: 'spring.datasource.username', value: 'eddy-am'},
	{key: 'spring.datasource.password', value: 'qwelz3!'},
	{key: '', value: ''},
	{key: 'extra.row', value: 'extraValue'},
];

export default function CompareTable() {
	// 좌측과 우측 데이터를 모두 state로 관리
	const [compareData, setCompareData] = useState(initialLeftData);
	const [rightDataState, setRightDataState] = useState(initialRightData);
	const [selectedRows, setSelectedRows] = useState([]);

	// 좌측 데이터 수정: onBlur 시 commit
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

	// Add 버튼: 새 행을 좌측과 우측 데이터 모두에 추가 (기본값은 빈 문자열)
	const handleAddRow = useCallback(() => {
		const newIdx =
			compareData.length > 0
				? Math.max(...compareData.map((d) => d.idx)) + 1
				: 0;
		const newLeftRow = {idx: newIdx, key: '', value: ''};
		const newRightRow = {key: '', value: ''};
		setCompareData((prevData) => [...prevData, newLeftRow]);
		setRightDataState((prevData) => [...prevData, newRightRow]);
	}, [compareData]);

	// 두 데이터셋 중 최대 행 수를 기준으로 행 생성
	const combinedData = useMemo(() => {
		const maxRows = Math.max(compareData.length, rightDataState.length);
		return Array.from({length: maxRows}, (_, idx) => ({idx}));
	}, [compareData, rightDataState]);

	// 하나의 테이블에서 좌측/우측 데이터를 모두 보여줄 열들 구성
	const columns = useMemo(
		() => [
			{
				// 체크박스 열
				accessorKey: 'select',
				header: () => (
					<input
						type='checkbox'
						onChange={(e) => {
							if (e.target.checked) {
								setSelectedRows(combinedData.map((d) => d.idx));
							} else {
								setSelectedRows([]);
							}
						}}
						checked={
							selectedRows.length === combinedData.length &&
							combinedData.length > 0
						}
					/>
				),
				cell: ({row}) => {
					const idx = row.original.idx;
					const checked = selectedRows.includes(idx);
					return (
						<input
							type='checkbox'
							checked={checked}
							onChange={(e) => {
								setSelectedRows((prev) =>
									e.target.checked
										? [...prev, idx]
										: prev.filter((i) => i !== idx),
								);
							}}
						/>
					);
				},
			},
			{
				accessorKey: 'leftKey',
				header: 'Left Key',
				cell: ({row}) => {
					const idx = row.original.idx;
					const leftItem = compareData.find((item) => item.idx === idx);
					const rightItem = rightDataState[idx];
					const value = leftItem ? leftItem.key : '';
					// 하이라이팅: 우측 데이터가 존재하고, 좌측과 값이 다르면 true
					const isDifferent =
						rightItem && leftItem && leftItem.key !== rightItem.key;
					return (
						<TextInput
							inputId={`leftKey-${idx}`}
							initialValue={value}
							style={{backgroundColor: isDifferent ? 'lightgreen' : 'white'}}
							onCommit={(val) => {
								if (leftItem) handleEditKey(idx, val);
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
					const leftItem = compareData.find((item) => item.idx === idx);
					const rightItem = rightDataState[idx];
					const value = leftItem ? leftItem.value : '';
					const isDifferent =
						rightItem && leftItem && leftItem.value !== rightItem.value;
					return (
						<TextInput
							inputId={`leftValue-${idx}`}
							initialValue={value}
							style={{backgroundColor: isDifferent ? 'lightgreen' : 'white'}}
							onCommit={(val) => {
								if (leftItem) handleEditValue(idx, val);
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
					const leftItem = compareData.find((item) => item.idx === idx);
					const rightItem = rightDataState[idx];
					// 하이라이팅 조건: 우측 데이터가 존재하고, 좌측과 우측이 다르면
					const isDifferent =
						leftItem &&
						rightItem &&
						(leftItem.key !== rightItem.key ||
							leftItem.value !== rightItem.value);
					if (!rightItem) return null;
					return isDifferent ? (
						<button
							onClick={() => {
								setCompareData((prevData) =>
									prevData.map((item) =>
										item.idx === idx
											? {...item, key: rightItem.key, value: rightItem.value}
											: item,
									),
								);
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
					const rightItem = rightDataState[idx];
					const leftItem = compareData.find((item) => item.idx === idx);
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
					const rightItem = rightDataState[idx];
					const leftItem = compareData.find((item) => item.idx === idx);
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
		[
			compareData,
			rightDataState,
			combinedData,
			selectedRows,
			handleEditKey,
			handleEditValue,
		],
	);

	const table = useReactTable({
		data: combinedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div
			style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}
		>
			{/* Add 버튼 */}
			<button onClick={handleAddRow} style={{marginBottom: '10px'}}>
				Add
			</button>
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
