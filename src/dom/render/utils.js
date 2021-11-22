const listenChange = (value, fn) => {
    if (value.onChange) {
        value.onChange((newValue) => {
            fn(newValue);
        });
        return renderNode(value.value);
    }
    return value;
}

const renderNode = (v) => {
    if (v === null || v === undefined) {
        return '';
    }
    return v;
}

export default {
    listenChange,
    renderNode
}