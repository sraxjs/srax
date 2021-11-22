import VUtils from './utils';

let REPLACE = 'replace';
let REORDER = 'reorder';
let PROPS = 'props';
let TEXT = 'text';
let REMOVE = 'remove';
let INSERT = 'insert';

// 对子元素的排序
let ReorderChildren = function (node, moves) {

    let staticNodeList = VUtils.getChildren(node);
    let maps = {};

    for (let i = 0, len = staticNodeList.length; i < len; i++) {

        let nodeItem = staticNodeList[i];

        if (nodeItem.nodeType === 1) {
            let key = VUtils.getItemSign(nodeItem);
            if (key) {
                maps[key] = nodeItem;
            }
        }

    }

    for (let i = 0, len = moves.length; i < len; i++) {

        let move = moves[i];

        let index = move.index;
        let childNodes = VUtils.getChildren(node);
        let insertNode;

        if (move.type === REMOVE) {

            if (staticNodeList[index] === childNodes[index]) {
                node.removeChild(childNodes[index]);
            }

            staticNodeList.splice(index, 1);

        } else if (move.type === INSERT) {

            let key = VUtils.getItemSign(move.item);

            if (maps[key]) {
                insertNode = maps[key];
            } else {
                insertNode = move.item;
            }

            staticNodeList.splice(index, 0, insertNode);
            node.insertBefore(insertNode, childNodes[index] || null);

        }

    }

};

// 设置属性, 如果为 undefined 则移除属性
let SetProps = function (node, props) {
    for (let key in props) {
        if (props[key] === undefined) {
            node.removeAttribute(key);
        } else {
            VUtils.setAttr(node, key, props[key]);
        }
    }
};

// 针对DOM做对应的修改
let ApplyPatches = function (node, currentPatches, walker) {

    for (let i = 0, len = currentPatches.length; i < len; i++) {

        let currentPatch = currentPatches[i];

        switch (currentPatch.type) {

            case REPLACE:

                let newNode = currentPatch.node;
                let replaceChild = newNode;

                node.parentNode.replaceChild(replaceChild, node);

                if (walker.oldNode === node) {
                    walker.newNode = replaceChild;
                }

                replaceChild = null;

                break;

            case REORDER:
                ReorderChildren(node, currentPatch.moves);
                break;

            case PROPS:
                SetProps(node, currentPatch.props);
                break;

            case TEXT:
                if (node.nodeValue) {
                    node.nodeValue = currentPatch.content;
                } else {
                    node.textContent = currentPatch.content;
                }
                break;

            default:
                throw new Error('Unknown patch type ' + currentPatch.type);

        }

    }

};

// 找到需要修改的DOM元素和修改内容
let Walk = function (node, walker, patches) {

    let child;
    let currentPatches = patches[walker.index];

    let childNodes = VUtils.getChildren(node);
    let len = childNodes ? childNodes.length : 0;

    for (let i = 0; i < len; i++) {
        child = childNodes[i];
        walker.index++;
        if (child) {
            switch (child.nodeType) {
                case 8:
                    break;
                default:
                    Walk(child, walker, patches);
            }
        }
    }

    if (currentPatches) {
        ApplyPatches(node, currentPatches, walker);
    }

    return walker;

};

let Patch = function (node, patches) {
    return Walk(node, { index: 0, newNode: null, oldNode: node, remove: [], create: [] }, patches);
};

Patch.REPLACE = REPLACE;
Patch.REORDER = REORDER;
Patch.PROPS = PROPS;
Patch.TEXT = TEXT;
Patch.REMOVE = REMOVE;
Patch.INSERT = INSERT;

export default Patch;