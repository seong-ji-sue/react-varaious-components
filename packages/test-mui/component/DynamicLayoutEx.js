import React from 'react';
import {Box, Button, Typography} from '@mui/material';

function DynamicLayoutEx(props) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: {
					xs: 'column', // 작은 화면에서는 세로 정렬
					sm: 'row', // 중간 화면에서는 가로 정렬
				},
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				backgroundColor: {
					xs: 'primary.light', // xs: 작은 화면
					sm: 'secondary.light', // sm: 중간 화면
					md: 'error.light', // md: 큰 화면
				},
				color: {
					xs: 'primary.contrastText',
					sm: 'secondary.contrastText',
					md: 'error.contrastText',
				},
			}}
		>
			<Typography
				variant='h4'
				sx={{
					fontSize: {
						xs: '1.2rem', // 작은 화면
						sm: '2rem', // 중간 화면
						md: '3rem', // 큰 화면
					},
					mb: {
						xs: 2, // 작은 화면에서 아래 여백 추가
						sm: 0, // 중간 이상에서는 여백 없음
					},
				}}
			>
				반응형 테스트
			</Typography>
			<Button
				variant='contained'
				sx={{
					padding: {
						xs: '8px 16px', // 작은 화면
						sm: '10px 20px', // 중간 화면
						md: '12px 24px', // 큰 화면
					},
					fontSize: {
						xs: '0.8rem',
						sm: '1rem',
						md: '1.2rem',
					},
					backgroundColor: {
						xs: 'info.main',
						sm: 'success.main',
						md: 'warning.main',
					},
					'&:hover': {
						backgroundColor: {
							xs: 'info.dark',
							sm: 'success.dark',
							md: 'warning.dark',
						},
					},
				}}
			>
				버튼 크기 변경
			</Button>
		</Box>
	);
}

DynamicLayoutEx.propTypes = {};
export default DynamicLayoutEx;
