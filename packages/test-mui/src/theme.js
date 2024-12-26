import {createTheme} from '@mui/material/styles';
// Define color constants
export const COLORS = {
	GREEN: '#18453B',
	LIGHT_GREY: '#a0a0a0',
	WHITE: '#ffffff',
};

const commonStyles = {
	cursor: 'pointer',
	border: `1px solid ${COLORS.GREEN}`,
	borderRadius: '4px',
	minWidth: 'fit-content',
	fontWeight: 'bold',
	textTransform: 'none',
};

// Create custom theme
const theme = createTheme({
	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
				size: 'medium',
			},
			styleOverrides: {
				root: commonStyles,
				sizeSmall: {
					width: '40px',
					height: '25px',
					fontSize: '12px',
					padding: '3px 5px',
				},
				sizeMedium: {
					fontSize: '12px',
					width: '60px',
					height: '30px',
					padding: '3px 5px',
				},
				sizeIcon: {
					width: 'fit-content',
					fontSize: '12px',
					padding: '3px 6px',
				},
			},
			variants: [
				{
					props: {variant: 'default'},
					style: {
						backgroundColor: COLORS.GREEN,
						color: COLORS.WHITE,
						boxShadow: 'inset 0 0 100px 100px rgba(255,255,255,0.1)',
						border: `1px solid ${COLORS.GREEN}`,
					},
				},
				{
					props: {variant: 'outline'},
					style: {
						backgroundColor: 'transparent',
						color: COLORS.GREEN,
						boxShadow: 'inset 0 0 100px 100px rgba(0,0,0,0.04)',
						border: `1px solid ${COLORS.GREEN}`,
					},
				},
				{
					props: {variant: 'disabled'},
					style: {
						backgroundColor: 'transparent',
						color: COLORS.LIGHT_GREY,
						border: `1px solid ${COLORS.LIGHT_GREY}`,
						cursor: 'default',
					},
				},
				{
					props: {variant: 'noline'},
					style: {
						backgroundColor: 'transparent',
						border: 'none',
					},
				},
			],
		},
	},
});

export default theme;
