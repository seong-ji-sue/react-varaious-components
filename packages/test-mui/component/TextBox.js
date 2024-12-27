import React from 'react';
import {InputLabel, Stack, TextField} from '@mui/material';
import {formTypes} from './FieldEx';
import {useFormContext} from 'react-hook-form';
import Page from '../src/Page';
import PropTypes from 'prop-types';

function TextBox({formData}) {
	const {
		register,
		formState: {errors},
	} = useFormContext();

	return (
		<Stack direction='row' spacing={2}>
			<InputLabel>TextBox Field</InputLabel>
			{formData.map(({type, id, label, placeholder}, index) => {
				return type === formTypes.text ? (
					<TextField
						{...register(id)}
						size='small' // 작게 설정
						key={index}
						label={label}
						type='search'
						color={'success'}
						variant='outlined'
						placeholder={placeholder}
						error={!!errors[id]}
						helperText={errors[id]?.message || placeholder}
					/>
				) : type === formTypes.number ? (
					<TextField
						{...register(id)}
						size='small' // 작게 설정
						key={index}
						label={label}
						type={'number'}
						color={'success'}
						variant='outlined'
						placeholder={placeholder}
						error={!!errors[id]}
						helperText={errors[id]?.message}
						onWheel={(e) => e.target.blur()}
					/>
				) : type === formTypes.textarea ? (
					<TextField
						{...register(id)}
						multiline
						key={index}
						label={label}
						type='text'
						color={'success'}
						variant='outlined'
						placeholder={placeholder}
						rows={1}
						error={!!errors[id]}
						helperText={errors[id]?.message}
						InputProps={{
							sx: {
								'& textarea': {
									maxWidth: '200px',
									minWidth: '100px',
									resize: 'both', // 크기 조절 활성화
									overflow: 'auto', // 스크롤 활성화
									minHeight: '100px', // 최소 높이 설정
									maxHeight: '300px', // 최대 높이 설정 (선택 사항)
								},
							},
						}}
					/>
				) : (
					<div></div>
				);
			})}
		</Stack>
	);
}

TextBox.propTypes = {formData: PropTypes.array};

export default TextBox;
