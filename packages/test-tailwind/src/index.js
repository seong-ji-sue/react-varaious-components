import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {GlobalStyle} from '@jsproject/common';
import {urlPath} from '@jsproject/common/src/utils/url';
import Page from './Page';
import './index.css'; // Tailwind CSS 스타일 가져오기

const router = createBrowserRouter([
	{
		path: urlPath.base,
		element: <Page />,
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
