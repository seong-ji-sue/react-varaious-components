import React, {Suspense} from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {GlobalStyle} from '@jsproject/common';
import Layout from './components/Layout/Layout';
import Webhooks from './pages/Webhooks';
import SSE from './pages/SSE';
import {urlPath} from '@jsproject/common/src/utils/url';
import './index.css'; // Tailwind CSS 스타일 가져오기

const Tailwind = React.lazy(() => import('admin/Tailwind'));

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
		path: urlPath.tailwind,
		element: (
			<Layout>
				<Suspense>
					<Tailwind />
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
