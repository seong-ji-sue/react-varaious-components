import React, {Suspense} from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {GlobalStyle} from '@jsproject/common';
import Layout from './components/Layout/Layout';
import {urlPath} from '@jsproject/common/src/utils/url';

const Tailwind = React.lazy(() => import('tailwind/Page'));
const Mui = React.lazy(() => import('mui/Page'));
const MuiEx = React.lazy(() => import('mui/ExPage'));

const router = createBrowserRouter([
	{
		path: urlPath.base,
		element: <Layout>메인페이지</Layout>,
	},
	{
		path: urlPath.tailwind,
		element: (
			<Layout>
				<Suspense>
					<Tailwind />
				</Suspense>
			</Layout>
		),
	},
	{
		path: urlPath.mui,
		element: (
			<Layout>
				<Suspense>
					<Mui />
				</Suspense>
			</Layout>
		),
	},
	{
		path: urlPath.muiEx,
		element: (
			<Layout>
				<Suspense>
					<MuiEx />
				</Suspense>
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
