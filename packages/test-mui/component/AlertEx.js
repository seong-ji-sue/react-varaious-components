import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Stack, Alert, AlertTitle, Box} from '@mui/material';
import {keyframes} from '@emotion/react';

//보이고 이후 위로 사라짐
const fadeOutUp = keyframes`
  0% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50px);
  }
`;

function AlertEx() {
	const [alertType, setAlertType] = useState(null);
	const [isFading, setIsFading] = useState(false);

	const handleShowAlert = (type) => {
		setIsFading(false); //알림표시
		setAlertType(type);
		setTimeout(() => setIsFading(true), 2500); //2.5초 후 사라지는 애니메이션 적용
		setTimeout(() => setAlertType(null), 3000); //상태 초기화
	};

	return (
		<>
			{/* Toast-like Alert at the top */}
			{alertType && (
				<Box
					sx={{
						position: 'fixed',
						top: 16,
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 9999,
						width: 'auto',
						maxWidth: '90%',
						borderRadius: 1,
						boxShadow: 3,
						animation: isFading ? `${fadeOutUp} 0.5s forwards` : 'none', //0.5초 동안 애니메이션 유지
					}}
				>
					{alertType === 'success' && (
						<Alert severity='success'>
							<AlertTitle>Success</AlertTitle>
							This is a success Alert with an encouraging title.
						</Alert>
					)}
					{alertType === 'info' && (
						<Alert severity='info'>
							<AlertTitle>Info</AlertTitle>
							This is an info Alert with an informative title.
						</Alert>
					)}
					{alertType === 'warning' && (
						<Alert severity='warning'>
							<AlertTitle>Warning</AlertTitle>
							This is a warning Alert with a cautious title.
						</Alert>
					)}
					{alertType === 'error' && (
						<Alert severity='error'>
							<AlertTitle>Error</AlertTitle>
							This is an error Alert with a scary title.
						</Alert>
					)}
				</Box>
			)}

			<Stack spacing={2}>
				<Stack direction='row' spacing={2}>
					<Button variant='default' onClick={() => handleShowAlert('success')}>
						Success
					</Button>
					<Button variant='default' onClick={() => handleShowAlert('info')}>
						Info
					</Button>
					<Button variant='default' onClick={() => handleShowAlert('warning')}>
						Warning
					</Button>
					<Button variant='default' onClick={() => handleShowAlert('error')}>
						Error
					</Button>
				</Stack>
			</Stack>
		</>
	);
}

AlertEx.propTypes = {};

export default AlertEx;
