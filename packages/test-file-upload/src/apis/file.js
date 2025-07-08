import {Axios} from '../utils/axios';

export const createFileMultiApi = async (params) => {
	return await Axios.post(`/server/file/multi`, {...params});
};

export const createFileSingleApi = async (params) => {
	return await Axios.post(`/server/file/single`, {...params});
};
