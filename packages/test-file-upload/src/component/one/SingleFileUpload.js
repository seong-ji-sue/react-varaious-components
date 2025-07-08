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

const name = 'file';
const SingleFileUpload = (props) => {
	const methods = useForm();

	const [fileName, setFileName] = useState('');

	const {
		reset,
		setValue,
		watch,
		clearErrors,
		formState: {errors, isSubmitted},
	} = methods;

	const selectedFiles = watch(name);
	console.log(selectedFiles);

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

	const onClickSubmitFile = async (data) => {
		console.log(data);
		try {
			// const formData = new FormData();
			// data.file.forEach((file) => {
			// 	formData.append('file', file);
			// });
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		fileInputRef.current.addEventListener('input', fileInputHandler);
	}, [fileInputRef, fileInputHandler]);

	return (
		<div className={'container'}>
			<div className={'file_container_one'}>
				<FormProvider {...methods}>
					<input className={'hidden_input'} type={'file'} ref={fileInputRef} />
				</FormProvider>
				<input
					className={'input_box'}
					type={'text'}
					value={fileName}
					readOnly={true}
				/>
				<span className={'open_file_button'} onClick={onChangeButtonClick}>
					파일 업로드
				</span>
			</div>
			<div className={'button_group_one'}>
				<button onClick={onClickSubmitFile}>전송</button>
			</div>
		</div>
	);
};

export default SingleFileUpload;
