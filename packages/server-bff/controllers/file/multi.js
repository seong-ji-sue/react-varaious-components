import apis from '../../apis/index.js';

const create = async (req, res) => {
	const data = await apis.file.multi.create({data: {}});
	res.status(data.status).send({});
};

export default {
	create,
};
