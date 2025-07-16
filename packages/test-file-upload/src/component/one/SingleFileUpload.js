import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import './SingleFileUpload.scss';
import {createFileSingleApi} from '../../apis/file';

const name = 'file';
const input = 'text';

const buildFormData = (data) => {
	console.log(data);
	const formData = new FormData();

	formData.append('data', JSON.stringify({text: data.text}));
	formData.append('file', data.file);
	for (const pair of formData.entries()) {
		console.log(pair[0] + ': ' + pair[1]);
	}
	return formData;
};

const SingleFileUpload = () => {
	const methods = useForm({
		defaultValues: {
			text: '',
			file: null,
		},
	});

	const {register, handleSubmit, setValue, watch} = methods;
	const [fileName, setFileName] = useState('');
	const fileInputRef = useRef(null);

	const onChangeButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileInputChange = (e) => {
		const files = e.target.files;
		setFileName(files[0].name);
		setValue(name, files[0]);
	};

	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const files = e.dataTransfer.files;
		if (files && files[0]) {
			setFileName(files[0].name);
			setValue(name, files[0]);
		}
	};

	const onClickSubmitFile = async (data) => {
		try {
			const formData = buildFormData(data);
			console.log(formData);
			await createFileSingleApi({data: formData});
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<div className={'container_single'}>
			<FormProvider {...methods}>
				<div className={'container_form'}>
					<input
						{...register(input)}
						className={'text_input'}
						type={'text'}
						placeholder={'텍스트를 입력해주세요~!'}
					/>
					<div
						className={'file_container_one'}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragEnter}
						onDragOver={handleDragEnter}
						onDrop={handleDrop}
					>
						<input
							className={'hidden_input'}
							type={'file'}
							ref={fileInputRef}
							onChange={handleFileInputChange}
						/>

						<input
							className={'input_box'}
							type={'text'}
							value={fileName}
							placeholder={'파일을 업로드 해주세요~!'}
							readOnly={true}
						/>
						<button
							className={'open_file_button-single'}
							onClick={onChangeButtonClick}
						>
							파일 업로드
						</button>
					</div>
				</div>
			</FormProvider>

			<div className={'button_group_one'}>
				<button onClick={methods.handleSubmit(onClickSubmitFile)}>전송</button>
			</div>
		</div>
	);
};

export default SingleFileUpload;
