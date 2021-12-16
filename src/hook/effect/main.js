import Utils from '../../utils/main';

export default (fn, props, context) => {

    if (!props instanceof Array) {
        Utils.error('### Hook.effect 监听参数必须为数组');
    }

    if (props) {
        if (props.length) {
            let values = [];
            props.forEach((v, i) => {
                if (v.on && v.type === 'variable') {
                    v.on && v.on((nextValue) => {
                        if (values[i] !== nextValue) {
                            values[i] = nextValue;
                            fn(...values);
                        }
                    });
                    values[i] = v.value;
                }
            });
            fn(...values);
        } else if (context) {
            context.update.on(context.key, fn);
        }
    } else if (context) {
        context.ready.on(context.key, () => {
            let detached = fn();
            if (detached) {
                context.detached.on(context.key, detached);
            }
        });
    }

}