import React from 'react';
import './TextBoxCell.scss';

const TextBoxCell = ({row, column, readOnly}) => {
	return (
		<input
			className={`text-box`}
			type={'text'}
			value={row.original[column.id]}
			disabled={readOnly}
		/>
	);
};

export default TextBoxCell;
