import React from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {createRoot} from 'react-dom/client';

const router = createBrowserRouter([
	{
		path: '/',
		element: <div>메인페이지</div>,
	},
	{
		path: '/test',
		element: <div>서브페이지</div>,
	},
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
