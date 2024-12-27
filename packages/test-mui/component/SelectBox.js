import React from 'react';
import PropTypes from 'prop-types';
import {useFormContext} from 'react-hook-form';
import {
	Box,
	Checkbox,
	FormControl,
	InputLabel,
	ListItemText,
	ListSubheader,
	MenuItem,
	Select,
	Stack,
} from '@mui/material';
import {formTypes} from './FieldEx';

function SelectBox({formData}) {
	const {
		register,
		formState: {errors},
		getValues,
		setValue,
	} = useFormContext();

	return (
		<Stack direction='row' spacing={2}>
			<InputLabel>SelectBox Field</InputLabel>
			{formData.map(({type, id, label, placeholder, options}, index) => {
				const currentValue = getValues(id);

				const handleChange = (event) => {
					const {value} = event.target;
					console.log(value);
					setValue(id, type === formTypes.selectMultiple ? [...value] : value, {
						shouldValidate: true,
					});
				};
				return (
					<FormControl key={index} size='small' sx={{width: '200px'}}>
						<InputLabel color={'success'} variant='outlined'>
							{label}
						</InputLabel>
						{type === formTypes.selectSingle ? (
							<Select
								{...register(id)}
								error={!!errors[id]}
								color='success'
								label={label}
							>
								{options.map(({value, label}) => (
									<MenuItem key={value} value={value}>
										{label}
									</MenuItem>
								))}
							</Select>
						) : type === formTypes.selectMultiple ? (
							<Select
								{...register(id)}
								error={!!errors[id]}
								color='success'
								label={label}
								multiple
								value={currentValue || []}
								onChange={handleChange}
								renderValue={(selected) => {
									if (!selected || selected.length === 0) return '';
									return selected
										.map(
											(value) =>
												options.find((option) => option.value === value)
													?.label || value,
										)
										.join(', ');
								}}
							>
								{options.map(({value, label}) => (
									<MenuItem key={value} value={value}>
										<Checkbox checked={currentValue?.includes(value)} />
										<ListItemText primary={label} />
									</MenuItem>
								))}
							</Select>
						) : type === formTypes.selectGroup ? (
							<Select
								{...register(id)}
								error={!!errors[id]}
								color='success'
								label={label}
							>
								{options.map(({label, subOptions}) => (
									<React.Fragment key={label}>
										<ListSubheader> {label}</ListSubheader>
										{subOptions.map(({value, label}) => (
											<MenuItem key={value} value={value}>
												{label}
											</MenuItem>
										))}
									</React.Fragment>
								))}
							</Select>
						) : (
							<div></div>
						)}
					</FormControl>
				);
			})}
		</Stack>
	);
}

SelectBox.propTypes = {formData: PropTypes.array};

export default SelectBox;
