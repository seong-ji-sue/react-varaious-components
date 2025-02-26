import React from 'react';

const DiffCell = ({row}) => {
	return row?.original?.isDiff && <button>{'<<'}</button>;
};

export default DiffCell;
