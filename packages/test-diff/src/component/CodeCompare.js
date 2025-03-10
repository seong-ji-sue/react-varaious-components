import React, {useState, useMemo, useCallback, useRef} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {yaml} from '@codemirror/lang-yaml';
import {EditorView, Decoration, ViewPlugin, WidgetType} from '@codemirror/view';
import {
	diff_match_patch,
	DIFF_EQUAL,
	DIFF_INSERT,
	DIFF_DELETE,
} from 'diff-match-patch';
import './CodeCompare.scss';
import * as jsYaml from 'js-yaml';
import * as deepDiff from 'deep-diff';
import {load as parseYamlAST, Kind} from 'yaml-ast-parser';
import {
	assign,
	cloneDeep,
	flatMap,
	forEach,
	get,
	isNumber,
	reduce,
	set,
	uniq,
} from 'lodash-es';

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

// YAML 텍스트에서 특정 위치(position)의 라인 번호를 반환합니다.
function getLineNumber(yamlText, position) {
	return yamlText.slice(0, position).split('\n').length;
}

// AST의 MAP, SEQ 노드를 재귀적으로 순회하면서
// 각 노드의 전체 경로(fullKey), 값(value), 그리고 라인 번호(line)를 평탄화된 객체로 반환합니다.
function flattenAST(node, yamlText, parent = '') {
	if (!node) return {};
	let result = {};

	// MAP 노드 처리
	if (node.kind === Kind.MAP) {
		forEach(node.mappings, (mapping) => {
			if (!mapping.key) return;
			const key = mapping.key.value;
			const fullKey = parent ? `${parent}.${key}` : key;
			const line = getLineNumber(yamlText, mapping.key.startPosition);
			const value = mapping.value ? mapping.value.value : undefined;
			result[fullKey] = {value, line};
			// 하위 노드가 MAP이나 SEQ라면 재귀 호출
			if (
				mapping.value &&
				(mapping.value.kind === Kind.MAP || mapping.value.kind === Kind.SEQ)
			) {
				assign(result, flattenAST(mapping.value, yamlText, fullKey));
			}
		});
	}
	// SEQ 노드 처리
	else if (node.kind === Kind.SEQ) {
		forEach(node.items, (item, i) => {
			const fullKey = `${parent}[${i}]`;
			const line = getLineNumber(yamlText, item.startPosition);
			const value = item.value !== undefined ? item.value : item;
			result[fullKey] = {value, line};
			// 하위 노드가 MAP이나 SEQ라면 재귀 호출
			if (item && (item.kind === Kind.MAP || item.kind === Kind.SEQ)) {
				assign(result, flattenAST(item, yamlText, fullKey));
			}
		});
	}
	return result;
}

// diff.path 배열을 "a.b[0].c" 형태의 문자열로 변환합니다.
function buildKey(pathArray) {
	return reduce(
		pathArray,
		(acc, cur) =>
			isNumber(cur) ? `${acc}[${cur}]` : acc ? `${acc}.${cur}` : cur,
		'',
	);
}

// diff 객체에 AST 평탄화 결과(leftFlat, rightFlat)를 참조하여
// leftLine, rightLine (및 배열 아이템의 경우 item.leftLine, item.rightLine)을 주입합니다.
function annotateDiffsWithLine(diffs, leftFlat, rightFlat) {
	const annotated = cloneDeep(diffs);
	forEach(annotated, (diff) => {
		console.log(diff);
		// 배열 요소 변경(diff.kind === 'A')
		if (diff.kind === 'A' && isNumber(diff.index)) {
			const parentKey = buildKey(diff.path);
			const fullKey = `${parentKey}[${diff.index}]`;
			set(diff, 'item.leftLine', get(leftFlat, [fullKey, 'line']));
			set(diff, 'item.rightLine', get(rightFlat, [fullKey, 'line']));
			set(diff, 'leftLine', get(leftFlat, [parentKey, 'line']));
			set(diff, 'rightLine', get(rightFlat, [parentKey, 'line']));
		}
		// 일반 객체 변경(diff.path 존재)
		else if (diff.path) {
			const key = buildKey(diff.path);
			set(diff, 'leftLine', get(leftFlat, [key, 'line']));
			set(diff, 'rightLine', get(rightFlat, [key, 'line']));
		}
	});
	return annotated;
}

// YAML 문자열 두 개를 비교하여 diff와 각 변경점이 속한 라인 번호 목록을 반환합니다.
function getYamlDiff(leftYaml, rightYaml) {
	// YAML 객체 파싱
	const leftObj = jsYaml.load(leftYaml);
	const rightObj = jsYaml.load(rightYaml);
	const diffs = deepDiff.diff(leftObj, rightObj) || [];

	console.log(diffs);

	// AST 파싱 후 평탄화 진행
	const leftAST = parseYamlAST(leftYaml);
	const rightAST = parseYamlAST(rightYaml);
	const leftFlat = flattenAST(leftAST, leftYaml);
	const rightFlat = flattenAST(rightAST, rightYaml);

	// diff 객체에 라인 번호 주입
	const resultDiff = annotateDiffsWithLine(diffs, leftFlat, rightFlat);

	// 모든 diff 항목의 라인 번호를 Set에 모아 중복 제거
	const leftLineSet = new Set();
	const rightLineSet = new Set();
	forEach(resultDiff, (diff) => {
		if (diff.leftLine != null) leftLineSet.add(diff.leftLine);
		if (diff.rightLine != null) rightLineSet.add(diff.rightLine);
		if (diff.item) {
			if (diff.item.leftLine != null) leftLineSet.add(diff.item.leftLine);
			if (diff.item.rightLine != null) rightLineSet.add(diff.item.rightLine);
		}
	});

	// 정렬된 배열로 변환하여 반환
	return {
		leftLineList: Array.from(leftLineSet).sort((a, b) => a - b),
		rightLineList: Array.from(rightLineSet).sort((a, b) => a - b),
	};
}
/**
 * (1) 라인 순서 무시: "내용이 같은 라인"은 매칭 → diff 제외
 * (2) 매칭되지 않은 라인은 unmatched → diff
 * (3) "unmatched" 라인 중 "좌/우 인덱스가 동일"한 곳끼리 부분 문자열 diff
 */
function computeDiffsIgnoringPosition(leftText, rightText) {
	const leftLines = leftText.split('\n');
	const rightLines = rightText.split('\n');

	// 1) 좌측 라인 내용 → 인덱스 목록
	const leftMap = new Map(); // Map<lineString, number[]>
	for (let i = 0; i < leftLines.length; i++) {
		const line = leftLines[i];
		if (!leftMap.has(line)) {
			leftMap.set(line, []);
		}
		leftMap.get(line).push(i);
	}

	// 2) 우측 라인을 순회하며 "같은 내용" 매칭
	const leftMatched = new Array(leftLines.length).fill(false);
	const rightMatched = new Array(rightLines.length).fill(false);

	for (let j = 0; j < rightLines.length; j++) {
		const line = rightLines[j];
		const idxList = leftMap.get(line);
		if (!idxList || idxList.length === 0) {
			continue; // unmatched
		}
		let matchedIndex = -1;
		for (let k = 0; k < idxList.length; k++) {
			const li = idxList[k];
			if (!leftMatched[li]) {
				matchedIndex = li;
				idxList.splice(k, 1);
				break;
			}
		}
		if (matchedIndex !== -1) {
			leftMatched[matchedIndex] = true;
			rightMatched[j] = true;
		}
	}

	// 4) 문자 단위 diff: "좌/우에서 모두 unmatched이고, 인덱스 동일"인 경우만 부분 문자열 diff
	const leftCharDiffs = [];
	const rightCharDiffs = [];
	const dmp = new diff_match_patch();

	const maxLen = Math.max(leftLines.length, rightLines.length);
	for (let i = 0; i < maxLen; i++) {
		const leftUnmatched = i < leftMatched.length && !leftMatched[i];
		const rightUnmatched = i < rightMatched.length && !rightMatched[i];
		if (leftUnmatched && rightUnmatched) {
			const lLine = leftLines[i] ?? '';
			const rLine = rightLines[i] ?? '';
			const diffs = dmp.diff_main(lLine, rLine);
			dmp.diff_cleanupSemantic(diffs);

			let leftPos = 0;
			let rightPos = 0;
			for (const [op, text] of diffs) {
				if (op === DIFF_EQUAL) {
					leftPos += text.length;
					rightPos += text.length;
				} else if (op === DIFF_DELETE) {
					const start = leftPos;
					const end = leftPos + text.length;
					leftPos = end;
					const isWhitespace = text.trim() === '' && text !== '';
					leftCharDiffs.push({
						lineNumber: i + 1,
						from: start,
						to: end,
						isWhitespaceDiff: isWhitespace,
					});
				} else if (op === DIFF_INSERT) {
					const start = rightPos;
					const end = rightPos + text.length;
					rightPos = end;
					const isWhitespace = text.trim() === '' && text !== '';
					rightCharDiffs.push({
						lineNumber: i + 1,
						from: start,
						to: end,
						isWhitespaceDiff: isWhitespace,
					});
				}
			}
		}
	}

	return {leftCharDiffs, rightCharDiffs};
}

// --- Editor ViewPlugin 헬퍼 ---
function lineDiffHighlighter(lineNumbers, className) {
	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDeco(view);
			}
			update(update) {
				if (update.docChanged) this.decorations = this.buildDeco(update.view);
			}
			buildDeco(view) {
				const widgets = [];
				for (let i = 1; i <= view.state.doc.lines; i++) {
					if (lineNumbers.includes(i)) {
						const line = view.state.doc.line(i);
						widgets.push(Decoration.line({class: className}).range(line.from));
					}
				}
				return Decoration.set(widgets);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

function charDiffHighlighter(charDiffs, classFull, classWhitespace) {
	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDeco(view);
			}
			update(update) {
				if (update.docChanged) this.decorations = this.buildDeco(update.view);
			}
			buildDeco(view) {
				const ranges = [];
				for (const {lineNumber, from, to, isWhitespaceDiff} of charDiffs) {
					if (lineNumber > view.state.doc.lines) continue;
					const line = view.state.doc.line(lineNumber);
					const startPos = Math.min(line.from + from, line.to);
					const endPos = Math.min(line.from + to, line.to);
					if (startPos < endPos) {
						ranges.push(
							Decoration.mark({
								class: isWhitespaceDiff ? classWhitespace : classFull,
							}).range(startPos, endPos),
						);
					}
				}
				return Decoration.set(ranges);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

function diffWidgetMarker(diffLines, onArrowClick) {
	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDeco(view);
			}
			update(update) {
				if (update.docChanged) this.decorations = this.buildDeco(update.view);
			}
			buildDeco(view) {
				const widgets = [];
				for (let i = 1; i <= view.state.doc.lines; i++) {
					if (diffLines.includes(i)) {
						const line = view.state.doc.line(i);
						widgets.push(
							Decoration.widget({
								widget: new ClickableArrowWidget(i, onArrowClick),
								side: -1,
							}).range(line.from),
						);
					}
				}
				return Decoration.set(widgets);
			}
		},
		{decorations: (v) => v.decorations},
	);
}

class ClickableArrowWidget extends WidgetType {
	constructor(lineNumber, onArrowClick) {
		super();
		this.lineNumber = lineNumber;
		this.onArrowClick = onArrowClick;
	}
	toDOM() {
		const span = document.createElement('span');
		span.textContent = '←';
		span.style.color = 'red';
		span.style.fontWeight = 'bold';
		span.style.cursor = 'pointer';
		span.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.onArrowClick(this.lineNumber);
		};
		return span;
	}
}

// --- Editor 확장 헬퍼 함수 ---
function getLeftExtensions(
	showDiff,
	leftLineList,
	leftCharDiffs,
	rightEditorRef,
) {
	const exts = [yaml()];
	if (showDiff) {
		exts.push(lineDiffHighlighter(leftLineList, 'diff-line-red'));
		exts.push(
			charDiffHighlighter(
				leftCharDiffs,
				'diff-chars-red',
				'diff-chars-whitespace',
			),
		);
	}
	exts.push(
		EditorView.updateListener.of((update) => {
			if (update.selectionSet && rightEditorRef.current) {
				const pos = update.state.selection.main.head;
				const lineNumber = update.state.doc.lineAt(pos).number;
				const rightState = rightEditorRef.current.state;
				if (lineNumber <= rightState.doc.lines) {
					const line = rightState.doc.line(lineNumber);
					rightEditorRef.current.dispatch({
						selection: {anchor: line.from, head: line.to},
					});
				}
			}
		}),
	);
	return exts;
}

function getRightExtensions(
	showDiff,
	rightLineList,
	rightCharDiffs,
	onArrowClick,
) {
	const exts = [yaml()];
	if (showDiff) {
		exts.push(lineDiffHighlighter(rightLineList, 'diff-line-green'));
		exts.push(
			charDiffHighlighter(
				rightCharDiffs,
				'diff-chars-green',
				'diff-chars-whitespace',
			),
		);
		exts.push(diffWidgetMarker(rightLineList, onArrowClick));
	}
	exts.push(
		EditorView.editable.of(false),
		EditorView.theme({
			'.cm-selectionMatch': {backgroundColor: 'transparent !important'},
			'.cm-selectionMatch *': {backgroundColor: 'transparent !important'},
		}),
		EditorView.domEventHandlers({
			mousedown: (e) => {
				e.preventDefault();
				return true;
			},
			mouseup: (e) => {
				e.preventDefault();
				return true;
			},
			mousemove: (e) => {
				e.preventDefault();
				return true;
			},
		}),
	);
	return exts;
}

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
	const [showDiff, setShowDiff] = useState(false);
	const [leftText, setLeftText] = useState(formatYaml(initialLeftText));
	const [rightText] = useState(formatYaml(initialRightText));

	const {leftLineList, rightLineList, leftCharDiffs, rightCharDiffs} =
		useMemo(() => {
			if (!showDiff) {
				return {
					leftLineList: [],
					rightLineList: [],
					leftCharDiffs: [],
					rightCharDiffs: [],
				};
			}
			return {
				...computeDiffsIgnoringPosition(leftText, rightText),
				...getYamlDiff(leftText, rightText),
			};
		}, [showDiff, leftText, rightText]);

	const rightEditorRef = useRef(null);

	/**
	 * 화살표 클릭 시, 우측 라인에서 key를 추출하여,
	 * 좌측 전체에서 동일 key가 있으면 모두 찾아 교체.
	 * 동일 key가 없으면 해당 위치에 새 라인을 삽입.
	 */
	const onArrowClick = useCallback(
		(lineNumber) => {
			const leftLines = leftText.split('\n');
			const rightLines = rightText.split('\n');
			if (lineNumber - 1 >= rightLines.length) return;
			const rightContent = rightLines[lineNumber - 1];
			const match = rightContent.match(/^(\s*\S+)\s*:/);
			if (match) {
				const keyName = match[1].trim();
				let found = false;
				// 좌측 전체에서 동일 key를 가진 모든 라인을 찾아 교체 (위치 상관없이)
				for (let i = 0; i < leftLines.length; i++) {
					const leftMatch = leftLines[i].match(/^(\s*\S+)\s*:/);
					if (leftMatch && leftMatch[1].trim() === keyName) {
						leftLines[i] = rightContent;
						found = true;
					}
				}
				if (!found) {
					// 동일 key가 없으면, 해당 위치에 새 라인을 삽입
					const insertIndex = Math.min(lineNumber - 1, leftLines.length);
					leftLines.splice(insertIndex, 0, rightContent);
				}
				setLeftText(leftLines.join('\n'));
			} else {
				// key: 형태가 아니면, 새 라인 삽입
				const insertIndex = Math.min(lineNumber - 1, leftLines.length);
				leftLines.splice(insertIndex, 0, rightContent);
				setLeftText(leftLines.join('\n'));
			}
		},
		[leftText, rightText],
	);

	const handleReplaceAll = useCallback(() => {
		const leftLines = leftText.split('\n');
		const rightLines = rightText.split('\n');
		rightLineList.forEach((lineNumber) => {
			if (lineNumber - 1 < rightLines.length) {
				leftLines[lineNumber - 1] = rightLines[lineNumber - 1];
			}
		});
		setLeftText(leftLines.join('\n'));
	}, [leftText, rightText, rightLineList]);

	const leftExtensions = useMemo(
		() =>
			getLeftExtensions(showDiff, leftLineList, leftCharDiffs, rightEditorRef),
		[showDiff, rightLineList, leftCharDiffs, rightEditorRef],
	);
	const rightExtensions = useMemo(
		() =>
			getRightExtensions(showDiff, rightLineList, rightCharDiffs, onArrowClick),
		[showDiff, rightLineList, rightCharDiffs, onArrowClick],
	);

	return (
		<div>
			<div style={{marginBottom: '1em'}}>
				{!showDiff && (
					<button onClick={() => setShowDiff(true)}>Compare</button>
				)}
				{showDiff && (
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
