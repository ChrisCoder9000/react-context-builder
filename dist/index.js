"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextBuilder = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// File: /src/utils/contextBuilder/index.ts
// Created Date: Thursday May 2nd 2024
// Author: Christian Nonis <alch.infoemail@gmail.com>
// -----
// Last Modified: Thursday May 2nd 2024 12:55:44 pm
// Modified By: the developer formerly known as Christian Nonis at <alch.infoemail@gmail.com>
// -----
const react_1 = require("react");
const buildContextProvider = ({ children, reducer, state, context, }) => {
    const [stateValue, dispatch] = (0, react_1.useReducer)(reducer, state);
    return ((0, jsx_runtime_1.jsx)(context.Provider, { value: {
            contextState: stateValue,
            dispatch,
        }, children: children }));
};
const contextBuilder = ({ state, extraActions, }) => {
    const reducer = (_state, action) => {
        let updatedState = Object.assign({}, _state);
        for (const key in state) {
            if (key === action.type) {
                updatedState[key] =
                    typeof action.value === "function"
                        ? action.value(updatedState[key])
                        : action.value;
            }
        }
        for (const key in extraActions) {
            if (key === action.type) {
                const foo = extraActions[key].bind(this, action.value, _state);
                if (foo() !== undefined && foo() !== null && foo() !== false) {
                    updatedState = foo();
                }
                extraActions[key](action.value, _state);
            }
        }
        return updatedState;
    };
    const contextStateContext = (0, react_1.createContext)({
        contextState: state,
        dispatch: () => null,
    });
    const createSetters = (stateKeys, extraKeys, dispatch) => {
        const setterFunctions = {};
        Object.keys(stateKeys).forEach((key) => {
            const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
            setterFunctions[setterName] = ((value) => {
                dispatch({
                    type: key,
                    value: typeof value === "function"
                        ? (prevState) => value(prevState)
                        : value,
                });
            });
        });
        Object.keys(extraKeys).forEach((key) => {
            const actionName = `${key.charAt(0).toLowerCase() + key.slice(1)}`;
            setterFunctions[actionName] = ((value) => {
                dispatch({ type: key, value });
            });
        });
        return setterFunctions;
    };
    const useHook = () => {
        const context = (0, react_1.useContext)(contextStateContext);
        const setters = (0, react_1.useMemo)(() => createSetters(state, extraActions !== null && extraActions !== void 0 ? extraActions : {}, context.dispatch), [context]);
        return {
            state: context.contextState,
            actions: setters,
        };
    };
    const Provider = ({ children }) => {
        return buildContextProvider({
            children,
            reducer,
            state,
            context: contextStateContext,
        });
    };
    return { Provider, useHook };
};
exports.contextBuilder = contextBuilder;
