import React from 'react';
import PropTypes from 'prop-types';
import {useFormContext} from 'react-hook-form';
import {InputLabel, Stack} from '@mui/material';

function SelectSearchBox({formData}) {
	const {
		register,
		formState: {errors},
		getValues,
	} = useFormContext();
	return (
		<Stack direction='row' spacing={2}>
			<InputLabel>Select Search Field</InputLabel>
		</Stack>
	);
}

SelectSearchBox.propTypes = {formData: PropTypes.array};
export default SelectSearchBox;
