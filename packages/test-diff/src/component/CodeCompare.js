import React, {useState, useCallback, useEffect} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import './CodeCompare.scss';
import * as jsYaml from 'js-yaml';
import useExtensionDiff from '../utils/useExtensionDiff';

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
      #nodeName: worker0
`;

const initialRightText = `apiVersion: apps/v1
kind: Deployment
metadata:
     name: api-gateway-deployment2
spec:
     selector:
          matchLabels:
               app: api-gateway
     template:
          metadata:
               labels:
                    app: api-gateway
          spec:
               containers:
                    -
                         name: api-gateway-container
                         image: 192.168.25.109:5000/eddy-api-gateway-dev:161
                         resources:
                              requests:
                                   cpu: 500m
                                   memory: 512Mi
                              limits:
                                   cpu: 500m
                                   memory: 512Mi
                         env:
                              -
                                   name: TZ
                                   value: Asia/Seoul
                              -
                                   name: SPRING_PROFILES_ACTIVE
                                   value: dev
               volumes:
                    -
                         name: logs-storage
                         persistentVolumeClaim2:
                              claimName: api-gateway-logs-pvc
`;

const formatYaml = (data, type) => {
	if (!data) return '';

	const doc = jsYaml.load(data);
	return jsYaml.dump(doc, {
		indent: 2,
		sortKeys: false,
	});
};

// --- Main Component ---
export default function CodeCompare() {
	const [isCompareMode, setIsCompareMode] = useState(false);
	const [leftText, setLeftText] = useState('');
	const [rightText, setRightText] = useState('');

	const {leftExtensions, rightExtensions, rightEditorRef} = useExtensionDiff({
		leftText,
		rightText,
		isCompareMode,
		changeLeftVal: (val) => setLeftText(val),
	});

	const handleReplaceAll = useCallback(() => {
		return setLeftText(rightText);
	}, [leftText, rightText]);

	useEffect(() => {
		setLeftText(formatYaml(initialLeftText));
		setRightText(formatYaml(initialRightText));
	}, []);

	return (
		<div>
			<div style={{marginBottom: '1em'}}>
				{!isCompareMode && (
					<button onClick={() => setIsCompareMode(true)}>Compare</button>
				)}
				{isCompareMode && (
					<button onClick={handleReplaceAll} style={{marginLeft: '1em'}}>
						Replace All
					</button>
				)}
			</div>

			<div className='text-container' style={{display: 'flex', gap: '1rem'}}>
				<div className='editor-container'>
					<h3 className='title'>최신 (좌측, 수정 가능)</h3>
					<CodeMirror
						value={leftText}
						height='300px'
						extensions={leftExtensions}
						onChange={(value) => setLeftText(value)}
					/>
				</div>
				<div className='editor-container'>
					<h3 className='title'>이전 (우측, 읽기 전용)</h3>
					<CodeMirror
						value={rightText}
						height='300px'
						extensions={rightExtensions}
						onCreateEditor={(view) => {
							rightEditorRef.current = view;
						}}
					/>
				</div>
			</div>
		</div>
	);
}
