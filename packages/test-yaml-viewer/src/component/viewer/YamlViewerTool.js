import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import * as jsYaml from 'js-yaml';
import * as FileSaver from 'file-saver';
import {yaml} from '@codemirror/lang-yaml';
import copy from 'copy-to-clipboard';
import ReactJson from 'react-json-view';

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
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        ports:
        - containerPort: 30111
        env:
        - name: TZ
          value: "Asia/Seoul"
        - name: SPRING_PROFILES_ACTIVE
          value: "dev"
        - name: JAVA_OPTS
          value: "-XX:MinRAMPercentage=80.0 -XX:MaxRAMPercentage=80.0"
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
`;

const formatYaml = (data) => {
	if (!data) return '';
	try {
		const doc = jsYaml.load(data);
		return jsYaml.dump(doc, {
			indent: 2,
			sortKeys: false,
		});
	} catch (err) {
		// YAML 파싱 실패 시 원본 그대로 반환
		return data;
	}
};

const YamlViewerTool = () => {
	const [yamlText, setYamlText] = useState('');
	// JSON 트리뷰에 표시할 객체 상태
	const [jsonData, setJsonData] = useState({});
	// 현재 뷰 모드 (false: YAML View, true: Tree View)
	const [isTreeView, setIsTreeView] = useState(false);

	// 초기 YAML 텍스트 설정
	useEffect(() => {
		setYamlText(formatYaml(initialLeftText));
	}, []);

	// CodeMirror 확장
	const extensions = useMemo(() => [yaml()], []);

	// YAML → 파일 다운로드
	const handleDownload = useCallback(() => {
		const blob = new Blob([yamlText], {type: 'application/octet-stream'});
		FileSaver.saveAs(blob, 'exported.yaml');
	}, [yamlText]);

	// YAML → 클립보드 복사
	const handleCopy = useCallback(() => {
		copy(yamlText);
		alert('카피 되었습니다');
	}, [yamlText]);

	// YAML 내용 clear
	const handleClear = useCallback(() => {
		setYamlText('');
	}, []);

	// react-json-view 에서 수정/삭제/추가가 일어났을 때 호출될 콜백
	const handleJsonChange = (edit) => {
		if (edit.updated_src) {
			setJsonData(edit.updated_src);
		}
	};

	// "tree view" / "yaml view" 토글 버튼 클릭
	const handleToggleView = () => {
		if (!isTreeView) {
			// YAML View -> Tree View
			try {
				const parsed = jsYaml.load(yamlText);
				setJsonData(parsed || {});
				setIsTreeView(true);
			} catch (err) {
				alert(`YAML 파싱 오류: ${err.message}`);
			}
		} else {
			// Tree View -> YAML View
			try {
				const dumped = jsYaml.dump(jsonData);
				setYamlText(dumped);
				setIsTreeView(false);
			} catch (err) {
				alert(`JSON -> YAML 변환 오류: ${err.message}`);
			}
		}
	};

	return (
		<div>
			{/* 상단 버튼들 */}
			<div style={{marginBottom: '16px'}}>
				<button>open file</button>
				<button onClick={handleDownload}>download file</button>
				<button onClick={handleCopy}>copy clipboard</button>
				<button onClick={handleClear}>clear</button>
				<button onClick={handleToggleView}>
					{isTreeView ? 'yaml view' : 'tree view'}
				</button>
			</div>

			{/* YAML View */}
			{!isTreeView && (
				<CodeMirror
					value={yamlText}
					width='700px'
					height='500px'
					extensions={extensions}
					onChange={(value) => setYamlText(value)}
				/>
			)}

			{/* Tree View */}
			{isTreeView && (
				<div
					style={{
						width: '700px',
						minHeight: '500px',
						border: '1px solid #ccc',
						backgroundColor: '#2b2b2b', // react-json-view는 어두운 테마일 때 배경이 어두운 편이 잘 어울림
						color: '#fff',
						padding: '8px',
					}}
				>
					<ReactJson
						src={jsonData}
						theme='monokai' // 테마 (원하는 대로 변경 가능)
						onEdit={handleJsonChange}
						onAdd={handleJsonChange}
						onDelete={handleJsonChange}
						displayDataTypes={false} // 타입 표시 여부
						displayObjectSize={false}
					/>
				</div>
			)}
		</div>
	);
};

export default YamlViewerTool;
