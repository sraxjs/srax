import Utils from '../../utils/main';

export default (defaultValue, context) => {

    let state = defaultValue;
    let changeFn = [];

    let ret = [state, (changeValue) => {

        Object.assign(state, changeValue);

        Utils.each(changeFn, function (v, i) {
            v(state);
        });

        context.change();

    }];

    if (typeof defaultValue !== 'object') {
        Utils.error('### Hook.state 必须传入一个 object');
    }

    Object.defineProperties(state, {
        _$type: {
            value: 'HookState'
        },
        _$change: {
            value: (fn) => {
                changeFn.push(fn);
            }
        }
    });

    context.state.push(state);

    return ret;

};