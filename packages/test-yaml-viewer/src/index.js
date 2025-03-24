import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import Page from './Page';
import {urlPath} from '@jsproject/common/src/utils/url';

const router = createBrowserRouter([
	{
		path: urlPath.base,
		element: <Page />,
	},
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
