import axios from 'axios';

const Axios = axios.create({
	baseURL: process.env.NODE_SERVER_URL,
	timeout: 4000,
	withCredentials: true,
	paramsSerializer: {indexes: null},
});

export default Axios;
