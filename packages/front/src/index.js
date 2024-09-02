import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {GlobalStyle} from '@jsproject/common';
import InputSelectField from './components/Contents/InputSelectField';
import FieldTest from './pages/FieldTest';
import Layout from './components/Layout/Layout';

const router = createBrowserRouter([
	{
		path: '/',
		element: <div>메인페이지</div>,
	},
	{
		path: '/input-select',
		element: (
			<Layout>
				<FieldTest />
			</Layout>
		),
	},
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
	<>
		<GlobalStyle />
		<RouterProvider router={router} />
	</>,
);
