export const each = (value, fn) => {
    if (value) {
        if (value instanceof Array) {
            for (let i = 0, len = value.length; i < len; i++) {
                if (fn(value[i], i) === false) {
                    break;
                }
            }
        } else {
            for (let e in value) {
                if (fn(value[e], e) === false) {
                    break;
                }
            }
        }
    }
};

// 是否是带上下文的变量
export const isContextVariable = (value) => {
    if (value && value.on && value.type === 'variable' && value.context) {
        return true;
    }
    return false;
}

// 显示错误
export const error = (text) => {
    throw new Error(text);
};

export default {
    each,
    isContextVariable,
    error
}