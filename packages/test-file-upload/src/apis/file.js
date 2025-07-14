import {Axios} from '../utils/axios';

export const createFileMultiApi = async (params) => {
	return await Axios.post(`/server/file/multi`, {...params});
};

export const createFileSingleApi = async (data) => {
	return await Axios.post(`/server/file/single`, data);
};

export const findAllTestData = async () => {
	return await Axios.get('/server/test');
};
