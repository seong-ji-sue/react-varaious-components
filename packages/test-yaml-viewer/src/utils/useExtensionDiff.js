import React, {useState, useMemo, useCallback, useRef} from 'react';
import {Decoration, ViewPlugin, WidgetType} from '@codemirror/view';
import {EditorView} from '@uiw/react-codemirror';
import * as jsYaml from 'js-yaml';
import * as deepDiff from 'deep-diff';
import {load as parseYamlAST, Kind} from 'yaml-ast-parser';
import {assign, concat, forEach, pullAt, set, slice, unset} from 'lodash-es';
import cleanDeep from 'clean-deep';
import {yaml} from '@codemirror/lang-yaml';
import '../component/editor/CodeCompare.scss';

const diffType = {
	edit: 'E', //양쪽에 해당 key 값이 있는 경우
	new: 'N', //왼쪽에만
	delete: 'D', //오른쪽에만
};

function flattenAST(node, yamlText, parent = '') {
	if (!node) return {};
	let result = {};
	const getLineNumber = (yamlText, position) =>
		yamlText.slice(0, position).split('\n').length;

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

//value 값 추가
function transformObject(input) {
	const output = {};
	Object.keys(input).forEach((key) => {
		const {value} = input[key];
		output[key] =
			value !== null && typeof value === 'object' ? undefined : value;
	});
	console.log(output);
	return output;
}

//하링 푸사
function addLineInfoToDiffs(diffArray, leftFlat, rightFlat) {
	if (!diffArray) return diffArray;
	const copyArr = [];
	diffArray.forEach((diff) => {
		const obj = {...diff};

		const key = diff.path.join('.');

		if (leftFlat[key] && leftFlat[key].line != null) {
			obj.leftLine = leftFlat[key].line;
		}
		if (rightFlat[key] && rightFlat[key].line != null) {
			obj.rightLine = rightFlat[key].line;
		}
		copyArr.push(obj);
	});
	return copyArr;
}

function getYamlDiff(leftYaml, rightYaml, type) {
	let leftFlat, rightFlat;
	const leftAST = parseYamlAST(leftYaml);
	const rightAST = parseYamlAST(rightYaml);
	leftFlat = flattenAST(leftAST, leftYaml);
	rightFlat = flattenAST(rightAST, rightYaml);
	const flatDiff = deepDiff.diff(
		transformObject(leftFlat),
		transformObject(rightFlat),
	);

	const result = addLineInfoToDiffs(flatDiff, leftFlat, rightFlat);

	console.log(flatDiff);
	// 모든 diff 항목의 라인 번호를 Set에 모아 중복 제거
	const leftLineSet = new Set();
	const rightLineSet = new Set();
	forEach(result, (diff) => {
		if (diff.leftLine)
			leftLineSet.add(JSON.stringify({line: diff.leftLine, kind: diff.kind}));
		if (diff.rightLine)
			rightLineSet.add(JSON.stringify({line: diff.rightLine, kind: diff.kind}));
	});

	// 정렬된 배열로 변환하여 반환
	return {
		diffs: result,
		leftLineList: Array.from(leftLineSet).map((item) => JSON.parse(item)),
		rightLineList: Array.from(rightLineSet).map((item) => JSON.parse(item)),
	};
}

// diff 하이라이팅 관련 로직
const diffHighlighter = (type, diffData, color) => {
	console.log(diffData);
	return ViewPlugin.fromClass(
		class {
			constructor(view) {
				this.decorations = this.buildDeco(view);
			}

			update(update) {
				if (update.docChanged) {
					this.decorations = this.buildDeco(update.view);
				}
			}

			className(color) {
				return {
					line: `diff-line-${color}`,
					char: `diff-chars-${color}`,
					whitespace: 'diff-chars-whitespace',
				};
			}
			buildDeco(view) {
				const decorations = [];
				if (!diffData) return decorations;

				for (let i = 1; i <= view.state.doc.lines; i++) {
					if (diffData.some((item) => item.line === i)) {
						const line = view.state.doc.line(i);
						decorations.push(
							Decoration.line({
								class: this.className(color).line,
							}).range(line.from),
						);
					}
				}

				return Decoration.set(decorations);
			}
		},
		{decorations: (v) => v.decorations},
	);
};

function diffWidgetMarker(diffLines, onArrowClick, position) {
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
					if (diffLines.some((item) => item.line === i)) {
						const line = view.state.doc.line(i);
						widgets.push(
							Decoration.widget({
								widget: new ClickableArrowWidget(i, onArrowClick, position),
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
	constructor(lineNumber, onArrowClick, position) {
		super();
		this.lineNumber = lineNumber;
		this.onArrowClick = onArrowClick;
		this.position = position;
	}
	toDOM() {
		const span = document.createElement('span');
		if (this.position === 'leftLine') {
			span.style.right = '5px';
			span.style.position = 'absolute';
		}
		span.textContent = '<';
		span.style.color = 'red';
		span.style.fontWeight = 'bold';
		span.style.cursor = 'pointer';
		span.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.onArrowClick(this.lineNumber, this.position);
		};
		return span;
	}
}

const getLeftExtensions = ({
	showDiff,
	leftLineList,
	rightEditorRef,
	onArrowClick,
}) => {
	const exts = [yaml()];

	if (showDiff) {
		exts.push(diffHighlighter('line', leftLineList, 'green'));
		exts.push(diffWidgetMarker(leftLineList, onArrowClick, 'leftLine'));
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
};

const getRightExtensions = ({showDiff, rightLineList, onArrowClick}) => {
	const exts = [yaml()];
	if (showDiff) {
		exts.push(diffHighlighter('line', rightLineList, 'red'));
		exts.push(diffWidgetMarker(rightLineList, onArrowClick, 'rightLine'));
	}
	exts.push(
		EditorView.editable.of(false),
		EditorView.theme({
			'.cm-selectionMatch': {backgroundColor: 'transparent !important'},
			'.cm-selectionMatch *': {backgroundColor: 'transparent !important'},
		}),
	);
	return exts;
};

const useExtensionDiff = ({
	leftText,
	rightText,
	changeLeftVal,
	isCompareMode,
	type,
}) => {
	const rightEditorRef = useRef(null);

	// Diff 계산 (비교 모드일 때만)
	const {leftLineList, rightLineList, diffs} = useMemo(() => {
		if (!isCompareMode || !leftText || !rightText) {
			return {
				leftLineList: [],
				rightLineList: [],
			};
		}
		return getYamlDiff(leftText, rightText, type);
	}, [leftText, rightText, isCompareMode]);

	const onArrowClick = useCallback(
		(lineNumber, position) => {
			//yaml 대
			const yamlObj = jsYaml.load(leftText);

			const lineDiffArr = diffs?.filter(
				(diff) => diff[position] === lineNumber,
			);

			const lastDiff = lineDiffArr[lineDiffArr.length - 1];

			if (lastDiff.kind === diffType.delete)
				unset(yamlObj, lastDiff.path[0]); //삭제
			else set(yamlObj, lastDiff.path[0], lastDiff.rhs); //수정, 추가

			const test = cleanDeep(yamlObj);
			const result = jsYaml.dump(test, {
				indent: 2,
				sortKeys: false,
			});

			changeLeftVal(result);
		},
		[leftText, rightText, diffs],
	);

	// 좌측 에디터 확장(extension) 생성
	const leftExtensions = useMemo(() => {
		return getLeftExtensions({
			type,
			showDiff: isCompareMode,
			rightEditorRef,
			leftLineList,
			onArrowClick,
		});
	}, [isCompareMode, rightEditorRef, leftLineList, type]);

	// 우측 에디터 확장(extension) 생성
	const rightExtensions = useMemo(() => {
		return getRightExtensions({
			type,
			showDiff: isCompareMode,
			rightLineList,
			onArrowClick,
		});
	}, [isCompareMode, rightLineList, onArrowClick, type]);

	return {leftExtensions, rightExtensions, rightEditorRef};
};

export default useExtensionDiff;
