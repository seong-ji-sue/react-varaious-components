import React, {useMemo} from 'react';
import Table from '../Table';
import Export from '../export/Export';
import StatusCell from '../export/StatusCell';

const data = [
	{
		id: 'test1',
		name: 'gg',
		description: 'rewrwr',
		status: 'ACTIVE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test2',
		name: '1gg',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test3',
		name: 'g22g',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test4',
		name: 'gg333',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test1',
		name: 'gg',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test2',
		name: '1gg',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test3',
		name: 'g22g',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test4',
		name: 'gg333',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test1',
		name: 'gg',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test2',
		name: '1gg',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test3',
		name: 'g22g',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test4',
		name: 'gg333',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test1',
		name: 'gg',
		description: 'rewrwr',
		status: 'DELETE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test2',
		name: '1gg',
		description: 'rewrwr',
		status: 'ACTIVE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test3',
		name: 'g22g',
		description: 'rewrwr',
		status: 'ACTIVE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test4',
		name: 'gg333',
		description: 'rewrwr',
		status: 'ACTIVE',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
];

const lName = {value: 'name', label: '이름'};
const lDescription = {value: 'description', label: '설명'};
const lStatus = {value: 'status', label: '상태'};
const lCreateTime = {value: 'createdTime', label: '생성날짜'};
const lCreator = {value: 'creator', label: '생성자'};

const cName = {accessorKey: lName.value, header: lName.label};
const cDescription = {
	accessorKey: lDescription.value,
	header: lDescription.label,
};
const cStatus = {
	accessorKey: lStatus.value,
	header: lStatus.label,
	cell: (cell) => <StatusCell cell={cell} />,
};
const cCreateTime = {accessorKey: lCreateTime.value, header: lCreateTime.label};
const cCreator = {accessorKey: lCreator.value, header: lCreator.label};

const columns = [
	cDescription,
	cName,
	cStatus,
	cDescription,
	cDescription,
	cDescription,
	cCreateTime,
	cCreator,
];

const TableTest = () => {
	const props = useMemo(
		() => ({
			columns,
			data,
		}),
		[],
	);

	return (
		<div>
			<Export {...props} />
			<Table {...props} />
		</div>
	);
};

export default TableTest;
