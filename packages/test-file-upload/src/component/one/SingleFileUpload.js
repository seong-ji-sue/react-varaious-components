import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useDismiss,
	useFloating,
	useHover,
	useInteractions,
	useRole,
} from '@floating-ui/react';
import './SingleFileUpload.scss';
import {createFileSingleApi} from '../../apis/file';

const name = 'file';
const input = 'text';
const SingleFileUpload = (props) => {
	const methods = useForm();

	const [fileName, setFileName] = useState('');

	const {
		register,
		reset,
		setValue,
		watch,
		clearErrors,
		formState: {errors, isSubmitted},
	} = methods;

	const selectedFiles = watch(name);

	const [isOpen, setIsOpen] = useState(false);
	const fileInputRef = useRef(null);

	const {refs, floatingStyles, context} = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: 'bottom-start',
		whileElementsMounted: autoUpdate,
		middleware: [offset(5), flip(), shift()],
	});
	const hover = useHover(context, {move: false});
	const dismiss = useDismiss(context);
	const role = useRole(context, {role: 'tooltip'});
	const {getReferenceProps, getFloatingProps} = useInteractions([
		hover,
		dismiss,
		role,
	]);

	const onChangeButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const fileInputHandler = useCallback((event) => {
		const files = event.target && event.target.files;
		if (files && files[0]) {
			setFileName(event.target.files[0].name);
			setValue(name, event.target.files[0]);
		}
	}, []);

	const buildFormData = (data) => {
		console.log(data);
		const formData = new FormData();

		formData.append('data', JSON.stringify({data: data.text}));
		formData.append(data.file.type, data.file);
	};

	// const onChangeFile = (e, initialFile) => {
	// 	const file = initialFile ? initialFile : e.target.files[0];
	// 	const fileReader = new FileReader();
	//
	// 	if (!file) {
	// 		return;
	// 	} else {
	// 		fileReader.readAsText(file);
	// 	}
	//
	// 	setFileName(file.name);
	//
	// 	console.log('onChangeFile', file);
	// 	// fileReader.onload = async () => {
	// 	// 	setValue(`${name}.name`, file.name);
	// 	// 	setValue(`${name}.result`, fileReader.result);
	// 	// 	setValue(`${name}.uploadedFile`, file);
	// 	//
	// 	// 	setValue(`${name}.size`, file.size);
	// 	// };
	// };

	const onClickSubmitFile = async (data) => {
		try {
			const formData = buildFormData(data);
			await createFileSingleApi({file: formData});
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		fileInputRef.current.addEventListener('input', fileInputHandler);
	}, [fileInputRef, fileInputHandler]);

	return (
		<div className={'container_single'}>
			<FormProvider {...methods}>
				<div className={'container_form'}>
					<input {...register(input)} className={'text_input'} type={'text'} />
					<div className={'file_container_one'}>
						<input
							className={'hidden_input'}
							type={'file'}
							ref={fileInputRef}
						/>

						<input
							className={'input_box'}
							type={'text'}
							value={fileName}
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
