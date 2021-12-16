import Utils from '../utils/main';
import { SRAX_JSX_SPREAD_ATTRIBUTE_NAME } from '../options';

export { DiffChild, DiffChildren } from './vdom/diff';

// 创建文字节点
export const CreateTextNode = (value) => {
    return {
        type: 'text',
        value: value
    }
}

// 创建标签节点
export const CreateElement = (tagName, attributes, ...children) => {

    if (typeof tagName === 'function') {

        // 处理 {...attrs}
        // 可能是多个
        // for (let e in attributes) {
        //     if (e.indexOf(SRAX_JSX_SPREAD_ATTRIBUTE_NAME) === 0) {
        //         Object.assign(attributes, attributes[e]);
        //         delete attributes[e];
        //     }
        // }

        // 执行函数
        let jsx = tagName(Object.assign(attributes || {}, {
            children: Object.assign(children, {
                type: 'children'
            })
        }));

        if (jsx.type !== 'tag') {
            Utils.error('### <FunctionName /> 标签调用形式的函数必须返回 JSX');
        }

        return jsx;

    }

    // 处理 {...attrs}
    // 可能是多个
    // for (let e in attributes) {
    //     if (e.indexOf(SRAX_JSX_SPREAD_ATTRIBUTE_NAME) === 0) {
    //         let spreadAttributes = attributes[e];
    //         Utils.each(spreadAttributes.value, (v, e) => {
    //             attributes[e] = {
    //                 type: 'variable',
    //                 value: v,
    //                 change: function (fn) {
    //                     spreadAttributes.change(function (newValue) {
    //                         fn(newValue[e]);
    //                     });
    //                 }
    //             };
    //         });
    //         delete attributes[e];
    //     }
    // }

    // 节点可能是个数组
    for (let i = 0, len = children?.length; i < len; i++) {
        if (children[i] instanceof Array) {
            children.splice(i, 1, ...children[i]);
            i--;
            len -= 1;
        }
    }

    // 处理异步节点
    // 处理文字节点
    for (let i = 0, len = children?.length; i < len; i++) {

        // 没有判断 function
        // 直接报错
        if (typeof children[i] !== 'object') {
            children[i] = CreateTextNode(children[i]);
        }

    }

    // key 转成字符串
    if (attributes?.key !== undefined) {
        attributes.key = attributes.key.toString();
    }

    return {
        type: 'tag',
        name: tagName,
        attributes: attributes,
        children: children
    };

}

export default {
    createTextNode: CreateTextNode,
    createElement: CreateElement
};