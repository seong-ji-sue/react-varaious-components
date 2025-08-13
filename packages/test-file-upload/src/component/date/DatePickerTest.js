import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {flip, limitShift, offset, shift} from '@floating-ui/dom';

const DatePickerTest = (props) => {
	return (
		<div style={{display: 'flex', margin: '300px', gap: '10px'}}>
			<div>asdasd</div>
			<DatePicker
				popperPlacement='bottom-start'
				showTimeSelect
				popperModifiers={[
					shift({mainAxis: false, crossAxis: false, boundary: 'popper'}),
					flip({
						fallbackPlacements: ['bottom-start'],
					}),
					{
						name: 'remove-flip',
						fn: () => ({reset: {placement: 'bottom-start', rects: true}}),
					},
				]}
			/>
		</div>
	);
};

export default DatePickerTest;
