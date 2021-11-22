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

export const error = (text) => {
    throw new Error(text);
};

export default {
    each: each,
    error: error
}