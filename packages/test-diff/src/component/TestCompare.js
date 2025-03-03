import React, {useState, useMemo} from 'react';
import yaml from 'js-yaml';
import {diff_match_patch, DIFF_INSERT, DIFF_DELETE} from 'diff-match-patch';
import CodeMirror from '@uiw/react-codemirror';
import {yaml as yamlLang} from '@codemirror/lang-yaml';
import './TestCompare.scss';

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
  name: api-gateway-deployment
  namespace: eddy-dev-zone
kind: Deployment
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

const validateYaml = (yamlText) => {
	try {
		yaml.load(yamlText);
		return {isValid: true, error: null};
	} catch (error) {
		return {isValid: false, error: error.message};
	}
};

const computeDiffs = (oldText, newText) => {
	const dmp = new diff_match_patch();
	const diffs = dmp.diff_main(oldText, newText);
	dmp.diff_cleanupSemantic(diffs);

	let resultOld = '';
	let resultNew = '';

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

	// Diff 비교 결과
	const yamlDiff = useMemo(
		() => computeDiffs(oldYaml, newYaml),
		[oldYaml, newYaml],
	);

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
						<pre
							dangerouslySetInnerHTML={{__html: yamlDiff.resultOld}}
							className='diff-output'
						/>
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
		</div>
	);
};

export default TestCompare;
