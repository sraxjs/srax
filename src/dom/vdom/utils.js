export default {

    // 获取DOM下的所有元素, 移除所有空格
    getChildren: (element) => {
        return Array.from(element.children);
    },

    // 表单元素
    isFormElements: (v) => {
        switch (v) {
            case 'input':
            case 'select':
            case 'textarea':
            case 'button':
                return true;
        };
        return false;
    },

    // 设置元素的属性
    setAttr: function (node, key, value) {

        let tagName;

        let setValue = () => {

            tagName = node.tagName || '';
            tagName = tagName.toLowerCase();

            // 如果是表单元素
            if (this.isFormElements(tagName)) {
                node.value = value;
            }

            // 表单元素除了赋值给 .value 属性外，还要更新 attribute
            node.setAttribute(key, value);

        }

        switch (key) {
            case 'style':
                node.style.cssText = value;
                break;
            case 'class':
                node.className = value;
                break;
            case 'value':
                setValue();
                break;
            default:
                node.setAttribute(key, value);
        }

    }

};