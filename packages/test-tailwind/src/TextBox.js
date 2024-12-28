import React from 'react';
import PropTypes from 'prop-types';
import {useForm} from 'react-hook-form';

function TextBox(props) {
	const {
		register,
		handleSubmit,
		formState: {errors},
	} = useForm();

	const onSubmit = (data) => {
		console.log('Submitted Data:', data);
	};

	return (
		<div className='max-w-sm mx-auto mt-10'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='mb-4'>
					<label
						htmlFor='username'
						className='block text-sm font-medium text-gray-700'
					>
						Username
					</label>
					<input
						type='text'
						id='username'
						className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
							errors.username ? 'border-red-500' : 'border-gray-300'
						}`}
						{...register('username', {
							required: 'Username is required',
							minLength: {
								value: 3,
								message: 'Username must be at least 3 characters long',
							},
						})}
					/>
					{errors.username && (
						<p className='mt-2 text-sm text-red-500'>
							{errors.username.message}
						</p>
					)}
				</div>
				<button
					type='submit'
					className='inline-flex justify-center px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				>
					Submit
				</button>
			</form>
		</div>
	);
}

TextBox.propTypes = {};
export default TextBox;
