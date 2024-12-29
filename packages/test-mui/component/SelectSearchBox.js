import React from 'react';
import PropTypes from 'prop-types';
import {useFormContext} from 'react-hook-form';
import {
	Autocomplete,
	FormControl,
	FormHelperText,
	InputLabel,
	Stack,
	TextField,
} from '@mui/material';

function SelectSearchBox({formData}) {
	const {
		register,
		formState: {errors},
		getValues,
		setValue,
	} = useFormContext();
	return (
		<Stack direction='row' spacing={2}>
			<InputLabel>Select Search Field</InputLabel>
			{formData.map(({type, id, label, placeholder, options}, index) => {
				const currentValue = getValues(id);

				const handleChange = (_, value) => {
					setValue(id, value, {shouldValidate: true});
				};

				return (
					<FormControl
						key={index}
						size='small'
						sx={{width: '200px'}}
						error={!!errors[id]}
					>
						<Autocomplete
							id={id}
							options={options || []}
							value={currentValue || ''}
							onChange={handleChange}
							renderInput={(params) => (
								<TextField
									{...params}
									{...register(id)}
									label={label}
									placeholder={placeholder}
									error={!!errors[id]}
									helperText={errors[id]?.message}
									color='success'
								/>
							)}
						/>
						{errors[id] && (
							<FormHelperText>{errors[id].message}</FormHelperText>
						)}
					</FormControl>
				);
			})}
		</Stack>
	);
}

SelectSearchBox.propTypes = {formData: PropTypes.array};
export default SelectSearchBox;
