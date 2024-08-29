import React from 'react';
import styled from 'styled-components';
import InputSelectField from '../components/InputSelectField';

function FieldTest(props) {
	return (
		<Container>
			<Title>필드를 테스트하는 공간입니다.</Title>
			<InputSelectField
				name='searchFilter'
				placeholder='Enter your search'
				options={[
					{value: 'id', label: 'id'},
					{value: 'name', label: 'name'},
				]}
			/>
		</Container>
	);
}

export default FieldTest;

const Container = styled.div`
	margin: 20px;
`;

const Title = styled.h2`
	margin-bottom: 20px;
`;
