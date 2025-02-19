import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

// TextInput 컴포넌트: 로컬 상태를 사용해 onBlur 시 부모로 commit
const TextInput = React.memo(
	({initialValue, style, onCommit, inputId, readOnly}) => {
		const [localValue, setLocalValue] = useState(initialValue);
		const inputRef = useRef(null);

		useEffect(() => {
			setLocalValue(initialValue);
		}, [initialValue]);

		if (readOnly) {
			return <span style={{...style, padding: '4px'}}>{localValue}</span>;
		}

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
	},
);

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
	// 좌측과 우측 데이터를 모두 state로 관리 (좌측 데이터에 deleted 플래그 포함)
	const [compareData, setCompareData] = useState(initialLeftData);
	const [rightDataState, setRightDataState] = useState(initialRightData);
	const [selectedRows, setSelectedRows] = useState([]);

	// 좌측 데이터 수정: onBlur 시 commit (삭제된 행은 수정하지 않음)
	const handleEditValue = useCallback((idx, newValue) => {
		setCompareData((prevData) =>
			prevData.map((item) =>
				item.idx === idx && !item.deleted ? {...item, value: newValue} : item,
			),
		);
	}, []);

	const handleEditKey = useCallback((idx, newKey) => {
		setCompareData((prevData) =>
			prevData.map((item) =>
				item.idx === idx && !item.deleted ? {...item, key: newKey} : item,
			),
		);
	}, []);

	// Add 버튼: 새 행을 좌측과 우측 데이터 모두에 추가 (기본값은 빈 문자열, deleted: false)
	const handleAddRow = useCallback(() => {
		const newIdx =
			compareData.length > 0
				? Math.max(...compareData.map((d) => d.idx)) + 1
				: 0;
		const newLeftRow = {idx: newIdx, key: '', value: '', deleted: false};
		const newRightRow = {key: '', value: ''};
		setCompareData((prevData) => [...prevData, newLeftRow]);
		setRightDataState((prevData) => [...prevData, newRightRow]);
	}, [compareData]);

	// Delete Selected 버튼: 선택된 행에 대해 삭제 처리
	const handleDeleteSelected = useCallback(() => {
		// 새 배열을 구성하면서, 선택된 행에 대해 처리
		const newLeft = [];
		const newRight = [];
		// 두 데이터셋의 최대 행 수 기준으로 순회
		const maxRows = Math.max(compareData.length, rightDataState.length);
		for (let i = 0; i < maxRows; i++) {
			// 각 배열의 값 (없으면 undefined)
			const leftItem = compareData[i];
			const rightItem = rightDataState[i];
			// 만약 해당 행이 선택된 (선택된 idx 목록에 leftItem.idx 포함) 경우
			if (leftItem && selectedRows.includes(leftItem.idx)) {
				// 우측 데이터가 존재하고, RightKey와 RightValue가 모두 빈 문자열이면 완전 삭제
				if (
					rightItem &&
					rightItem.key.trim() === '' &&
					rightItem.value.trim() === ''
				) {
					// 해당 행은 건너뜁니다.
					continue;
				} else {
					// 우측 데이터에 값이 하나라도 있으면 삭제 대신 "delete" 표시
					newLeft.push({
						...leftItem,
						key: 'delete',
						value: 'delete',
						deleted: true,
					});
					newRight.push(rightItem || {key: '', value: ''});
				}
			} else {
				// 선택되지 않은 행은 그대로 유지
				if (leftItem) newLeft.push(leftItem);
				if (rightItem) newRight.push(rightItem);
			}
		}
		// 재인덱싱: 새 배열의 각 행에 대해 idx를 순차적으로 부여
		const reIndexedLeft = newLeft.map((item, i) => ({...item, idx: i}));
		// reIndexedRight: 단순히 배열 순서를 유지 (우측 데이터는 idx가 없으므로 그대로 사용)
		const reIndexedRight = newRight;
		setCompareData(reIndexedLeft);
		setRightDataState(reIndexedRight);
		setSelectedRows([]);
	}, [compareData, rightDataState, selectedRows]);

	// 두 데이터셋 중 최대 행 수를 기준으로 행 생성 (각 행은 idx를 포함)
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
					if (leftItem && leftItem.deleted) {
						return (
							<span style={{backgroundColor: 'lightgray', padding: '4px'}}>
								delete
							</span>
						);
					}
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
							readOnly={false}
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
					if (leftItem && leftItem.deleted) {
						return (
							<span style={{backgroundColor: 'lightgray', padding: '4px'}}>
								delete
							</span>
						);
					}
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
							readOnly={false}
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
					if (!rightItem || (leftItem && leftItem.deleted)) return null;
					const isDifferent =
						leftItem &&
						rightItem &&
						(leftItem.key !== rightItem.key ||
							leftItem.value !== rightItem.value);
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
			<div style={{marginBottom: '10px'}}>
				<button onClick={handleAddRow} style={{marginRight: '10px'}}>
					Add
				</button>
				<button onClick={handleDeleteSelected}>Delete Selected</button>
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
}
