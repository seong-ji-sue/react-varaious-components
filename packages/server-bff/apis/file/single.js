const create = async ({headers, body}) => {
	console.log(body);

	return {
		status: 200,
	};
};

export default {
	create,
};
