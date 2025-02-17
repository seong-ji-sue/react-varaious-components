import React from 'react';
import {Button, Divider, Stack, SvgIcon} from '@mui/material';

export const FilterIcon = (props) => (
	<SvgIcon {...props} viewBox='0 0 30 30'>
		<g
			transform='translate(0.000000,30.000000) scale(0.100000,-0.100000)'
			fill='#18453B'
			stroke='none'
		>
			<path d='M30 257 c0 -2 22 -26 48 -55 63 -68 81 -68 144 0 26 29 48 53 48 55 0 2 -54 3 -120 3 -66 0 -120 -1 -120 -3z' />
			<path d='M120 86 l0 -45 30 10 c25 9 30 16 30 45 0 31 -3 34 -30 34 -29 0 -30 -2 -30 -44z' />
		</g>
	</SvgIcon>
);

function ButtonEx(props) {
	return (
		<Stack direction='row' spacing={2}>
			<Button variant='default'>OK</Button>
			<Button variant='outline'>Cancel</Button>
			<Button variant='outline'>Delete</Button>
			<Stack
				direction='row'
				spacing={1}
				divider={<Divider orientation='vertical' flexItem />}
			>
				<Button variant='outline'>Edit</Button>
				<Button variant='disabled'>Revision</Button>
			</Stack>
			<Button variant='outline' size={'small'}>
				New
			</Button>
			<Button variant='default' size='icon'>
				+
			</Button>
			<Button variant='outline' size='icon'>
				-
			</Button>
			<Button variant='noline' size='icon'>
				<FilterIcon />
			</Button>
		</Stack>
	);
}

ButtonEx.propTypes = {};

export default ButtonEx;
