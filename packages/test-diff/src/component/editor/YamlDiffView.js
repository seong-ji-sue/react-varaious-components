import React, {useState} from 'react';
import yaml from 'js-yaml';
import {diffJson} from 'diff';

const propertiesToJson = (properties) => {
	const result = {};
	properties.split('\n').forEach((line) => {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			const [key, ...value] = trimmed.split('=');
			result[key.trim()] = value.join('=').trim();
		}
	});
	return result;
};

// 객체의 키를 정렬하는 함수
const sortObjectKeys = (obj) => {
	if (typeof obj !== 'object' || obj === null) return obj;
	return Object.keys(obj)
		.sort()
		.reduce((acc, key) => {
			acc[key] = sortObjectKeys(obj[key]); // 재귀적으로 정렬
			return acc;
		}, {});
};

const DiffViewer = () => {
	const [oldYaml, setOldYaml] = useState(
		`name: Alice\nage: 30\nlocation: Mars`,
	);
	const [newYaml, setNewYaml] = useState(
		`name: Alice\nlocation: Mars\nage: 30`,
	);

	const [oldProperties, setOldProperties] = useState(
		`name=Alice\nage=30\nlocation=Mars`,
	);
	const [newProperties, setNewProperties] = useState(
		`name=Alice\nlocation=Mars\nage=30`,
	);

	const [yamlDiff, setYamlDiff] = useState('');
	const [propertiesDiff, setPropertiesDiff] = useState('');

	const handleYamlCompare = () => {
		try {
			const oldYamlJson = sortObjectKeys(yaml.load(oldYaml));
			const newYamlJson = sortObjectKeys(yaml.load(newYaml));
			const differences = diffJson(oldYamlJson, newYamlJson);

			setYamlDiff(
				differences.length === 1 &&
					!differences[0].added &&
					!differences[0].removed
					? '✅ 차이가 없습니다.'
					: differences
							.map((part) =>
								part.added
									? `+ ${JSON.stringify(part.value, null, 2)}`
									: part.removed
										? `- ${JSON.stringify(part.value, null, 2)}`
										: `  ${JSON.stringify(part.value, null, 2)}`,
							)
							.join('\n'),
			);
		} catch (error) {
			setYamlDiff(`Error: ${error.message}`);
		}
	};

	const handlePropertiesCompare = () => {
		try {
			const oldPropsJson = sortObjectKeys(propertiesToJson(oldProperties));
			const newPropsJson = sortObjectKeys(propertiesToJson(newProperties));
			const differences = diffJson(oldPropsJson, newPropsJson);

			setPropertiesDiff(
				differences.length === 1 &&
					!differences[0].added &&
					!differences[0].removed
					? '✅ 차이가 없습니다.'
					: differences
							.map((part) =>
								part.added
									? `+ ${JSON.stringify(part.value, null, 2)}`
									: part.removed
										? `- ${JSON.stringify(part.value, null, 2)}`
										: `  ${JSON.stringify(part.value, null, 2)}`,
							)
							.join('\n'),
			);
		} catch (error) {
			setPropertiesDiff(`Error: ${error.message}`);
		}
	};

	return (
		<div>
			<h2>YAML vs YAML Diff</h2>
			<textarea
				rows='5'
				cols='30'
				value={oldYaml}
				onChange={(e) => setOldYaml(e.target.value)}
				placeholder='이전 버전 YAML'
			/>
			<textarea
				rows='5'
				cols='30'
				value={newYaml}
				onChange={(e) => setNewYaml(e.target.value)}
				placeholder='최신 버전 YAML'
			/>
			<button onClick={handleYamlCompare}>YAML 비교</button>
			<pre>{yamlDiff}</pre>

			<h2>Properties vs Properties Diff</h2>
			<textarea
				rows='5'
				cols='30'
				value={oldProperties}
				onChange={(e) => setOldProperties(e.target.value)}
				placeholder='이전 버전 Properties'
			/>
			<textarea
				rows='5'
				cols='30'
				value={newProperties}
				onChange={(e) => setNewProperties(e.target.value)}
				placeholder='최신 버전 Properties'
			/>
			<button onClick={handlePropertiesCompare}>Properties 비교</button>
			<pre>{propertiesDiff}</pre>
		</div>
	);
};

export default DiffViewer;
