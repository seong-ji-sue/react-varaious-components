export const defaultReqHeader = () => {
	return {
		// Authorization: headers.authorization,
		// 'Namespace-Id': headers.namespaceId,
		'Content-Type': 'application/json',
	};
};

export const resToListConvertor = ({data, func}) => {
	if (!Array.isArray(data?.data)) return [];

	if (!func) return data.data;
	return data.data.map((v) => func(v));
};
