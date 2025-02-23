import React from 'react';

const DiffCell = ({row}) => {
	console.log(row);
	return row?.original?.isDiff && <button>{'<<'}</button>;
};

export default DiffCell;
