import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from '@tanstack/react-table';
// jsondiffpatch 라이브러리 전적 사용
import {create} from 'jsondiffpatch';

const jsondiffpatch = create();

// -------------------------------------------------------------------
// getDifferencesAfterTransform
// - 변환 후 데이터에서 { key, value }와 { key: defaultKey, value: defaultValue } 비교
// - 어떤 필드가 다른지 diff 결과와 함께, 해당 객체의 인덱스를 반환
// -------------------------------------------------------------------
function getDifferencesAfterTransform(data) {
	return data.reduce((acc, item, index) => {
		const left = {key: item.key, value: item.value};
		const right = {key: item.defaultKey, value: item.defaultValue};
		const diffResult = jsondiffpatch.diff(left, right);
		if (diffResult) {
			acc.push({idx: index, diff: diffResult});
		}
		return acc;
	}, []);
}

// -------------------------------------------------------------------
// transformData 함수
// - 원본 데이터에서 key와 defaultKey를 비교하여
//   동일하면 한 행, 다르면 좌/우 분리하여 반환
// -------------------------------------------------------------------
function transformData(data) {
	const result = [];
	let newIdx = 0;

	data.forEach((item) => {
		const leftObj = {key: item.key, value: item.value};
		const rightObj = {key: item.defaultKey, value: item.defaultValue};
		const differences = jsondiffpatch.diff(leftObj, rightObj);

		if (!differences) {
			// 차이가 없으면 한 행
			result.push({
				idx: newIdx++,
				key: item.key,
				value: item.value,
				defaultKey: item.defaultKey,
				defaultValue: item.defaultValue,
			});
		} else {
			// 차이가 있으면 좌측과 우측을 분리 (문자가 존재하는 경우에만)
			if (item.key.trim() !== '' || item.value.trim() !== '') {
				result.push({
					idx: newIdx++,
					key: item.key,
					value: item.value,
					defaultKey: '',
					defaultValue: '',
				});
			}
			if (item.defaultKey.trim() !== '' || item.defaultValue.trim() !== '') {
				result.push({
					idx: newIdx++,
					key: '',
					value: '',
					defaultKey: item.defaultKey,
					defaultValue: item.defaultValue,
				});
			}
		}
	});

	return result;
}

// -------------------------------------------------------------------
// TextInput 컴포넌트
// - diffInfo prop이 전달되면 해당 셀에 변경(diff) 있음을 판단하여 배경색(diffColor) 적용
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
		diffField,
		diffInfo, // 외부에서 전달받은 diff 정보
	} = props;

	let computedInitialValue = initialValue;
	let computedInputId = inputId;
	let computedDiffValue = diffValue;
	let computedReadOnly = readOnly;
	if (row && data && field) {
		const idx = row.original.idx;
		const item = data.find((d) => d.idx === idx) || {};
		const otherItem = (otherData && otherData.find((d) => d.idx === idx)) || {};
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
	// 우선, diffInfo가 있으면 해당 셀에 변화가 있다고 간주하여 배경색 적용
	const backgroundColor = diffInfo
		? diffColor
		: computedDiffValue !== undefined
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
// DiffButton 컴포넌트
// - "행 Diff" 버튼: 해당 행의 좌측 값을 우측 값으로 덮어쓰고 transformData 재실행
// - "전체 Diff" 버튼: 모든 행의 좌측 값을 우측 값으로 덮어쓰고 transformData 재실행
// -------------------------------------------------------------------
const DiffButton = ({
	row,
	data,
	onRowDiff,
	overallDiffExists,
	onOverallDiff,
	title,
	style,
}) => {
	// "행 Diff" 버튼
	if (row && data && onRowDiff) {
		const idx = row.original.idx;
		const item = data.find((it) => it.idx === idx);
		if (!item) return null;
		const isDifferent =
			item.key !== item.defaultKey || item.value !== item.defaultValue;
		if (!isDifferent) return null;

		const handleRowDiffClick = () => {
			onRowDiff(idx);
		};

		return (
			<button onClick={handleRowDiffClick} title={title} style={style}>
				{'<<'}
			</button>
		);
	}

	// "전체 Diff" 버튼
	if (onOverallDiff) {
		if (overallDiffExists === false) {
			return <button style={{...style, visibility: 'hidden'}}>{'<<'}</button>;
		}
		return (
			<button onClick={onOverallDiff} title={title} style={style}>
				{'<<'}
			</button>
		);
	}

	return null;
};

// -------------------------------------------------------------------
// 초기 데이터 (예시)
// -------------------------------------------------------------------
const initialData = [
	{
		idx: 0,
		key: 'port',
		value: '9000',
		defaultKey: 'port',
		defaultValue: '9000',
	},
	{
		idx: 1,
		key: 'url',
		value: '2e',
		defaultKey: 'url',
		defaultValue: '3',
	},
	{
		idx: 2,
		key: 'spring',
		value: 'jisu-table',
		defaultKey: 'react',
		defaultValue: 'jisu-diff',
	},
	{
		idx: 3,
		key: 'oracle',
		value: 'asd',
		defaultKey: 'mysql',
		defaultValue: '123123',
	},
	{
		idx: 4,
		key: '',
		value: '',
		defaultKey: '',
		defaultValue: '',
	},
	{
		idx: 5,
		key: 'extra.row',
		value: 'extraValue',
		defaultKey: '',
		defaultValue: '',
	},
];

// -------------------------------------------------------------------
// CompareTable 컴포넌트
// -------------------------------------------------------------------
export default function CompareTable() {
	// 1) 초기 렌더 시 transformData 실행
	const [tableData, setTableData] = useState(() => transformData(initialData));
	const [selectedRows, setSelectedRows] = useState([]);

	const diffAfter = useMemo(
		() => getDifferencesAfterTransform(tableData),
		[tableData],
	);

	// A) key 편집 핸들러
	const handleEditKey = useCallback((idx, newValue) => {
		setTableData((prevData) =>
			prevData.map((item) =>
				item.idx === idx ? {...item, key: newValue} : item,
			),
		);
	}, []);

	// B) value 편집 핸들러
	const handleEditValue = useCallback((idx, newValue) => {
		setTableData((prevData) =>
			prevData.map((item) =>
				item.idx === idx ? {...item, value: newValue} : item,
			),
		);
	}, []);

	// C) 행 추가
	const handleAddRow = useCallback(() => {
		const newIdx =
			tableData.length > 0 ? Math.max(...tableData.map((d) => d.idx)) + 1 : 0;
		const newRow = {
			idx: newIdx,
			key: '',
			value: '',
			defaultKey: '',
			defaultValue: '',
		};
		setTableData((prevData) => [...prevData, newRow]);
	}, [tableData]);

	// D) 선택된 행 삭제
	const handleDeleteSelected = useCallback(() => {
		const newData = tableData.reduce((acc, item) => {
			if (selectedRows.includes(item.idx)) {
				if (!item.defaultKey.trim() && !item.defaultValue.trim()) {
					// 행 자체 삭제
					return acc;
				} else {
					// 좌측만 비움
					acc.push({...item, key: '', value: ''});
					return acc;
				}
			} else {
				acc.push(item);
				return acc;
			}
		}, []);
		const reIndexed = newData.map((it, i) => ({...it, idx: i}));
		setTableData(reIndexed);
		setSelectedRows([]);
	}, [tableData, selectedRows]);

	// E) Row Diff 후 transformData 재실행
	const handleRowDiff = useCallback((targetIdx) => {
		setTableData((prevData) => {
			const updated = prevData.map((item) =>
				item.idx === targetIdx
					? {...item, key: item.defaultKey, value: item.defaultValue}
					: item,
			);
			return transformData(updated);
		});
	}, []);

	// F) 전체 Diff 후 transformData 재실행
	const handleOverallDiff = useCallback(() => {
		setTableData((prevData) => {
			const updated = prevData.map((item) => ({
				...item,
				key: item.defaultKey,
				value: item.defaultValue,
			}));
			return transformData(updated);
		});
	}, []);

	// diff 여부: 하나라도 좌측과 우측 값이 다르면 diff 있음
	const overallDiffExists = useMemo(() => {
		return tableData.some(
			(item) =>
				item.key !== item.defaultKey || item.value !== item.defaultValue,
		);
	}, [tableData]);

	// 테이블 컬럼 구성 (각 셀에 diff 정보(diffAfter에서 해당 행의 diff)를 전달)
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
			// 왼쪽 key 셀: diffAfter에서 해당 행의 key diff 정보 전달
			{
				accessorKey: 'key',
				header: 'Key',
				cell: ({row}) => {
					const diffInfo = diffAfter.find((d) => d.idx === row.original.idx)
						?.diff?.key;
					return (
						<TextInput
							row={row}
							data={tableData}
							otherData={tableData.map((item) => ({
								...item,
								key: item.defaultKey,
							}))}
							field='key'
							diffField='defaultKey'
							onCommit={handleEditKey}
							diffColor='lightgreen'
							readOnly={false}
							diffInfo={diffInfo}
						/>
					);
				},
			},
			// 왼쪽 value 셀: diffAfter에서 해당 행의 value diff 정보 전달
			{
				accessorKey: 'value',
				header: 'Value',
				cell: ({row}) => {
					const diffInfo = diffAfter.find((d) => d.idx === row.original.idx)
						?.diff?.value;
					return (
						<TextInput
							row={row}
							data={tableData}
							otherData={tableData.map((item) => ({
								...item,
								value: item.defaultValue,
							}))}
							field='value'
							diffField='defaultValue'
							onCommit={handleEditValue}
							diffColor='lightgreen'
							readOnly={false}
							diffInfo={diffInfo}
						/>
					);
				},
			},
			// diff 액션 열: 행 Diff / 전체 Diff 버튼
			{
				accessorKey: 'action',
				header: () => (
					<DiffButton
						overallDiffExists={overallDiffExists}
						onOverallDiff={handleOverallDiff}
						title='전체 diff 실행'
						style={{}}
					/>
				),
				cell: ({row}) => (
					<DiffButton
						row={row}
						data={tableData}
						onRowDiff={handleRowDiff}
						title='행 diff 실행'
						style={{}}
					/>
				),
			},
			// 오른쪽 defaultKey 셀 (readOnly)
			{
				accessorKey: 'defaultKey',
				header: 'Default Key',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={tableData}
						otherData={tableData.map((item) => ({
							...item,
							defaultKey: item.key,
						}))}
						field='defaultKey'
						diffField='key'
						diffColor='lightcoral'
						readOnly={true}
					/>
				),
			},
			// 오른쪽 defaultValue 셀 (readOnly)
			{
				accessorKey: 'defaultValue',
				header: 'Default Value',
				cell: ({row}) => (
					<TextInput
						row={row}
						data={tableData}
						otherData={tableData.map((item) => ({
							...item,
							defaultValue: item.value,
						}))}
						field='defaultValue'
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
			handleRowDiff,
			handleOverallDiff,
			diffAfter,
		],
	);

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
