import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {urlPath} from '@jsproject/common/src/utils/url';
import TestPage from './TestPage';

const router = createBrowserRouter([
	{
		path: urlPath.base,
		element: <TestPage />,
	},
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
