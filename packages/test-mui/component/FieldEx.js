import React from 'react';
import PropTypes from 'prop-types';
import {Stack, TextField} from '@mui/material';
import {FormProvider, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';

const formData = [
	{id: 'id', label: 'ID', placeholder: 'id를 입력하세요'},
	{id: 'name', label: 'Name', placeholder: 'name를 입력하세요'},
];

//알파벳(a-zA-Z), 숫자(0-9)
export const rEngNum = /^[a-zA-Z0-9]*$/;

const schema = yup.object().shape({
	id: yup
		.string()
		.trim()
		.max(10, '10글자 내에 입력하세요')
		.matches(rEngNum, '유효성을 다시 체크하세요'),
	name: yup
		.string()
		.trim()
		.max(10, '10글자 내에 입력하세요')
		.matches(rEngNum, '유효성을 다시 체크하세요'),
});

function FieldEx(props) {
	const methods = useForm({
		resolver: yupResolver(schema),
	});

	const {
		register,
		handleSubmit,
		formState: {errors},
	} = methods;

	const onSubmit = (data) => {
		console.log('Form Data:', data);
	};

	return (
		<FormProvider {...methods}>
			<Stack direction='row' spacing={2}>
				{formData.map(({id, label, placeholder}, index) => {
					return (
						<TextField
							{...register(id)}
							key={index}
							label={label}
							variant={'outlined'}
							placeholder={placeholder}
							error={!!errors.firstName}
							helperText={errors.firstName?.message}
						/>
					);
				})}
			</Stack>
		</FormProvider>
	);
}

FieldEx.propTypes = {};

export default FieldEx;
