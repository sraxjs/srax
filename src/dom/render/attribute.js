import RenderUtils from './utils';
import Utils from '../../utils/main';
import { VDOM_LIST_KEY } from '../../options';

const NO_VALUE_ATTR = ['disabled', 'checked', 'selected', 'readonly', 'controls'];

// {borderWidth: 0} => border-width: 0;
const StyleToCssString = (style) => {
    let ss = [];
    Utils.each(style, (v, e) => {
        ss.push(e.replace(/([A-Z])/g, '-$1').toLowerCase() + ':' + v);
    });
    return ss.join('; ');
}

// 属性以 on 并且大写开头处理
const IsEvent = (eventName) => {
    return eventName.search(/^on[A-Z]/g) === 0;
}

export default (node, attributes) => {

    Utils.each(attributes, (v, e) => {

        // key 不渲染
        if (e === VDOM_LIST_KEY) {
            return;
        }

        if (IsEvent(e)) {
            // 事件处理
            // 属性以 on 并且大写开头处理
            node.addEventListener(e.substring(2).toLowerCase(), function (event) {
                return v(event);
            }, false);
        } else if (NO_VALUE_ATTR.indexOf(e) > -1) {
            // 这些属性需要直接赋值布尔量
            // 用 setAttrubite 是不生效的
            node[e] = RenderUtils.listenChange(v, (newValue) => {
                node[e] = newValue;
            });
        } else if (e === 'style') {
            // style 是个对象，但在赋值操作的时候会直接转成 cssText
            // 并且对象是驼峰命名，所以需要转换一下
            // {borderWidth: 0} => border-width: 0;
            node.style.cssText = StyleToCssString(RenderUtils.listenChange(v, (newValue) => {
                if (node.getAttribute('style') !== newValue) {
                    node.style.cssText = StyleToCssString(newValue);
                }
            }));
        } else if (v) {
            // 正常属性赋值操作
            // 如果属性的值是 null 或者 undefined 则删除属性
            node.setAttribute(e, RenderUtils.listenChange(v, (newValue) => {
                if (newValue === null || newValue === undefined) {
                    node.removeAttribute(e);
                } else if (node.getAttribute(e) !== newValue) {
                    node.setAttribute(e, newValue);
                }
            }));
        }

    });

    return node;

}