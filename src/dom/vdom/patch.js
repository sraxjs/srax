import VUtils from '../../jsx/vdom/utils';
import PUtils from './utils';
import Utils from '../../utils/main';
import { CreateElement } from '../render/mian';
import { VDOM_LIST_KEY } from '../../options';

// 对象替换
const ObjectReplace = (oldObject, newObject) => {
    for (let e in oldObject) {
        delete oldObject[e];
    }
    return Object.assign(oldObject, newObject);
}

// 遍历所有变量
const EachAllVariable = (jsx) => {

    let list = [];
    let attributes = jsx.attributes;
    let children = jsx.children;

    for (let i = 0, len = attributes?.length; i < len; i++) {
        if (attributes[i]?.type === 'variable') {
            list.push(attributes[i]);
        }
    }

    for (let i = 0, len = children?.length; i < len; i++) {
        if (children[i]?.type === 'tag') {
            list = list.concat(EachAllVariable(children[i]));
        } else if (children[i]?.type === 'variable') {
            list.push(children[i]);
        }
    }

    if (jsx.context) {
        list.push(Object.assign({}, jsx));
    }

    return list;

}

// 把变量记录起来
const RecordVariableStatus = (create, remove, walker) => {

    if (create) {
        walker.create = walker.create.concat(EachAllVariable(create));
    }

    if (remove) {
        walker.remove = walker.remove.concat(EachAllVariable(remove));
    }

};

// 对子元素的排序
const ReorderChildren = function (jsxs, moves, walker) {

    var staticNodeList = Object.assign([], jsxs);
    let node = walker.node;
    let maps = {};
    let mapsItem;
    let mapsIndex;

    let move;
    let index;
    let childIndex;

    let nodeItem;
    let key;
    let newChild;
    let initIndex;
    let isInsert;

    let childNodes = PUtils.getChildren(node);

    if (!jsxs.length) {
        initIndex = childNodes.length;
    }

    for (let i = 0, len = childNodes.length; i < len; i++) {

        isInsert = false;

        if (initIndex === undefined && jsxs[0]?.element === childNodes[i]) {
            initIndex = i;
        }

        if (initIndex !== undefined) {
            nodeItem = jsxs[i - initIndex];
            key = VUtils.getItemSign(nodeItem);
            if (key) {
                maps[key] = nodeItem;
            }
        }

    }

    for (let i = 0, len = moves.length; i < len; i++) {

        move = moves[i];

        index = move.index;
        childIndex = index + initIndex;
        childNodes = PUtils.getChildren(node);

        if (move.type === VUtils.REMOVE) {

            if (staticNodeList[index].element === childNodes[childIndex]) {
                // 记录变量状态
                RecordVariableStatus(null, staticNodeList[index], walker);
                node.removeChild(childNodes[childIndex]);
                jsxs.splice(index, 1);
                childNodes.splice(childNodes, 1);
            }

            staticNodeList.splice(index, 1);

        } else if (move.type === VUtils.INSERT) {

            // 这里获取的是 JSX 的 key
            key = VUtils.getItemSign(move.item);
            mapsItem = maps[key];

            if (mapsItem) {

                newChild = mapsItem.element;
                mapsIndex = jsxs.indexOf(mapsItem);

                staticNodeList.splice(index, 0, mapsItem);

                // 做位移
                if (mapsIndex > -1) {
                    if (mapsIndex > index) {
                        jsxs.splice(index, 0, mapsItem);
                        jsxs.splice(mapsIndex + 1, 1);
                        childNodes.splice(childIndex, 0, newChild);
                        childNodes.splice(mapsIndex + initIndex + 1, 1);
                    } else {
                        jsxs.splice(index + 1, 0, mapsItem);
                        jsxs.splice(mapsIndex, 1);
                        childNodes.splice(childIndex + 1, 0, newChild);
                        childNodes.splice(mapsIndex + initIndex, 1);
                    }
                } else {
                    jsxs.splice(index, 0, mapsItem);
                    childNodes.splice(childIndex, 0, newChild);
                }

            } else {

                // 记录变量状态
                RecordVariableStatus(move.item, null, walker);
                newChild = CreateElement(move.item);

                staticNodeList.splice(index, 0, move.item);
                jsxs.splice(index, 0, move.item);
                childNodes.splice(childIndex, 0, newChild);
                isInsert = true;

            }

            node.insertBefore(newChild, isInsert ? null : (childNodes[childIndex] || null));

        }

    }

};

// 设置属性, 如果为 undefined 则移除属性
const SetProps = function (jsx, props) {

    let node = jsx.element;

    for (let key in props) {

        if (key === VDOM_LIST_KEY) {
            continue;
        }

        if (props[key] === undefined || props[key] === null) {
            node.removeAttribute(key);
            delete jsx.attributes[key];
        } else {
            PUtils.setAttr(node, key, props[key]);
            jsx.attributes[key] = props[key];
        }

    }

};

const ApplyPatches = (jsx, currentPatches, walker) => {

    // DOM
    let node = jsx.element;
    let currentPatch;
    let replaceNode;

    for (let i = 0, len = currentPatches.length; i < len; i++) {

        currentPatch = currentPatches[i];

        switch (currentPatch.type) {

            case VUtils.REPLACE:
                // 记录变量状态
                RecordVariableStatus(currentPatch.node, jsx, walker);
                replaceNode = CreateElement(currentPatch.node);
                ObjectReplace(jsx, currentPatch.node);
                jsx.element = replaceNode;
                node.parentNode.replaceChild(replaceNode, node);
                break;

            case VUtils.REORDER:
                ReorderChildren(jsx, currentPatch.moves, walker);
                break;

            case VUtils.PROPS:
                SetProps(jsx, currentPatch.props);
                break;

            case VUtils.TEXT:
                jsx.value = node.nodeValue = currentPatch.content;
                break;

            default:
                Utils.error('### Unknown patch type ' + currentPatch.type);

        }

    }

}

const Walk = (jsxs, patches, walker) => {

    let children;
    let currentPatches = patches[walker.index];

    if (jsxs instanceof Array) {
        children = jsxs;
    } else if (jsxs?.children) {
        children = jsxs.children;
    }

    if (children) {
        for (let i = 0, len = children.length; i < len; i++) {
            walker.index++;
            Walk(children[i], patches, walker);
        }
    }

    if (currentPatches) {
        ApplyPatches(jsxs, currentPatches, walker);
    }


    return walker;

}

export default function (node, jsxs, patches) {
    return Walk(jsxs, patches, {
        index: 0,
        node: node,
        remove: [],
        create: []
    });
};