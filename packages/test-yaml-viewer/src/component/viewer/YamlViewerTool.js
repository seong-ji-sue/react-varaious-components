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
	const [jsonData, setJsonData] = useState({});
	const [isTreeView, setIsTreeView] = useState(false);

	const [showDialog, setShowDialog] = useState(false);
	const [dialogFileName, setDialogFileName] = useState('');
	const [dialogFileContent, setDialogFileContent] = useState('');

	// 파일 업로드용
	const fileInputRef = useRef(null);

	// 초기 YAML 설정
	useEffect(() => {
		setYamlText(formatYaml(initialLeftText));
	}, []);

	// CodeMirror 확장
	const extensions = useMemo(() => [yaml()], []);

	// 파일 업로드 다이얼로그 열기
	const handleOpenFileDialog = () => {
		setShowDialog(true);
		// 혹시 이전에 남아있을 수 있는 상태값 초기화
		setDialogFileName('');
		setDialogFileContent('');
	};

	// 다이얼로그 내에서 "browse" 또는 input 을 클릭하면 숨겨진 file input 트리거
	const handleBrowseFile = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = ''; // 동일 파일 다시 열 때를 대비해 초기화
			fileInputRef.current.click();
		}
	};

	// 파일 선택 후 FileReader 로 읽기
	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setDialogFileName(file.name);

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result;
			setDialogFileContent(typeof content === 'string' ? content : '');
		};
		reader.readAsText(file);
	};

	// 다이얼로그 확인 버튼 -> 에디터에 파일 내용 반영
	const handleConfirmDialog = () => {
		if (dialogFileContent) {
			setYamlText(formatYaml(dialogFileContent));
		}
		setShowDialog(false);
	};

	// 다이얼로그 취소 버튼
	const handleCancelDialog = () => {
		setShowDialog(false);
	};

	// YAML 파일 다운로드
	const handleDownload = useCallback(() => {
		const blob = new Blob([yamlText], {type: 'application/octet-stream'});
		FileSaver.saveAs(blob, 'exported.yaml');
	}, [yamlText]);

	// YAML 텍스트 복사
	const handleCopy = useCallback(() => {
		copy(yamlText);
		alert('카피 되었습니다');
	}, [yamlText]);

	// clear (YAML, JSON 모두 비움)
	const handleClear = useCallback(() => {
		setYamlText('');
		setJsonData({});
	}, []);

	// JSON 수정/삭제/추가 콜백
	const handleJsonChange = (edit) => {
		if (edit.updated_src) {
			setJsonData(edit.updated_src);
		}
	};

	// View 토글 (YAML <-> Tree)
	const handleToggleView = useCallback(() => {
		if (!isTreeView) {
			// YAML -> Tree
			try {
				const parsed = jsYaml.load(yamlText);
				setJsonData(parsed || {});
				setIsTreeView(true);
			} catch (err) {
				alert(`YAML 파싱 오류: ${err.message}`);
			}
		} else {
			// Tree -> YAML
			try {
				const dumped = jsYaml.dump(jsonData);
				setYamlText(dumped);
				setIsTreeView(false);
			} catch (err) {
				alert(`JSON -> YAML 변환 오류: ${err.message}`);
			}
		}
	}, [isTreeView, yamlText, jsonData]);

	return (
		<div>
			{/* 숨겨진 file input */}
			<input
				ref={fileInputRef}
				type='file'
				style={{display: 'none'}}
				onChange={handleFileChange}
			/>

			{/* 상단 버튼들 */}
			<div style={{marginBottom: '16px'}}>
				{/* YAML View 일 때만 파일 열기 가능, Tree View 시엔 비활성화 */}
				<button
					onClick={!isTreeView ? handleOpenFileDialog : undefined}
					disabled={isTreeView}
				>
					open file
				</button>
				<button onClick={handleDownload}>download file</button>
				<button onClick={handleCopy}>copy clipboard</button>
				<button onClick={handleClear}>clear</button>
				<button onClick={handleToggleView}>
					{isTreeView ? 'yaml view' : 'tree view'}
				</button>
			</div>

			{showDialog && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(0,0,0,0.3)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
					}}
				>
					<div
						style={{
							backgroundColor: '#fff',
							padding: '20px',
							borderRadius: '8px',
							minWidth: '300px',
						}}
					>
						<h3>파일 업로드</h3>
						{/* 파일명 입력란 (readOnly) */}
						<input
							type='text'
							value={dialogFileName}
							readOnly
							placeholder='파일 이름'
							onClick={handleBrowseFile}
							style={{
								width: '100%',
								marginBottom: '10px',
								cursor: 'pointer',
								padding: '6px',
							}}
						/>
						{/* 별도 browse 버튼 */}
						<button onClick={handleBrowseFile}>browse</button>

						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								marginTop: '10px',
							}}
						>
							<button onClick={handleConfirmDialog}>확인</button>
							<button onClick={handleCancelDialog} style={{marginLeft: '8px'}}>
								취소
							</button>
						</div>
					</div>
				</div>
			)}

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
						backgroundColor: '#2b2b2b',
						color: '#fff',
						padding: '8px',
					}}
				>
					<ReactJson
						src={jsonData}
						theme='monokai'
						onEdit={handleJsonChange}
						onAdd={handleJsonChange}
						onDelete={handleJsonChange}
						displayDataTypes={false}
						displayObjectSize={false}
					/>
				</div>
			)}
		</div>
	);
};

export default YamlViewerTool;
