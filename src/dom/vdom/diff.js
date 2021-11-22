import VUtils from './utils';
import Patch from './patch';
import { DiffList } from './list';

// 判断是否是同元素
const CompareNode = (newElmeent, oldElement) => {

    let newTagName = newElmeent.tagName || '';
    let oldTagName = oldElement.tagName || '';

    return (newTagName === oldTagName && VUtils.getItemSign(newElmeent) === VUtils.getItemSign(oldElement));

};

const AttributeToObject = (element) => {

    let attr = element.attributes;
    let props = {};
    let tagName = (element.tagName || '').toLowerCase();

    let privateAttrs = ['complete'];

    for (let i = 0, len = attr.length; i < len; i++) {
        let name = attr[i].name;
        if (privateAttrs.indexOf(name) === -1) {
            props[name] = attr[i].value;
        }
    }

    if (element.style.cssText) {
        props.style = element.style.cssText;
    }

    // 如果是表单元素
    if (VUtils.isFormElements(tagName)) {
        props.value = element.value;
    }

    return props;

}

const DiffAttribute = (newElement, oldElement) => {

    let newAttributes = AttributeToObject(newElement);
    let oldAttributes = AttributeToObject(oldElement);

    let value;
    let count = 0;
    let propsPatches = {};

    for (let key in oldAttributes) {
        value = oldAttributes[key];
        if (newAttributes[key] !== value) {
            count++;
            propsPatches[key] = newAttributes[key];
        }
    }

    for (let key in newAttributes) {
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
let GetNodesLength = (nodes) => {

    let count = 0;
    let childNodes = VUtils.getChildren(nodes);

    for (let i = 0, len = childNodes.length; i < len; i++) {
        count++;
        count += GetNodesLength(childNodes[i]);
    }

    return count;

};

// diff子元素, 进行排序, 删除, 添加操作
let DiffChildren = (newChildren, oldChildren, patches, index, currentPatch) => {

    let diffs = DiffList(newChildren, oldChildren);
    let reorderPatch;

    let count = 0;
    let leftNode = null;
    let currentNodeIndex = index;

    newChildren = diffs.children;

    if (diffs.moves.length) {
        reorderPatch = {
            type: Patch.REORDER,
            moves: diffs.moves
        };
        currentPatch.push(reorderPatch);
    }

    for (let i = 0, len = oldChildren.length; i < len; i++) {

        let newChild = newChildren[i];
        let oldChild = oldChildren[i];

        /* eslint-disable no-cond-assign */
        if (leftNode && (count = GetNodesLength(leftNode))) {
            currentNodeIndex += count + 1;
        } else {
            currentNodeIndex += 1;
        }

        // 是否跳过diff
        let newSkip = VUtils.getSkip(newChild);
        let oldSkip = VUtils.getSkip(oldChild);

        if (oldSkip && newSkip) {
            leftNode = oldChild;
            continue;
        }

        Walk(newChild, oldChild, patches, currentNodeIndex);

        leftNode = oldChild;

    }

};

const Walk = (newElement, oldElement, patches, index) => {

    if (!newElement) {
        return patches;
    }

    let currentPatch = [];
    let newNodeType = newElement.nodeType;
    let oldNodeType = oldElement.nodeType;

    // text 替换
    if (newNodeType === 3 && oldNodeType === 3) {
        let newElementValue = newElement.nodeValue || newElement.textContent;
        let oldElementValue = oldElement.nodeValue || oldElement.textContent;
        if (oldElementValue !== newElementValue) {
            currentPatch.push({
                type: Patch.TEXT,
                content: newElementValue
            });
        }
    } else if (CompareNode(newElement, oldElement)) {

        // 是否跳过diff
        let newSkip = VUtils.getSkip(newElement);
        let oldSkip = VUtils.getSkip(newElement);

        // DIFF子元素
        if (!(oldSkip && newSkip)) {

            // 判断属性
            let patchAttribute = DiffAttribute(newElement, oldElement);

            if (patchAttribute) {
                currentPatch.push({
                    type: Patch.PROPS,
                    props: patchAttribute
                });
            }

            DiffChildren(VUtils.getChildren(newElement), VUtils.getChildren(oldElement), patches, index, currentPatch);

        }

    } else {
        // 做替换操作
        currentPatch.push({
            type: Patch.REPLACE,
            node: newElement
        });
    }

    if (currentPatch.length) {
        patches[index] = currentPatch;
    }

    return patches;

}

export default (newElement, oldElement) => {
    return Walk(newElement, oldElement, {}, 0);
}