let VariableContext = 0;

// 获取最终 value 值
const GetValue = (v) => {
    if (typeof v === 'function') {
        return GetValue(v());
    }
    return v;
}

// return 上下文
export const CreateReturnContext = (ret, context) => {
    // jsx
    if (typeof ret === 'function') {
        let value = ret();
        if (['tag', 'text'].indexOf(value?.type) > -1) {
            value.context = context;
            context.jsx = value;
        }
        return value;
    } else {
        context.ready.trigger();
        return ret;
    }
}

// 变量上下文
export const CreateVariableContext = (nestContext, context, fn) => {

    fn = fn.bind({ type: 'CreateVariableContext' });

    let value = GetValue(fn);
    let key = context.key + '.' + VariableContext++;

    // 如果没有上下文
    // 防止嵌套使用
    if (nestContext?.type === 'CreateVariableContext') {
        return value;
    }

    // 是JSX
    if (value?.type === 'tag' || value?.type === 'text') {
        return value;
    }

    // 如果是 function
    if (typeof value === 'function') {
        value = value();
    }

    // 防止嵌套
    if (value) {
        if (value.type === 'variable' && value.context) {
            return value;
        } else if (value instanceof Array && value.type === 'children') {
            return value;
        }
    }

    return {
        type: 'variable',
        key: key,
        on: function (callback) {
            context.variable.on(key, () => {
                callback(this.value = GetValue(fn));
            });
        },
        off: () => {
            context.variable.off(key);
        },
        context: context,
        value: value
    };

}