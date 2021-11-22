import Utils from '../utils/main';
import { SRAX_JSX_SPREAD_ATTRIBUTE_NAME } from '../options';

// 创建节点
const CreateNode = (node) => {

    return Object.assign(node, {

        // 设置父级
        _setParent: function (p) {
            this.parent = p;
        }

    });

};

// 设置父级
const SetParent = (children, parent) => {
    children?.forEach((v) => {
        if (v?._setParent) {
            v._setParent(parent);
        }
    });
}

export default {

    // 创建标签节点
    createElement(tagName, attributes, ...children) {

        let node

        if (typeof tagName === 'function') {
            // 处理 {...attrs}
            // 可能是多个
            for (let e in attributes) {
                if (e.indexOf(SRAX_JSX_SPREAD_ATTRIBUTE_NAME) === 0) {
                    Object.assign(attributes, attributes[e]);
                    delete attributes[e];
                }
            }
            return tagName(attributes, children);
        }

        // 处理 {...attrs}
        // 可能是多个
        for (let e in attributes) {
            if (e.indexOf(SRAX_JSX_SPREAD_ATTRIBUTE_NAME) === 0) {
                let spreadAttributes = attributes[e];
                Utils.each(spreadAttributes.value, (v, e) => {
                    attributes[e] = {
                        type: 'variable',
                        value: v,
                        change: function (fn) {
                            spreadAttributes.change(function (newValue) {
                                fn(newValue[e]);
                            });
                        }
                    };
                });
                delete attributes[e];
            }
        }

        // 处理异步属性
        for (let e in attributes) {
            if (attributes[e] instanceof Promise) {
                attributes[e] = attributes[e];
            }
        }

        for (let i = 0, len = children?.length; i < len; i++) {

            // 节点可能是个数组
            if (children[i] instanceof Array) {
                children.splice(i, 1, ...children[i]);
                i--;
                len -= 1;
            }

            // 处理异步节点
            if (children[i] instanceof Promise) {
                children[i] = children[i];
            }

        }

        node = CreateNode({
            type: 'tag',
            name: tagName,
            attributes: attributes,
            children: children,
            parent: null
        });

        SetParent(children, node);

        return node;

    }

};