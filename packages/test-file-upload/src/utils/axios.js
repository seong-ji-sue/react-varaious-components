import axios from 'axios';

export const Axios = axios.create({
	baseURL: process.env.BFF_SERVER_URL,
	withCredentials: true,
});
