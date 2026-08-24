import React, {useState} from 'react';
import {useForm} from 'react-hook-form';

const FileTextBox = (props) => {
	const method = useForm();

	const [isOpen, setIsOpen] = useState(false);

	const onFileChange = async () => {
		console.log('asd');
	};

	const onClickBrowserBtn = () => {
		console.log('asd');
	};

	return (
		<div>
			<input value={'file'} onChange={onFileChange} />
			<span onClick={onClickBrowserBtn}>Browser</span>
		</div>
	);
};

export default FileTextBox;
