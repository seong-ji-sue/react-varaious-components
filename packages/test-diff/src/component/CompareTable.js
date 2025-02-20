import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

// -------------------------------------------------------------------
// TextInput 컴포넌트 (통합 버전)
// - diffField prop을 추가하여, 현재 필드와 비교할 대상 필드를 분리함
// -------------------------------------------------------------------
const TextInput = React.memo((props) => {
	const {
		initialValue,
		style = {},
		onCommit,
		inputId,
		readOnly,
		diffValue,
		diffColor = 'white',
		// cell 모드용 props
		row,
		data,
		otherData,
		field,
		diffField, // 비교할 대상 필드 (없으면 field 그대로)
	} = props;

	let computedInitialValue = initialValue;
	let computedInputId = inputId;
	let computedDiffValue = diffValue;
	let computedReadOnly = readOnly;
	if (row && data && field) {
		const idx = row.original.idx;
		const item = data.find((item) => item.idx === idx) || {};
		const otherItem =
			(otherData && otherData.find((item) => item.idx === idx)) || {};
		computedInitialValue = item[field] || '';
		const fieldToCompare = diffField || field;
		computedDiffValue = otherItem[fieldToCompare] || '';
		computedInputId = `${field}-${idx}`;
		computedReadOnly = readOnly;
	}

	const [localValue, setLocalValue] = useState(computedInitialValue);
	const inputRef = useRef(null);

	useEffect(() => {
		setLocalValue(computedInitialValue);
	}, [computedInitialValue]);

	const effectiveValue = computedReadOnly ? computedInitialValue : localValue;
	const backgroundColor =
		computedDiffValue !== undefined
			? effectiveValue !== computedDiffValue
				? diffColor
				: 'none'
			: style.backgroundColor || 'none';
	const mergedStyle = {...style, backgroundColor};

	if (computedReadOnly) {
		return (
			<span style={{...mergedStyle, padding: '4px'}}>
				{computedInitialValue}
			</span>
		);
	}

	return (
		<input
			ref={inputRef}
			type='text'
			id={computedInputId}
			value={localValue}
			style={mergedStyle}
			onChange={(e) => setLocalValue(e.target.value)}
			onBlur={() => {
				if (onCommit) {
					onCommit(row.original.idx, localValue);
				}
			}}
		/>
	);
});

// -------------------------------------------------------------------
// DiffButton 컴포넌트: 행 단위 및 전체 diff 처리
// -------------------------------------------------------------------
const DiffButton = ({
	row,
	data,
	setData,
	overallDiffExists,
	onClick,
	title,
	style,
}) => {
	// 행 diff 모드: row가 있으면 좌측(key, value)와 우측(beforeKey, beforeValue)를 비교
	// diff 실행 시 좌측을 우측 값으로 덮어씀.
	if (row && data && setData) {
		const idx = row.original.idx;
		const item = data.find((item) => item.idx === idx);
		if (!item) return null;
		const isDifferent =
			item.key !== item.beforeKey || item.value !== item.beforeValue;
		if (!isDifferent) return null;
		const handleRowDiff = () => {
			setData((prevData) =>
				prevData.map((it) =>
					it.idx === idx
						? {...it, key: it.beforeKey, value: it.beforeValue}
						: it,
				),
			);
		};
		return (
			<button onClick={handleRowDiff} title={title} style={style}>
				{'<<'}
			</button>
		);
	}

	// 전체 diff 모드: row가 없으면 전체 행에 대해 diff가 있으면 onClick 실행
	if (overallDiffExists === false) {
		return <button style={{...style, visibility: 'hidden'}}>{'<<'}</button>;
	}
	return (
		<button onClick={onClick} title={title} style={style}>
			{'<<'}
		</button>
	);
};

// -------------------------------------------------------------------
// 초기 데이터: 하나의 배열로 { key, value, beforeKey, beforeValue } 구성
// -------------------------------------------------------------------
const initialData = [
	{
		idx: 0,
		key: 'server.port',
		value: '9000',
		beforeKey: 'server.port',
		beforeValue: '9000',
	},
	{
		idx: 1,
		key: 'spring.datasource.url',
		value: 'jdbc:maria://192.159.101.3326/jisu?useSSL123=False',
		beforeKey: 'spring.datasource.url',
		beforeValue: 'jdbc:oraclesql://192.159.101.3326/jisu?useSSL123=False',
	},
	{
		idx: 2,
		key: 'spring.datasource.username',
		value: 'jisu-table',
		beforeKey: 'spring.datasource.username',
		beforeValue: 'jisu-diff',
	},
	{
		idx: 3,
		key: 'spring.datasource.pw',
		value: 'asd',
		beforeKey: 'spring.datasource.password',
		beforeValue: '123123',
	},
	{
		idx: 4,
		key: '',
		value: '',
		beforeKey: '',
		beforeValue: '',
	},
	{
		idx: 5,
		key: 'extra.row',
		value: 'extraValue',
		beforeKey: '',
		beforeValue: '',
	},
];

// -------------------------------------------------------------------
// CompareTable 컴포넌트 (단일 배열 사용)
// -------------------------------------------------------------------
export default function CompareTable() {
	const [tableData, setTableData] = useState(initialData);
	const [selectedRows, setSelectedRows] = useState([]);

	// 왼쪽(key, value) 편집 핸들러
	const handleEditKey = useCallback((idx, newValue) => {
		setTableData((prevData) =>
			prevData.map((item) =>
				item.idx === idx ? {...item, key: newValue} : item,
			),
		);
	}, []);

	const handleEditValue = useCallback((idx, newValue) => {
		setTableData((prevData) =>
			prevData.map((item) =>
				item.idx === idx ? {...item, value: newValue} : item,
			),
		);
	}, []);

	// 행 추가: 새로운 행은 모든 필드를 빈 문자열로 설정
	const handleAddRow = useCallback(() => {
		const newIdx =
			tableData.length > 0 ? Math.max(...tableData.map((d) => d.idx)) + 1 : 0;
		const newRow = {
			idx: newIdx,
			key: '',
			value: '',
			beforeKey: '',
			beforeValue: '',
		};
		setTableData((prevData) => [...prevData, newRow]);
	}, [tableData]);

	// 선택된 행 삭제:
	// 우측(beforeKey, beforeValue)이 모두 없는 경우엔 행 전체를 삭제,
	// 하나라도 있으면 좌측 데이터(key, value)만 빈 문자열로 업데이트
	const handleDeleteSelected = useCallback(() => {
		const newData = tableData.reduce((acc, item) => {
			if (selectedRows.includes(item.idx)) {
				// 우측 데이터가 모두 없는 경우
				if (!item.beforeKey.trim() && !item.beforeValue.trim()) {
					return acc; // 해당 행 삭제
				} else {
					// 하나라도 존재하면 좌측 데이터만 삭제
					acc.push({...item, key: '', value: ''});
					return acc;
				}
			} else {
				acc.push(item);
				return acc;
			}
		}, []);
		// 재정렬
		const reIndexed = newData.map((item, i) => ({...item, idx: i}));
		setTableData(reIndexed);
		setSelectedRows([]);
	}, [tableData, selectedRows]);

	// 전체 diff: 모든 행의 좌측 현재 값(key, value)을 우측의 기준값(beforeKey, beforeValue)으로 업데이트
	const handleOverallDiff = useCallback(() => {
		setTableData((prevData) =>
			prevData.map((item) => ({
				...item,
				key: item.beforeKey,
				value: item.beforeValue,
			})),
		);
	}, []);

	// 전체 diff 존재 여부: 하나라도 좌측과 우측 값이 다른 행이 있으면 true
	const overallDiffExists = useMemo(() => {
		return tableData.some(
			(item) => item.key !== item.beforeKey || item.value !== item.beforeValue,
		);
	}, [tableData]);

	// 테이블 컬럼 구성 (왼쪽: key, value / 오른쪽: beforeKey, beforeValue)
	const columns = useMemo(
		() => [
			{
				accessorKey: 'select',
				header: () => (
					<input
						type='checkbox'
						onChange={(e) => {
							if (e.target.checked) {
								setSelectedRows(tableData.map((d) => d.idx));
							} else {
								setSelectedRows([]);
							}
						}}
						checked={
							selectedRows.length === tableData.length && tableData.length > 0
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
			// 왼쪽 편집 가능한 key 열
			{
				accessorKey: 'key',
				header: 'Key',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={tableData}
						// 비교 대상은 오른쪽의 beforeKey
						otherData={tableData.map((item) => ({
							...item,
							key: item.beforeKey,
						}))}
						field='key'
						diffField='beforeKey'
						onCommit={handleEditKey}
						diffColor='lightgreen'
						readOnly={false}
					/>
				),
			},
			// 왼쪽 편집 가능한 value 열
			{
				accessorKey: 'value',
				header: 'Value',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={tableData}
						// 비교 대상은 오른쪽의 beforeValue
						otherData={tableData.map((item) => ({
							...item,
							value: item.beforeValue,
						}))}
						field='value'
						diffField='beforeValue'
						onCommit={handleEditValue}
						diffColor='lightgreen'
						readOnly={false}
					/>
				),
			},
			// diff 액션 열
			{
				accessorKey: 'action',
				header: () => (
					<DiffButton
						overallDiffExists={overallDiffExists}
						onClick={handleOverallDiff}
						title='전체 diff 실행'
						style={{}}
					/>
				),
				cell: ({row}) => (
					<DiffButton
						row={row}
						data={tableData}
						setData={setTableData}
						title='행 diff 실행'
						style={{}}
					/>
				),
			},
			// 오른쪽 읽기 전용 beforeKey 열
			{
				accessorKey: 'beforeKey',
				header: 'Before Key',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={tableData}
						// 비교 대상은 왼쪽의 key
						otherData={tableData.map((item) => ({
							...item,
							beforeKey: item.key,
						}))}
						field='beforeKey'
						diffField='key'
						diffColor='lightcoral'
						readOnly={true}
					/>
				),
			},
			// 오른쪽 읽기 전용 beforeValue 열
			{
				accessorKey: 'beforeValue',
				header: 'Before Value',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={tableData}
						// 비교 대상은 왼쪽의 value
						otherData={tableData.map((item) => ({
							...item,
							beforeValue: item.value,
						}))}
						field='beforeValue'
						diffField='value'
						diffColor='lightcoral'
						readOnly={true}
					/>
				),
			},
		],
		[
			tableData,
			selectedRows,
			overallDiffExists,
			handleEditKey,
			handleEditValue,
			handleOverallDiff,
		],
	);

	// React Table 인스턴스 생성
	const table = useReactTable({
		data: tableData,
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
