import apis from '../../apis';
import {formidable} from 'formidable';
import {PassThrough} from 'stream';

export const config = {
	api: {
		bodyParser: false,
		externalResolver: true,
	},
};
/**************************************************
 * 파일 스트림 처리 Front -> BFF
 **************************************************/
export const parseForm = (req) =>
	new Promise((resolve, reject) => {
		const form = formidable({
			multiples: true,
			keepExtensions: true,
			//버퍼를 소비하지 않는 백프레셔 문제 해결 (
			fileWriteStreamHandler: (file) => {
				const pass = new PassThrough(); //스트림 생성
				let fileBuffer = Buffer.from(''); //버퍼 준비
				pass.on(
					//데이터 올 때마다 버퍼 채우기
					'data',
					(chunk) => (fileBuffer = Buffer.concat([fileBuffer, chunk])),
				);
				pass.on('end', () => (file.buffer = fileBuffer)); //버퍼 다 차면 파일 객체 저장
				pass.on('error', (err) => reject(err));
				return pass;
			},
		});

		form.parse(req, (err, fields, files) => {
			if (err) return reject(err);
			resolve({fields, files}); // 파싱된 필드와 파일을 반환
		});
	});

/**************************************************
 * 파일 형식 변경
 **************************************************/
export const buildCertificateFormData = async ({fields, files}) => {
	const form = new FormData();

	if (fields.data?.[0]) {
		const {name = ''} = JSON.parse(fields.data?.[0] ?? '{}');
		form.append('requestBody', JSON.stringify({name}));
	}

	if (!files || Object.keys(files).length === 0) return {form};
	for (const key of Object.keys(files)) {
		const fileOrFiles = files[key];

		//파싱한 데이터를 바로 넣어서 보내중
		for (const file of fileOrFiles) {
			form.append(key, file.buffer, {
				// Buffer를 직접 전달
				filename: file.originalFilename,
				contentType: file.mimetype,
			});
		}
	}
	return {form};
};

const create = async (req, res) => {
	const parsed = await parseForm(req);
	console.log('Parsed fields:', parsed.fields);
	console.log('Parsed files:', parsed.files);

	// 2. 파싱된 데이터를 서버에서 사용하기 좋은 형태로 변환합니다.
	const {form} = await buildCertificateFormData(parsed);

	console.log('Extracted request body data:', form);

	const apiResponse = await apis.file.single.create({data: form});

	// 4. 외부 API 응답을 클라이언트에게 전달합니다.
	res.status(apiResponse.status).send(apiResponse.data || {});
};

export default {
	create,
};
