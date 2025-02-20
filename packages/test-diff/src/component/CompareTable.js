import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';

// -------------------------------------------------------------------
// TextInput 컴포넌트 (통합 버전)
// - standalone 모드와 cell 모드를 모두 지원
// -------------------------------------------------------------------
const TextInput = React.memo((props) => {
	const {
		// standalone props
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
	} = props;

	let computedInitialValue = initialValue;
	let computedInputId = inputId;
	let computedDiffValue = diffValue;
	let computedReadOnly = readOnly;
	if (row && data && field) {
		const idx = row.original.idx;
		const item = data[idx] || {};
		const otherItem = (otherData && otherData[idx]) || {};
		computedInitialValue = item[field] || '';
		computedDiffValue = otherItem[field] || '';
		computedInputId = `${field}-${idx}`;
		computedReadOnly = readOnly;
	}

	const [localValue, setLocalValue] = useState(computedInitialValue);
	const inputRef = useRef(null);

	useEffect(() => {
		setLocalValue(computedInitialValue);
	}, [computedInitialValue]);

	// readOnly인 경우에도 최신 값(computedInitialValue)을 기준으로 하이라이팅 계산
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
					if (row) {
						onCommit(row.original.idx, localValue);
					} else {
						onCommit(localValue);
					}
				}
			}}
		/>
	);
});

// -------------------------------------------------------------------
// DiffButton 컴포넌트: 헤더 및 셀의 diff 버튼을 모두 처리
// - row prop이 있으면 행 diff 모드로 동작
// - row가 없고 overallDiffExists prop이 전달되면 전체 diff 모드로 동작
//   overallDiffExists가 false이면 버튼을 hidden 처리함
// -------------------------------------------------------------------
const DiffButton = ({
	row,
	compareData,
	rightDataState,
	setCompareData,
	overallDiffExists,
	onClick,
	title,
	style,
}) => {
	// 행 diff 모드
	if (row && compareData && rightDataState && setCompareData) {
		const idx = row.original.idx;
		const leftItem = compareData.find((item) => item.idx === idx);
		const rightItem = rightDataState[idx];
		if (!rightItem || (leftItem && leftItem.deleted)) return null;
		const isDifferent =
			leftItem &&
			rightItem &&
			(leftItem.key !== rightItem.key || leftItem.value !== rightItem.value);
		if (!isDifferent) return null;

		const handleRowDiff = () => {
			setCompareData((prevData) =>
				prevData.map((item) =>
					item.idx === idx
						? {...item, key: rightItem.key, value: rightItem.value}
						: item,
				),
			);
		};

		return (
			<button onClick={handleRowDiff} title={title} style={style}>
				{'<<'}
			</button>
		);
	}

	// 전체 diff 모드 (row prop이 없는 경우)
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
// 초기 데이터: 좌측과 우측
// -------------------------------------------------------------------
const initialLeftData = [
	{idx: 0, key: 'server.port', value: '9000'},
	{
		idx: 1,
		key: 'spring.datasource.url',
		value: 'jdbc:oraclesql://192.159.101.3326/jisu?useSSL123=False',
	},
	{idx: 2, key: 'spring.datasource.username', value: 'jisu-diff'},
	{idx: 3, key: 'spring.datasource.password', value: '123123'},
	{idx: 4, key: 'spring.jpa.hibernate.ddl-auto', value: ''},
	{idx: 5, key: 'spring.jpa.hibernate.ddl-auto', value: ''},
];

const initialRightData = [
	{key: 'server.port', value: '9000'},
	{
		key: 'spring.datasource.url',
		value: 'jdbc:maria://192.159.101.3326/jisu?useSSL123=False',
	},
	{key: 'spring.datasource.username', value: 'jisu-table'},
	{key: 'spring.datasource.pw', value: 'asd'},
	{key: '', value: ''},
	{key: 'extra.row', value: 'extraValue'},
];

// -------------------------------------------------------------------
// CompareTable 컴포넌트
// -------------------------------------------------------------------
export default function CompareTable() {
	// -----------------------------
	// State 관리: 좌측 데이터, 우측 데이터, 선택된 행
	// -----------------------------
	const [compareData, setCompareData] = useState(initialLeftData);
	const [rightDataState, setRightDataState] = useState(initialRightData);
	const [selectedRows, setSelectedRows] = useState([]);

	// -----------------------------
	// 이벤트 핸들러: 좌측 데이터 수정 (onBlur 시 commit)
	// -----------------------------
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

	// -----------------------------
	// 이벤트 핸들러: 행 추가 (Add 버튼)
	// -----------------------------
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

	// -----------------------------
	// 이벤트 핸들러: 선택된 행 삭제 (Delete Selected 버튼)
	// -----------------------------
	const handleDeleteSelected = useCallback(() => {
		const newLeft = [];
		const newRight = [];
		const maxRows = Math.max(compareData.length, rightDataState.length);

		for (let i = 0; i < maxRows; i++) {
			const leftItem = compareData[i];
			const rightItem = rightDataState[i];

			if (leftItem && selectedRows.includes(leftItem.idx)) {
				if (
					rightItem &&
					rightItem.key.trim() === '' &&
					rightItem.value.trim() === ''
				) {
					continue;
				} else {
					newLeft.push({...leftItem, key: '', value: '', deleted: false});
					newRight.push(rightItem || {key: '', value: ''});
				}
			} else {
				if (leftItem) newLeft.push(leftItem);
				if (rightItem) newRight.push(rightItem);
			}
		}

		const reIndexedLeft = newLeft.map((item, i) => ({...item, idx: i}));
		const reIndexedRight = newRight;
		setCompareData(reIndexedLeft);
		setRightDataState(reIndexedRight);
		setSelectedRows([]);
	}, [compareData, rightDataState, selectedRows]);

	// -----------------------------
	// 이벤트 핸들러: 전체 diff (모든 행에 대해 좌측 데이터를 우측 데이터로 업데이트)
	// -----------------------------
	const handleOverallDiff = useCallback(() => {
		setCompareData((prevData) =>
			prevData.map((leftItem) => {
				const idx = leftItem.idx;
				const rightItem = rightDataState[idx];
				if (rightItem) {
					return {...leftItem, key: rightItem.key, value: rightItem.value};
				}
				return leftItem;
			}),
		);
	}, [rightDataState]);

	// -----------------------------
	// Combined Data 생성: 좌측과 우측 데이터셋의 최대 행 수 기준
	// -----------------------------
	const combinedData = useMemo(() => {
		const maxRows = Math.max(compareData.length, rightDataState.length);
		return Array.from({length: maxRows}, (_, idx) => ({idx}));
	}, [compareData, rightDataState]);

	// -----------------------------
	// 전체 diff 버튼 렌더링 여부 계산: 모든 행의 좌측/우측 데이터가 동일하면 false
	// -----------------------------
	const overallDiffExists = useMemo(() => {
		const maxRows = Math.max(compareData.length, rightDataState.length);
		for (let i = 0; i < maxRows; i++) {
			const leftItem = compareData[i] || {};
			const rightItem = rightDataState[i] || {};
			if (
				leftItem.key !== rightItem.key ||
				leftItem.value !== rightItem.value
			) {
				return true;
			}
		}
		return false;
	}, [compareData, rightDataState]);

	// -----------------------------
	// 테이블 컬럼 구성
	// -----------------------------
	const columns = useMemo(
		() => [
			// 체크박스 열
			{
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
			// 좌측 Key 열 (Editable)
			{
				accessorKey: 'leftKey',
				header: 'Left Key',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={compareData}
						otherData={rightDataState}
						field='key'
						onCommit={handleEditKey}
						diffColor='lightgreen'
						readOnly={false}
					/>
				),
			},
			// 좌측 Value 열 (Editable)
			{
				accessorKey: 'leftValue',
				header: 'Left Value',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={compareData}
						otherData={rightDataState}
						field='value'
						onCommit={handleEditValue}
						diffColor='lightgreen'
						readOnly={false}
					/>
				),
			},
			// 액션 열: 헤더와 셀 모두 DiffButton을 사용 (헤더는 overallDiffExists 전달)
			{
				accessorKey: 'action',
				header: () => (
					<DiffButton
						overallDiffExists={overallDiffExists}
						onClick={handleOverallDiff}
						title='전체 diff 실행'
					/>
				),
				cell: ({row}) => (
					<DiffButton
						row={row}
						compareData={compareData}
						rightDataState={rightDataState}
						setCompareData={setCompareData}
						title='행 diff 실행'
					/>
				),
			},
			// 우측 Key 열 (ReadOnly)
			{
				accessorKey: 'rightKey',
				header: 'Right Key',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={rightDataState}
						otherData={compareData}
						field='key'
						diffColor='lightcoral'
						readOnly={true}
					/>
				),
			},
			// 우측 Value 열 (ReadOnly)
			{
				accessorKey: 'rightValue',
				header: 'Right Value',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={rightDataState}
						otherData={compareData}
						field='value'
						diffColor='lightcoral'
						readOnly={true}
					/>
				),
			},
		],
		[
			compareData,
			rightDataState,
			combinedData,
			selectedRows,
			handleEditKey,
			handleEditValue,
			handleOverallDiff,
			overallDiffExists,
		],
	);

	// -----------------------------
	// React Table 인스턴스 생성
	// -----------------------------
	const table = useReactTable({
		data: combinedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	// -----------------------------
	// 렌더링
	// -----------------------------
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
