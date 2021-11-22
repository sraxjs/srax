import Utils from '../../utils/main';

// 全局上下文
const FunctionContext = {};

// 链表形式的上下文
export const RenderContext = {
    list: [],
    currentIndex: 0,
    initial(value) {
        this.list[this.currentIndex] = value;
        return this;
    },
    get() {
        return FunctionContext[this.list[this.currentIndex]];
    },
    next() {
        this.currentIndex++;
        return this;
    },
    prev() {
        this.currentIndex--;
        return this;
    }
}

export const CreateFunctionParamInterceptor = (value, fn) => {

    Utils.each(value, (v, i) => {
        if (v.context && v.onChange) {
            value[i] = v.value;
            v.onChange((newValue) => {
                fn(value);
                value[i] = newValue;
            });
        }
    });

    return value;

}

// srax 函数上下文
export const CreateFunctionContext = () => {

    let key = Symbol();

    // 防止出现第一位是空值
    if (RenderContext.list.length) {
        RenderContext.next();
    }

    // 初始化
    RenderContext.initial(key);

    return FunctionContext[key] = {
        key: key,
        type: 'SraxFunctionContext',
        state: [],
        variable: [],
        JSX: function (jsx) {
            // 执行完则返回上一层
            RenderContext.prev();
            // 保存上下文
            jsx.context = this;
            return jsx;
        },
        change: function () {
            this.variable.forEach((fn) => {
                fn();
            });
        },
        onChange: function (fn) {
            this.variable.push(fn);
        }
    };

}

// JSX 标签内的 {} 表达式
export const CreateJSXExpression = (fn) => {

    let value = fn();
    let context = RenderContext.get();

    // 如果没有上下文
    if (!context) {
        return value;
    }

    // 兼容以下写法
    // <div>{() => {return value;}}</div>
    if (typeof value === 'function') {
        return CreateJSXExpression(value);
    }

    // 防止嵌套
    if (value?.type === 'variable') {
        return value;
    }

    if (value?.context) {
        Utils.error('### 这是一个有状态的函数，请用标签形式调用 <FunctationName attr="" {...attrs} />');
    }

    return {
        type: 'variable',
        onChange: function (callback) {
            context.onChange(() => {
                return callback(this.value = fn());
            });
        },
        context: context,
        value: value
    };

}