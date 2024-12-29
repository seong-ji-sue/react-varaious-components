import React from 'react';
import {Button, InputLabel, Select, Stack, TextField} from '@mui/material';
import {FormProvider, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import TextBox from './TextBox';
import SelectBox from './SelectBox';
import SelectSearchBox from './SelectSearchBox';
import TextChipBox from './TextChipBox';

export const formTypes = {
	text: 'text',
	textChip: 'textChip',
	textarea: 'textarea',
	number: 'number',
	selectSingle: 'single',
	selectMultiple: 'multiple',
	selectSearch: 'multiple',
	selectGroup: 'group',
	autocomplete: 'autocomplete',
};

const textBoxFormData = [
	{type: formTypes.text, id: 'id', label: 'ID', placeholder: 'id를 입력하세요'},
	{
		type: formTypes.number,
		id: 'version',
		label: 'version',
		placeholder: 'version를 입력하세요',
	},
	{
		type: formTypes.textarea,
		id: 'description',
		label: 'description',
		placeholder: 'description 입력하세요',
	},
];

const selectBoxFormData = [
	{
		type: formTypes.selectSingle,
		id: 'entityType1',
		label: 'Entity Type',
		placeholder: 'type 를 입력하세요',
		options: [
			{value: '0', label: 'Create'},
			{value: '1', label: 'Update'},
			{value: '2', label: 'Delete'},
		],
	},
	{
		type: formTypes.selectMultiple,
		id: 'entityType2',
		label: 'Entity Type',
		placeholder: 'type 를 입력하세요',
		options: [
			{value: '0', label: 'Create'},
			{value: '1', label: 'Update'},
			{value: '2', label: 'Delete'},
		],
	},
	{
		type: formTypes.selectGroup,
		id: 'entityType3',
		label: 'Entity Type',
		placeholder: 'type 를 입력하세요',
		options: [
			{
				label: 'Group1',
				subOptions: [
					{value: '0', label: 'Create1'},
					{value: '1', label: 'Update1'},
				],
			},
			{
				label: 'Group2',
				subOptions: [
					{value: '2', label: 'Create2'},
					{value: '3', label: 'Update2'},
				],
			},
		],
	},
];

const selectSearchFormData = [
	{
		type: 'autocomplete',
		id: 'entityType4',
		label: 'Entity Type',
		placeholder: 'type 를 입력하세요',
		options: [
			{value: '0', label: 'Create'},
			{value: '1', label: 'Update'},
			{value: '2', label: 'Delete'},
		],
	},
];

const textChipFormData = [
	{
		type: formTypes.textChip,
		id: 'textChip',
		label: 'type 를 입력하세요',
		placeholder: 'Type and press Enter',
	},
];

const schema = yup.object().shape({
	id: yup
		.string()
		.trim()
		.max(10, '10글자 내에 입력하세요')
		.required('필수 입력입니다.'),
	version: yup
		.number()
		.transform((v, o) => (o === '' ? null : v))
		.min(2, '2 이상 입력하세요')
		.max(10, '10 미만 입력하세요')
		.required('필수 입력입니다.'),
	description: yup
		.string()
		.trim()
		.max(2048, '2048글자 내에 입력하세요')
		.required('필수 입력입니다.'),
	entityType1: yup.string().required('필수 입력입니다.'),
});

function FieldEx() {
	const methods = useForm({
		resolver: yupResolver(schema),
	});

	const {
		register,
		handleSubmit,
		formState: {errors},
	} = methods;

	const onSubmit = (data) => {
		alert('Form Data: ' + JSON.stringify(data, null, 2));
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={2}>
					<Button variant='default' type='submit'>
						필드 검사
					</Button>
					<Stack spacing={2}>
						<TextBox formData={textBoxFormData} />
						<TextChipBox formData={textChipFormData} />
						<SelectBox formData={selectBoxFormData} />
						<SelectSearchBox formData={selectSearchFormData} />
					</Stack>
				</Stack>
			</form>
		</FormProvider>
	);
}

export default FieldEx;
