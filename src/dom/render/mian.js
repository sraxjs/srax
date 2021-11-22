import RenderUtils from './utils';
import AttributeHandle from './attribute';
import { Diff, Patch } from '../vdom/mian';

const SetDOM = (jsx, element) => {
    jsx._DOM = {
        element: element
    }
    return element;
}

const CreateNode = (value) => {
    return document.createTextNode(value);
}

// 生成标签节点
const CreateElement = (jsx) => {

    if (jsx?.type !== 'tag') {
        return document.createTextNode(jsx);
    }

    let node = document.createElement(jsx.name);
    let attributes = jsx.attributes;

    // 属性处理
    AttributeHandle(node, attributes);

    // 节点遍历
    CreateChildren(jsx.children).forEach((v) => {
        if (v instanceof HTMLElement) {
            node.appendChild(v);
        } else if (v instanceof Text) {
            node.appendChild(v);
        } else {
            node.append(RenderUtils.renderNode(v));
        }
    });

    return node;

}

// 遍历子节点
const CreateChildren = (children) => {

    let childList = [];

    children?.forEach((v) => {

        let element;

        if (typeof v === 'function') {
            v = v();
        }

        switch (v?.type) {
            // 正常标签
            case 'tag':
                element = SetDOM(v, CreateElement(v));
                break;
            // 动态标签
            case 'cynamicTag':
            case 'variable':
                element = CreateElement(RenderUtils.listenChange(v, (newTag) => {
                    // 如果是 DOM 结构的更新，则引入 diff 操作，用新生产的节点和页面上的节点做对比
                    let newElement = CreateElement(newTag);
                    let patches = Diff(newElement, element);
                    Patch(element, patches);
                    // 如果第一个节点就改变了
                    if (patches[0] && patches[0][0] && patches[0][0].type === Patch.REPLACE) {
                        element = newElement;
                    }
                }));
                break;
            // 字符串
            default:
                element = v;
        }

        childList.push(element);

    });

    return childList;

}

export default (jsx, root) => {

    let jsxThen = jsx;
    let element

    if (jsxThen) {
        element = SetDOM(jsxThen, CreateElement(jsxThen));
        root?.appendChild(element);
    }

}