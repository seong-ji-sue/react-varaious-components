import React, {useRef, useState} from 'react';
import './MultiFileUpload.scss';
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
import {createFileMultiApi} from '../../apis/file';

const name = 'file';

export const minusIcon = (
	<svg
		width='16'
		height='16'
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path d='M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z' fill='#DFE4EA' />
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M12 8.75H4v-1.5h8v1.5z'
			fill='#637381'
		/>
	</svg>
);

const MultiFileUpload = () => {
	const methods = useForm();

	const {
		reset,
		setValue,
		watch,
		clearErrors,
		formState: {errors, isSubmitted},
	} = methods;

	const selectedFiles = watch(name, []);
	const err = errors?.[name];

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

	const onEventBlock = (event) => event.preventDefault();

	const onDropFile = (event) => {
		event.preventDefault();
		addFilesToSelectedState(event.dataTransfer.files);
	};

	const addFilesToSelectedState = (files) => {
		const newFiles = Array.from(files);
		const currentFiles = watch(name, []);

		const uniqueNewFiles = newFiles.filter(
			(newFile) =>
				!currentFiles.some(
					(existingFile) =>
						existingFile.name === newFile.name &&
						existingFile.size === newFile.size,
				),
		);

		// 추가하려는 파일이 없는 경우 (모두 중복인 경우) 함수 종료
		if (uniqueNewFiles.length === 0) {
			return;
		}

		// if (currentFiles.length + uniqueNewFiles.length > 3) {
		// 	// 3개를 초과하면 Toast 에러를 띄우고 아무 파일도 추가하지 않음
		// 	alert('최대 3개의 파일만 첨부할 수 있습니다.');
		// 	return; // 함수를 즉시 종료
		// }
		if (err) clearErrors(name);

		setValue(name, [...currentFiles, ...uniqueNewFiles], {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const onChangeButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const onClickFileChange = (event) => {
		addFilesToSelectedState(event.target.files);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const onClickRemoveFile = (indexToRemove) => {
		const updatedFiles = selectedFiles.filter(
			(_, index) => index !== indexToRemove,
		);
		setValue(name, updatedFiles, {shouldValidate: true, shouldDirty: true});

		// if (updatedFiles.length <= 3 && errors[name]) {
		// 	clearErrors(name);
		// }
	};

	const onClickRemoveAll = () => {
		if (selectedFiles.length === 0) alert('파일 업로드 해주세요');
		else reset();
	};

	const onClickSubmitFile = async (data) => {
		console.log(data);
		try {
			const formData = new FormData();
			if (!data?.file || data.file.length === 0) {
				alert('파일 업로드 해주세요');
				return;
			}
			data.file.forEach((file) => {
				formData.append('file', file);
			});
			await createFileMultiApi({file: formData});
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<div className={'container'}>
			<div className={'file_container'}>
				<div className={'file_container_one'}>
					<FormProvider {...methods}>
						<input
							className={'hidden_input'}
							type={'file'}
							onChange={onClickFileChange}
							ref={fileInputRef}
							multiple
						/>
					</FormProvider>
					<button className={'open_file_button'} onClick={onChangeButtonClick}>
						파일 업로드
					</button>
					<span>
						파일 업로드
						{selectedFiles.length}개
					</span>
				</div>
				<div
					className={'file_upload_container'}
					onDragOver={onEventBlock}
					onDragEnter={onEventBlock}
					onDragLeave={onEventBlock}
					onDrop={onDropFile}
					ref={refs.setReference}
					{...getReferenceProps()}
				>
					{selectedFiles.length > 0 ? (
						<ul className={'file_list'}>
							{selectedFiles.map((file, index) => (
								<li key={index} className={'file_list_item'}>
									<span>{file.name}</span>
									<span
										className={'default_icon'}
										onClick={() => onClickRemoveFile(index)}
									>
										<span className={'icon_hover'}>{minusIcon}</span>
									</span>
								</li>
							))}
						</ul>
					) : (
						<p>파일을 업로드 해주세요~!</p>
					)}
				</div>
			</div>
			<div className={'button_group'}>
				<button className={'button'} onClick={onClickRemoveAll}>
					초기화
				</button>
				<button
					className={'button'}
					onClick={methods.handleSubmit(onClickSubmitFile)}
				>
					전송
				</button>
			</div>
		</div>
	);
};

export default MultiFileUpload;
