import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {GlobalStyle} from '@jsproject/common';
import Layout from './components/Layout/Layout';
import Webhooks from './pages/Webhooks';
import SSE from './pages/SSE';
import Tailwind from './pages/Tailwind';
import {urlPath} from './utils/url';

const router = createBrowserRouter([
	{
		path: urlPath.base,
		element: <Layout>메인페이지</Layout>,
	},

	{
		path: urlPath.webhooks,
		element: (
			<Layout>
				<Webhooks />
			</Layout>
		),
	},
	{
		path: urlPath.sse,
		element: (
			<Layout>
				<SSE />
			</Layout>
		),
	},
	{
		path: '/tailwind',
		element: (
			<Layout>
				<Tailwind />
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
