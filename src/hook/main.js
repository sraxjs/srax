import state from './state/main';
import effect from './effect/main';
import { CreateFunctionParamInterceptor, CreateFunctionContext, CreateJSXExpression } from './render/main';

export default {
    state,
    effect,
    createFunctionParamInterceptor: CreateFunctionParamInterceptor,
    createFunctionContext: CreateFunctionContext,
    createJSXExpression: CreateJSXExpression
}