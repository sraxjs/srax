import VUtils from './utils';
import { DiffList } from './list';

// 判断是否是同元素
const CompareNode = (newElement, oldElement) => {

    let newTagName = newElement?.name || '';
    let oldTagName = oldElement?.name || '';

    let newType = newElement?.type || '';
    let oldType = oldElement?.type || '';

    return newTagName === oldTagName &&
        newType === oldType &&
        VUtils.getItemSign(newElement) === VUtils.getItemSign(oldElement);

};

const DiffAttribute = (newChild, oldChild) => {

    var newAttributes = newChild.attributes || {};
    var oldAttributes = oldChild.attributes || {};

    var key;
    var value;
    var count = 0;
    var propsPatches = {};

    for (key in oldAttributes) {
        value = oldAttributes[key];
        if (newAttributes[key] !== value) {
            count++;
            propsPatches[key] = newAttributes[key];
        }
    }

    for (key in newAttributes) {
        value = newAttributes[key];
        if (!oldAttributes.hasOwnProperty(key)) {
            count++;
            propsPatches[key] = newAttributes[key];
        }
    }

    if (count === 0) {
        return null;
    }

    return propsPatches;

}

// 获取所有节点
const GetNodesLength = (nodes) => {

    let count = 0;
    let childNodes = VUtils.getChildren(nodes);

    for (let i = 0, len = childNodes.length; i < len; i++) {
        count++;
        count += GetNodesLength(childNodes[i]);
    }

    return count;

};

export const DiffChild = (newChild, oldChild, index, patches = []) => {

    // 如果不需要比对
    if (!newChild) {
        return patches;
    }

    let currentPatch = [];

    if (newChild.type === 'text' && oldChild.type === 'text') {
        if (newChild.value !== oldChild.value) {
            currentPatch.push({
                type: VUtils.TEXT,
                content: newChild.value
            });
        }
    } else if (CompareNode(newChild, oldChild)) {

        // 判断属性
        let patchAttribute = DiffAttribute(newChild, oldChild);

        if (patchAttribute) {
            currentPatch.push({
                type: VUtils.PROPS,
                props: patchAttribute
            });
        }

        // DIFF子元素
        DiffChildren(VUtils.getChildren(newChild), VUtils.getChildren(oldChild), index, patches, currentPatch, false);

    } else {
        // 做替换操作
        currentPatch.push({
            type: VUtils.REPLACE,
            node: newChild
        });
    }

    if (currentPatch.length) {
        patches[index] = currentPatch;
    }

    return patches;

}

// diff 列表
export const DiffChildren = (newChilds, oldChilds, index = 0, patches = [], currentPatch = []) => {

    let diffList = DiffList(newChilds, oldChilds);

    let count = 0;
    let leftNode = null;
    let currentNodeIndex = index;

    let newChild;
    let oldChild;

    // 移除或者排序后剩下的节点
    newChilds = diffList.children;

    // 如果有需要移除或者排序
    if (diffList.moves.length) {
        currentPatch.push({
            type: VUtils.REORDER,
            moves: diffList.moves
        });
    }

    // 循环旧节点，因为新节点已经在对比列表时添加，剩下的需要和旧节点进行比对
    for (let i = 0, len = oldChilds.length; i < len; i++) {

        newChild = newChilds[i];
        oldChild = oldChilds[i];

        if (leftNode && (count = GetNodesLength(leftNode))) {
            currentNodeIndex += count + 1;
        } else {
            currentNodeIndex += 1;
        }

        DiffChild(newChild, oldChild, currentNodeIndex, patches);

        leftNode = oldChild;

    }

    if (currentPatch.length) {
        patches[index] = currentPatch;
    }

    return patches;

}