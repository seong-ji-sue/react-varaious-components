import React from 'react';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {FormProvider, useForm} from 'react-hook-form';
import classNames from 'classnames';

const formData = [
	{id: 'id', label: 'ID', placeholder: 'ID를 입력하세요'},
	{id: 'name', label: 'Name', placeholder: 'Name을 입력하세요'},
];

const schema = yup.object().shape({
	id: yup
		.string()
		.required('ID를 입력하세요')
		.trim()
		.max(10, '10글자 내에 입력하세요'),
	name: yup
		.string()
		.required('Name을 입력하세요')
		.trim()
		.max(10, '10글자 내에 입력하세요'),
});

const inputStyles = {
	base: 'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm',
	error: 'border-red-500',
	normal: 'border-gray-300',
};

const buttonStyles = {
	base: 'inline-flex justify-center px-4 py-2 text-white font-medium text-sm rounded-md shadow-sm focus:outline-none',
	color: 'bg-blue-600 hover:bg-blue-500',
};

function TextBoxClassnames() {
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
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				{formData.map(({id, label, placeholder}, index) => (
					<div key={index}>
						<label
							htmlFor={id}
							className='block text-sm font-medium text-gray-700'
						>
							{label}
						</label>
						<input
							{...register(id)}
							type='text'
							id={id}
							placeholder={placeholder}
							className={classNames(
								inputStyles.base,
								errors[id] ? inputStyles.error : inputStyles.normal,
							)}
						/>
						{errors[id] && (
							<p className='mt-2 text-sm text-red-500'>{errors[id].message}</p>
						)}
					</div>
				))}
				<button
					type='submit'
					className={classNames(buttonStyles.base, buttonStyles.color)}
				>
					Submit
				</button>
			</form>
		</FormProvider>
	);
}

export default TextBoxClassnames;
