import React from 'react';

const oStatus = {
	DELETE: {name: 'DELETE', label: '삭제'},
	ACTIVE: {name: 'ACTIVE', label: '활성화'},
};

const StatusCell = ({cell}) => {
	const label = oStatus[cell.renderValue()]?.label;

	return <>{label}</>;
};

export default StatusCell;
