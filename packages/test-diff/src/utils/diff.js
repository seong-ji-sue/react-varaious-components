// 1. 현재 상태(A)와 이전 상태(B) 배열 생성
const compareDiffType = {
	add: 'add',
	remove: 'remove',
	modify: 'modify',
};

const splitVersionArr = (items) => {
	const currentArray = items.map(({key, value}) => ({key, value}));
	// 이전 상태 배열 생성 (beforeKey가 존재하는 항목만 선택)
	const previousArray = items
		.filter(({beforeKey}) => beforeKey)
		.map(({beforeKey, beforeValue}) => ({key: beforeKey, value: beforeValue}));
	return [currentArray, previousArray];
};

export const compareItems = (items) => {
	// 현재 상태 배열 생성
	const [currentArray, previousArray] = splitVersionArr(items);

	// 현재 배열을 Map으로 변환하여 빠른 조회를 가능하게 함
	const currentMap = new Map(currentArray.map(({key, value}) => [key, value]));
	const usedKeys = new Set();
	const diffResult = [];

	// 이전 상태를 순회하며 비교
	previousArray.forEach(({key, value}) => {
		if (currentMap.has(key)) {
			diffResult.push({
				key,
				value: currentMap.get(key),
				beforeKey: key,
				beforeValue: value,
			});
			usedKeys.add(key);
		} else {
			diffResult.push({
				key: undefined,
				value: undefined,
				beforeKey: key,
				beforeValue: value,
			});
		}
	});

	// 현재 상태에서 사용되지 않은 항목 추가
	currentArray.forEach(({key, value}) => {
		if (!usedKeys.has(key)) {
			diffResult.push({
				key,
				value,
				beforeKey: undefined,
				beforeValue: undefined,
			});
		}
	});

	// key 또는 beforeKey가 존재하는 항목만 반환
	return diffResult.filter(({key, beforeKey}) => key || beforeKey);
};

/**************************************************
 * seong - 비교한 결과로 상태값 저장
 **************************************************/
export const compareState = (data) => {
	const normalizeValue = (value) => (value === '' ? undefined : value);
	const determineStatus = (current, previous) => {
		if (current === undefined && previous === undefined) return '';
		if (current === undefined) return compareDiffType.add;
		if (previous === undefined) return compareDiffType.remove;
		if (current !== previous) return compareDiffType.modify;
		return '';
	};

	return data.map(({key, value, beforeKey, beforeValue}) => {
		const normalizedValue = normalizeValue(value);
		const normalizedBeforeValue = normalizeValue(beforeValue);

		const keyStatus = determineStatus(key, beforeKey);
		const valueStatus = determineStatus(normalizedValue, normalizedBeforeValue);
		const isDiff = keyStatus !== '' || valueStatus !== '';

		return {
			key,
			value,
			beforeKey,
			beforeValue,
			state: {keyStatus, valueStatus},
			isDiff,
		};
	});
};

/**************************************************
 * seong - 이전 값 추출 (우측(이전)에서 좌측(현재)로 diff)
 **************************************************/
export const overwritePreviousValues = (finalResult, targetIndex) => {
	const initStat = {state: {keyStatus: '', valueStatus: ''}, isDiff: false};
	if (typeof targetIndex === 'number') {
		finalResult = finalResult.map((item, index) => {
			if (index === targetIndex && item.beforeKey !== undefined) {
				return {
					...item,
					...initStat,
					key: item.beforeKey,
					value: item.beforeValue,
				};
			}
			return {...item, key: item.key, value: item.value};
		});
	} else {
		finalResult = finalResult.map((item) => ({
			...item,
			...initStat,
			key: item.beforeKey,
			value: item.beforeValue,
		}));
	}
	return finalResult.filter(({key, beforeKey}) => key || beforeKey);
};

export const deleteRows = (data, targetIndices) => {
	// targetIndices가 전달되지 않으면 전체 인덱스를 처리 대상으로 설정
	const indicesToProcess =
		Array.isArray(targetIndices) && targetIndices.length > 0
			? targetIndices
			: data.map((_, i) => i);

	return data.reduce((acc, item, index) => {
		if (indicesToProcess.includes(index)) {
			// beforeKey가 없으면 해당 항목은 결과에 추가하지 않음
			if (item.beforeKey === undefined || item.beforeKey === '') {
				return acc;
			} else {
				// beforeKey가 존재하면 key와 value를 빈 문자열로 변경하고,
				// state의 keyStatus, valueStatus를 'modify'로, isDiff를 true로 설정
				acc.push({
					...item,
					key: '',
					value: '',
					state: {keyStatus: 'modify', valueStatus: 'modify'},
					isDiff: true,
				});
			}
		} else {
			// 삭제 대상이 아니면 기존 항목 그대로 추가
			acc.push(item);
		}
		return acc;
	}, []);
};

export const currentAndPreviousValues = (curr, prev) => {
	const maxLength = Math.max(curr.length, prev.length);
	const newCol = {key: '', value: '', beforeKey: '', beforeValue: ''};
	return Array.from({length: maxLength}, (_, i) => ({
		// 현재 버전 값이 있으면 복사, 없으면 빈 객체 생성
		...(i < curr.length ? curr[i] : newCol),
		// 이전 버전 값이 있으면 beforeKey, beforeValue에 할당
		beforeKey: i < prev.length ? prev[i].key : '',
		beforeValue: i < prev.length ? prev[i].value : '',
	}));
};
