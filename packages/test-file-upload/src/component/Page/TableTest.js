import React, {useMemo} from 'react';
import Table from '../Table';

const data = [
	{
		id: 'test1',
		name: 'gg',
		description: 'rewrwr',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test2',
		name: '1gg',
		description: 'rewrwr',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test3',
		name: 'g22g',
		description: 'rewrwr',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
	{
		id: 'test4',
		name: 'gg333',
		description: 'rewrwr',
		createdTime: '2025-08-08T05:47:57.511Z',
		creator: 'js',
	},
];

const lName = {value: 'name', label: '이름'};
const lDescription = {value: 'description', label: '설명'};
const lCreateTime = {value: 'createdTime', label: '생성날짜'};
const lCreator = {value: 'creator', label: '생성자'};

const cName = {accessorKey: lName.value, header: lName.label};
const cDescription = {
	accessorKey: lDescription.value,
	header: lDescription.label,
};
const cCreateTime = {accessorKey: lCreateTime.value, header: lCreateTime.label};
const cCreator = {accessorKey: lCreator.value, header: lCreator.label};

const columns = [cName, cDescription, cCreateTime, cCreator];

const TableTest = () => {
	const props = useMemo(
		() => ({
			columns,
			data,
		}),
		[],
	);

	return <Table {...props} />;
};

export default TableTest;
