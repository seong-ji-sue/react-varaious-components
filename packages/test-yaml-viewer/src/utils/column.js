export const compareCol = [
	// 체크박스 열
	{
		accessorKey: 'select',
		header: ({table}) => {
			const {meta} = table.options;
			const {combinedData, selectedRows, setSelectedRows} = meta;
			return (
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
			);
		},
		cell: ({row, table}) => {
			const {meta} = table.options;
			const {selectedRows, setSelectedRows} = meta;
			const idx = row.original.idx;
			const checked = selectedRows.includes(idx);
			return (
				<input
					type='checkbox'
					checked={checked}
					onChange={(e) => {
						setSelectedRows((prev) =>
							e.target.checked ? [...prev, idx] : prev.filter((i) => i !== idx),
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
		cell: ({row, table}) => {
			const {meta} = table.options;
			const {compareData, rightDataState, handleEditKey} = meta;
			return (
				<TextInput
					row={row}
					data={compareData}
					otherData={rightDataState}
					field='key'
					onCommit={handleEditKey}
					diffColor='lightgreen'
					readOnly={false}
				/>
			);
		},
	},
	// 좌측 Value 열 (Editable)
	{
		accessorKey: 'leftValue',
		header: 'Left Value',
		cell: ({row, table}) => {
			const {meta} = table.options;
			const {compareData, rightDataState, handleEditValue} = meta;
			return (
				<TextInput
					row={row}
					data={compareData}
					otherData={rightDataState}
					field='value'
					onCommit={handleEditValue}
					diffColor='lightgreen'
					readOnly={false}
				/>
			);
		},
	},
	// 액션 열: 헤더와 셀 모두 DiffButton 사용
	{
		accessorKey: 'action',
		header: ({table}) => {
			const {meta} = table.options;
			const {overallDiffExists, handleOverallDiff} = meta;
			return (
				<DiffButton
					overallDiffExists={overallDiffExists}
					onClick={handleOverallDiff}
					title='전체 diff 실행'
				/>
			);
		},
		cell: ({row, table}) => {
			const {meta} = table.options;
			const {compareData, rightDataState, setCompareData} = meta;
			return (
				<DiffButton
					row={row}
					compareData={compareData}
					rightDataState={rightDataState}
					setCompareData={setCompareData}
					title='행 diff 실행'
				/>
			);
		},
	},
	// 우측 Key 열 (ReadOnly)
	{
		accessorKey: 'rightKey',
		header: 'Right Key',
		cell: ({row, table}) => {
			const {meta} = table.options;
			const {rightDataState, compareData} = meta;
			return (
				<TextInput
					row={row}
					data={rightDataState}
					otherData={compareData}
					field='key'
					diffColor='lightcoral'
					readOnly={true}
				/>
			);
		},
	},
	// 우측 Value 열 (ReadOnly)
	{
		accessorKey: 'rightValue',
		header: 'Right Value',
		cell: ({row, table}) => {
			const {meta} = table.options;
			const {rightDataState, compareData} = meta;
			return (
				<TextInput
					row={row}
					data={rightDataState}
					otherData={compareData}
					field='value'
					diffColor='lightcoral'
					readOnly={true}
				/>
			);
		},
	},
];
