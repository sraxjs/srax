const listenChange = (value, fn) => {
    if (value?.on) {
        value.on((newValue) => {
            fn(newValue);
        });
        return renderNode(value.value);
    }
    return renderNode(value);
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