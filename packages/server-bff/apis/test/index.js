const findAll = async () => {
	// return await Axios.get(reqApi.test, {
	// 	header: {},
	// });

	return {
		status: 200,
		data: [
			{
				name: 'jstest',
				description: 'asdasd',
			},
		],
	};
};

export default {
	findAll,
};
