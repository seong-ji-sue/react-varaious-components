import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {GlobalStyle} from '@jsproject/common';
import Layout from './components/Layout/Layout';
import Webhooks from './pages/Webhooks';
import SSE from './pages/SSE';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout>메인페이지</Layout>,
	},
	{
		path: '/test',
		element: (
			<Layout>
				<div>test</div>
			</Layout>
		),
	},
	{
		path: '/webhooks',
		element: (
			<Layout>
				<Webhooks />
			</Layout>
		),
	},
	{
		path: '/sse',
		element: (
			<Layout>
				<SSE />
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
