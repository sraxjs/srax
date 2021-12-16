import RenderUtils from './utils';
import AttributeHandle from './attribute';
import JSX, { DiffChildren } from '../../jsx/main';
import Patch from '../vdom/patch';

const SetDOM = (jsx, element) => {
    return jsx.element = element;
}

const TransitionTextObject = (node) => {
    if (!node.type && !(node instanceof Array)) {
        return JSX.createTextNode(node);
    }
    return node;
}

// DOM完成
const JSXReady = (jsx) => {
    if (jsx.context) {
        jsx.context.ready.trigger(jsx.element);
    }
}

// 销毁
const JSXDetached = (jsx) => {
    if (jsx.context) {
        // 执行销毁回调
        jsx.context.detached.trigger(jsx.element);
        // 上下文销毁
        jsx.context.destroy();
    }
}

// 声明周期方法
const BehaviorHandle = (patchResult) => {

    patchResult?.create.forEach((v) => {
        switch (v.type) {
            case 'tag':
            case 'text':
                // DOM渲染完成
                JSXReady(v);
        }
    });

    patchResult?.remove.forEach((v) => {
        switch (v.type) {
            case 'variable':
                // 变量移除
                v.off();
                break;
            case 'tag':
            case 'text':
                // DOM销毁
                JSXDetached(v);
        }
    });


}

// 子节点处理
const ChildrenHandle = (node, children) => {

    if (!children) {
        return;
    }

    for (let i = 0, len = children.length; i < len; i++) {

        let v = children[i];

        switch (v?.type) {

            // 正常标签
            case 'tag':
                node.appendChild(CreateElement(v));
                JSXReady(v);
                break;

            // 字符串
            case 'text':
                node.append(CreateTextNode(v));
                JSXReady(v);
                break;

            // 动态标签
            case 'variable':

                let jsxs = RenderUtils.listenChange(v, (newValue) => {

                    newValue = TransitionTextObject(newValue);

                    // 比对
                    let patches = DiffChildren(newValue instanceof Array ? newValue : [newValue], jsxs);
                    // 渲染
                    let patchResult = Patch(node, jsxs, patches);

                    // 执行声明周期函数
                    BehaviorHandle(patchResult);

                });

                // 强制成数组
                jsxs = TransitionTextObject(jsxs);
                jsxs = jsxs instanceof Array ? jsxs : [jsxs].slice(0);
                ChildrenHandle(node, jsxs);

                break;

            default:
                node.append(v);
                break;

        }

    }

}

// 创建文字节点
export const CreateTextNode = (jsx) => {

    if (jsx?.type === 'tag') {
        return CreateElement(jsx);
    }

    // SetDOM 存储DOM节点
    // document.createTextNode 创建文字节点
    // RenderUtils.renderNode 如果值为 null 或者 undefined 则渲染空
    let value = RenderUtils.renderNode(jsx.value);
    let textNode = document.createTextNode(value);
    return SetDOM(jsx, textNode);

}

// 生成标签节点
export const CreateElement = (jsx) => {

    if (jsx?.type === 'text') {
        return CreateTextNode(jsx);
    }

    let node = document.createElement(jsx.name);
    let attributes = jsx.attributes;
    let children = jsx.children;

    // 存储 DOM
    SetDOM(jsx, node);

    // 属性处理
    AttributeHandle(node, attributes);

    // 节点处理
    ChildrenHandle(node, children);

    return node;

}

export default (jsx, root) => {

    let jsxThen = jsx;
    let element

    if (jsxThen) {
        element = SetDOM(jsxThen, CreateElement(jsxThen));
        root?.appendChild(element);
        JSXReady(jsxThen);
    }

}

// 刷新方法
export const NextRefresh = (fn) => {
    requestAnimationFrame(() => {
        fn();
    });
}