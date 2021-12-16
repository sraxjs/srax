import { VDOM_LIST_KEY, VDOM_SKIP_KEY } from '../../options';

export default {

    REPLACE: 'replace',
    REORDER: 'reorder',
    PROPS: 'props',
    TEXT: 'text',
    REMOVE: 'remove',
    INSERT: 'insert',

    // 获取DOM下的所有元素, 移除所有空格
    getChildren: (element) => {
        return element?.children || [];
    },

    // 获取元素的唯一标识
    getItemSign: (item) => {
        return item?.attributes ? item.attributes[VDOM_LIST_KEY] : undefined;
    },

    // 是否跳过diff
    getSkip: (item) => {
        return item?.attributes ? (item.attributes[VDOM_SKIP_KEY] === true) : false;
    }

}