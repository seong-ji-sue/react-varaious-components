import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useForm} from 'react-hook-form';
import styled from 'styled-components';

const InputSelectField = ({placeholder, validation, options}) => {
	const {register, setValue, handleSubmit, reset} = useForm();

	const [selectedOption, setSelectedOption] = useState(options[0]?.value || '');

	const onChangeSelect = useCallback((e) => {
		const newValue = e.target.value;
		setSelectedOption(newValue);
	}, []);

	const onChangeInput = useCallback(
		(e) => {
			setValue(selectedOption, e.target.value);
		},
		[selectedOption, setValue],
	);

	const onSubmitForm = (data) => {
		console.log(data); // 여기서 제대로 된 값이 출력되는지 확인
	};

	return (
		<Container>
			<Title>select +input 필드</Title>
			<Form onSubmit={handleSubmit(onSubmitForm)}>
				<div>
					<Select value={selectedOption} onChange={onChangeSelect}>
						{options.map((option, index) => (
							<option key={index} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
					<input
						type='text'
						{...register(selectedOption, validation)}
						onChange={onChangeInput}
						placeholder={placeholder}
					/>
				</div>
				<button type='submit'>Submit</button>
			</Form>
		</Container>
	);
};

InputSelectField.propTypes = {
	placeholder: PropTypes.string,
	validation: PropTypes.object,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		}),
	).isRequired,
};

export default InputSelectField;

const Container = styled.div`
	margin-bottom: 20px;
`;

const Title = styled.h3`
	margin-bottom: 20px;
`;

const Form = styled.form`
	display: flex;
`;

const Select = styled.select`
	border: 1px solid black;
`;
