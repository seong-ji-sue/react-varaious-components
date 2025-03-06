import React, {useState, useMemo} from 'react';
import jsYaml from 'js-yaml';
import {diff_match_patch, DIFF_INSERT, DIFF_DELETE} from 'diff-match-patch';
import CodeMirror from '@uiw/react-codemirror';
import {yaml as yamlLang} from '@codemirror/lang-yaml';
import './TestCompare.scss';
import * as deepDiff from 'deep-diff';
import * as YAML from 'yaml';

/**
 * 예시 데이터
 */
const initialLeftText = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-deployment
  namespace: eddy-dev-zone
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway-container
        image: 192.168.25.109:5000/eddy-api-gateway-dev:161
        resources:
          requests:
            cpu: "500m"  # 0.1 CPU (100 millicpu)
            memory: "512Mi"  # 256 MiB (Mebibytes)
          limits:
            cpu: "500m"  # 0.5 CPU (500 millicpu)
            memory: "512Mi"  # 512 MiB (Mebibytes)
        ports:
        - containerPort: 30111
        env:
        - name: TZ
          value: "Asia/Seoul"
        - name: SPRING_PROFILES_ACTIVE
          value: "dev"
        - name: JAVA_OPTS
          value: "-XX:MinRAMPercentage=80.0 -XX:MaxRAMPercentage=80.0"
          #value: "-Xmx512m -Xms512m"
        volumeMounts:
        - mountPath: /logs
          name: logs-storage
        - mountPath: /config
          name: config-storage
        - mountPath: /cert
          name: cert-storage
      volumes:
      - name: logs-storage
        persistentVolumeClaim:
          claimName: api-gateway-logs-pvc
      - name: config-storage
        persistentVolumeClaim:
          claimName: api-gateway-config-pvc
      - name: cert-storage
        persistentVolumeClaim:
          claimName: api-gateway-cert-pvc
      #nodeName: worker01
`;

const initialRightText = `apiVersion: apps/v2
metadata:
  name: api-gateway-deployment2
  namespace: eddy-dev-zone
kind: Deployment2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway-container
        image: 192.168.25.109:5000/eddy-api-gateway-dev:161
        resources:
          requests:
            cpu: "500m"  # 0.1 CPU (100 millicpu)
            memory: "512Mi"  # 256 MiB (Mebibytes)
          limits:
            cpu: "500m"  # 0.5 CPU (500 millicpu)
            memory: "512Mi"  # 512 MiB (Mebibytes)
        ports:
        - containerPort: 301112
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "dev"
        - name: JAVA_OPTS
          value: "-XX:MinRAMPercentage=80.0 -XX:MaxRAMPercentage=80.0"
          #value: "-Xmx512m -Xms512m"
        volumeMounts:
        - mountPath: /logs
          name: logs-storage
        - mountPath: /config
          name: config-storage
        - mountPath: /cert
          name: cert-storage
      volumes:
      - name: logs-storage
        persistentVolumeClaim:
          claimName: api-gateway-logs-pvc
      - name: config-storage
        persistentVolumeClaim:
          claimName: api-gateway-config-pvc
      #nodeName: worker01
`;

const validateYaml = (yamlText) => {
	try {
		jsYaml.load(yamlText);
		return {isValid: true, error: null};
	} catch (error) {
		return {isValid: false, error: error.message};
	}
};

function getYamlDiff(leftYaml, rightYaml) {
	const leftObj = jsYaml.load(leftYaml);
	const rightObj = jsYaml.load(rightYaml);
	// deep-diff의 결과는 변경점을 나타내는 객체 배열입니다.
	return deepDiff.diff(leftObj, rightObj) || [];
}

/**
 * 주어진 YAML 문자열을 파싱한 후, 최상위 노드에서 재귀적으로
 * path에 해당하는 YAML 노드를 찾습니다.
 *
 * @param {YAML.ast.Node} node 현재 탐색 중인 YAML 노드
 * @param {Array} path 탐색할 경로 (예: ['metadata', 'name'])
 * @returns {YAML.ast.Node|null} 경로에 해당하는 노드 (없으면 null)
 */
function getNodeByPath(node, path) {
	if (!node || path.length === 0) {
		console.log('getNodeByPath: reached end of path or node is null', node);
		return node;
	}
	const [key, ...restPath] = path;
	console.log(
		'getNodeByPath: current node type:',
		node.type,
		' | key:',
		key,
		' | restPath:',
		restPath,
	);

	// Mapping node인 경우
	if (node && node.type === 'MAP' && Array.isArray(node.items)) {
		for (const item of node.items) {
			if (item.key && item.key.value === key) {
				console.log('Found matching key in MAP:', item.key.value);
				return getNodeByPath(item.value, restPath);
			}
		}
		console.log('No matching key found in MAP for:', key);
	}
	// Sequence node인 경우 (path의 key가 숫자일 것으로 기대)
	if (node && node.type === 'SEQ' && Array.isArray(node.items)) {
		const index = Number(key);
		if (!isNaN(index) && node.items[index] !== undefined) {
			console.log('Found matching index in SEQ:', index);
			return getNodeByPath(node.items[index], restPath);
		} else {
			console.log('Index not found in SEQ for key:', key);
		}
	}
	console.log('getNodeByPath: returning null for key:', key);
	return null;
}

function getLine(doc, path) {
	console.log('getLine called with path:', path);
	// AST의 구조 확인: 보통 최상위 노드는 DOCUMENT 타입으로 감싸져 있을 수 있습니다.
	const contents = doc.contents;
	console.log('doc.contents:', contents);
	const root = Array.isArray(contents) ? contents[0] : contents;
	console.log('root node:', root);
	const targetNode = getNodeByPath(root, path);
	console.log('targetNode:', targetNode);
	if (targetNode && targetNode.range && doc.lineCounter) {
		const pos = doc.lineCounter.linePos(targetNode.range[0]);
		console.log('Line position:', pos);
		return pos.line;
	}
	return null;
}

/**
 * 두 YAML 문자열을 파싱하고, deep-diff를 사용해 객체 간 차이를 계산한 후,
 * 각 변경점에 대해 YAML 문서 내 해당 노드의 시작 라인 번호를 매핑하여 반환합니다.
 *
 * @param {string} leftYaml 왼쪽 YAML 문자열
 * @param {string} rightYaml 오른쪽 YAML 문자열
 * @returns {Array} 변경점 배열 (각 변경점은 원본 diff 정보와 함께 leftLine, rightLine 정보를 가짐)
 */
function getYamlDiffWithLineNumbers(leftYaml, rightYaml) {
	// CST 정보를 보존하도록 옵션 추가
	const leftDoc = YAML.parseDocument(leftYaml, {keepCstNodes: true});
	const rightDoc = YAML.parseDocument(rightYaml, {keepCstNodes: true});

	// 객체 비교를 위해 순수 JS 객체로 변환
	const leftObj = leftDoc.toJS();
	const rightObj = rightDoc.toJS();

	// deep-diff로 객체 간 차이를 계산
	const diffs = deepDiff.diff(leftObj, rightObj) || [];

	// 각 diff 변경점에 대해 라인 번호를 매핑
	return diffs.map((change) => {
		let leftLine = null,
			rightLine = null;
		if (change.kind === 'N') {
			rightLine = getLine(rightDoc, change.path);
		} else if (change.kind === 'D') {
			leftLine = getLine(leftDoc, change.path);
		} else if (change.kind === 'E') {
			leftLine = getLine(leftDoc, change.path);
			rightLine = getLine(rightDoc, change.path);
		} else if (change.kind === 'A') {
			// 배열 내부 변경: change.path는 배열의 경로, change.index는 배열 인덱스
			leftLine = getLine(leftDoc, change.path.concat(change.index));
			rightLine = getLine(rightDoc, change.path.concat(change.index));
		}
		return {...change, leftLine, rightLine};
	});
}

const computeDiffs = (oldText, newText) => {
	const dmp = new diff_match_patch();
	const diffs = dmp.diff_main(oldText, newText);
	dmp.diff_cleanupSemantic(diffs);

	let resultOld = '';
	let resultNew = '';

	console.log('diffs', diffs);
	diffs.forEach(([op, text]) => {
		if (op === DIFF_INSERT) {
			resultNew += `<span class="diff-insert">${text}</span>`;
		} else if (op === DIFF_DELETE) {
			resultOld += `<span class="diff-delete">${text}</span>`;
		} else {
			resultOld += text;
			resultNew += text;
		}
	});

	return {resultOld, resultNew};
};

const TestCompare = () => {
	const [oldYaml, setOldYaml] = useState(initialLeftText);
	const [newYaml, setNewYaml] = useState(initialRightText);
	const [showDiff, setShowDiff] = useState(false);

	// YAML 유효성 검사
	const oldYamlValidation = useMemo(() => validateYaml(oldYaml), [oldYaml]);
	const newYamlValidation = useMemo(() => validateYaml(newYaml), [newYaml]);

	console.log('getYamlDiff', getYamlDiff(newYaml, oldYaml));

	// Diff 비교 결과
	const yamlDiff = useMemo(
		() => computeDiffs(oldYaml, newYaml),
		[oldYaml, newYaml],
	);

	const yamlDiffDeep = useMemo(
		() => getYamlDiffWithLineNumbers(oldYaml, newYaml),
		[oldYaml, newYaml],
	);

	console.log(yamlDiffDeep);

	// 파일 업로드 핸들러
	const handleFileUpload = (event, setYaml) => {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => setYaml(e.target.result);
		reader.readAsText(file);
	};
	return (
		<div>
			<h2>YAML 비교</h2>
			<div className='button-container'>
				<button onClick={() => setShowDiff(true)}>Compare</button>
				<button
					onClick={() => {
						setOldYaml('');
						setNewYaml('');
						setShowDiff(false);
					}}
				>
					Clear
				</button>
			</div>
			<div className='editor-container'>
				<div>
					<input
						type='file'
						accept='.yaml,.yml'
						onChange={(e) => handleFileUpload(e, setOldYaml)}
					/>
					<CodeMirror
						value={oldYaml}
						height='300px'
						extensions={[yamlLang()]}
						onChange={setOldYaml}
					/>
					{!oldYamlValidation.isValid && (
						<p className='error'>🚨 오류: {oldYamlValidation.error}</p>
					)}
					{showDiff && (
						<>
							<CodeMirror
								value={yamlDiff.resultOld}
								height='300px'
								extensions={[yamlLang()]}
								onChange={setOldYaml}
							/>
							<pre
								dangerouslySetInnerHTML={{__html: yamlDiff.resultOld}}
								className='diff-output'
							/>
						</>
					)}
				</div>
				<div>
					<input
						type='file'
						accept='.yaml,.yml'
						onChange={(e) => handleFileUpload(e, setNewYaml)}
					/>
					<CodeMirror
						value={newYaml}
						height='300px'
						extensions={[yamlLang()]}
						onChange={setNewYaml}
					/>
					{!newYamlValidation.isValid && (
						<p className='error'>🚨 오류: {newYamlValidation.error}</p>
					)}
					{showDiff && (
						<pre
							dangerouslySetInnerHTML={{__html: yamlDiff.resultNew}}
							className='diff-output'
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default TestCompare;
