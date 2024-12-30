import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {TextField, Chip, Stack, InputLabel} from '@mui/material';
import {useFormContext} from 'react-hook-form';

function TextChipBox({formData}) {
	const {
		register,
		formState: {errors},
	} = useFormContext();

	return (
		<Stack direction='row' spacing={2}>
			<InputLabel>TextChipBox Field</InputLabel>
			{formData.map(({type, id, label, placeholder}, index) => {
				if (type === 'textChip') {
					const [chips, setChips] = useState([]);
					const [inputValue, setInputValue] = useState('');

					const handleAddChip = () => {
						if (inputValue.trim() && chips.length < 5) {
							setChips([...chips, inputValue.trim()]);
							setInputValue('');
						}
					};

					const handleDeleteChip = (chipToDelete) => {
						setChips(chips.filter((chip) => chip !== chipToDelete));
					};

					return (
						<Stack key={id} spacing={1}>
							<TextField
								{...register(id)}
								size='small' // 작게 설정
								type='search'
								color={'success'}
								variant='outlined'
								label={label}
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleAddChip();
									}
								}}
								placeholder={placeholder}
								error={!!errors[id]}
								helperText={errors[id]?.message || placeholder}
							/>
							<Stack direction='row' spacing={1}>
								{chips.map((chip, chipIndex) => (
									<Chip
										key={chipIndex}
										label={chip}
										variant='outlined'
										onDelete={() => handleDeleteChip(chip)}
									/>
								))}
							</Stack>
						</Stack>
					);
				}
				return null;
			})}
		</Stack>
	);
}

TextChipBox.propTypes = {
	formData: PropTypes.array,
};

export default TextChipBox;
