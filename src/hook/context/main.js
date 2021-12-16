import { NextRefresh } from '../../dom/main';
import { FRAMEWORK_NAME } from '../../options';

let FunctionContextCount = 0;

// 全局上下文
const FunctionContext = new Map();

const CreateEvent = () => {
    return {
        events: new Map(),
        trigger: function (...args) {
            this.events.forEach((arr) => {
                for (let i = 0, len = arr.length; i < len; i++) {
                    arr[i](...args);
                }
            });
        },
        on: function (key, fn) {
            let e = this.events.get(key);
            if (e) {
                e.push(fn);
            } else {
                this.events.set(key, [fn]);
            }
        },
        off: function (key) {
            this.events.delete(key);
        }
    }
}

// srax 函数上下文
export const CreateFunctionContext = (name) => {

    let key = name + '.' + FunctionContextCount++;

    // 全局上下文保存
    FunctionContext.set(key, {
        key: key,
        name: name,
        type: FRAMEWORK_NAME + 'FunctionContext',
        variable: CreateEvent(),
        ready: CreateEvent(),
        update: CreateEvent(),
        detached: CreateEvent(),
        destroy: function () {
            this.variable.events = [];
            this.ready.events = [];
            this.detached.events = [];
            FunctionContext.delete(key);
        }
    });

    return FunctionContext.get(key);

}

export default (context) => {

    let isReady = false;

    context.ready.on(context.key, () => {
        isReady = true;
    });

    return [context, (changeList) => {
        if (isReady) {
            NextRefresh(() => {
                context.variable.trigger();
                if (context.jsx) {
                    context.update.trigger(context.jsx.element);
                } else {
                    context.update.trigger();
                }
            });
        }
    }];

}