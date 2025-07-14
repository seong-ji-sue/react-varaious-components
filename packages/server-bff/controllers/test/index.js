import apis from '../../apis';
import {resToListConvertor} from '../../utils/func';
import convertor from '../../utils/convertor';

const findAll = async (req, res) => {
	const data = await apis.test.findAll();
	console.log(data.data);

	res
		.status(data.status)
		.send(resToListConvertor({data, func: convertor.read.test.test}));
};

export default {findAll};
