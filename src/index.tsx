// File: /src/utils/contextBuilder/index.ts
// Created Date: Thursday May 2nd 2024
// Author: Christian Nonis <alch.infoemail@gmail.com>
// -----
// Last Modified: Thursday May 2nd 2024 12:55:44 pm
// Modified By: the developer formerly known as Christian Nonis at <alch.infoemail@gmail.com>
// -----

import {
  createContext,
  Dispatch,
  ReactNode,
  Reducer,
  useContext,
  useMemo,
  useReducer,
} from "react";

const buildContextProvider = <T extends object>({
  children,
  reducer,
  state,
  context,
}: {
  children: ReactNode;
  reducer: Reducer<T, any>;
  state: T;
  context: React.Context<any>;
}) => {
  const [stateValue, dispatch] = useReducer(reducer, state);
  return (
    <context.Provider
      value={{
        contextState: stateValue,
        dispatch,
      }}
    >
      {children}
    </context.Provider>
  );
};

export const contextBuilder = <T extends object, U extends object>({
  state,
  extraActions,
}: {
  state: T;
  extraActions?: U;
}) => {
  const reducer = (_state: typeof state, action: any) => {
    let updatedState = { ..._state };

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
        const foo = (
          extraActions[key as keyof typeof extraActions] as any
        ).bind(this, action.value, _state);

        if (foo() !== undefined && foo() !== null && foo() !== false) {
          updatedState = foo();
        }
        (extraActions[key as keyof typeof extraActions] as any)(
          action.value,
          _state
        );
      }
    }

    return updatedState;
  };

  type ExtraTypes = keyof typeof extraActions;

  type Type = keyof typeof state & ExtraTypes;

  interface IAction {
    type: Type;
    value?: any;
  }

  type SetterValue<T> = T | ((prevState: T) => T);

  type NormalSetters<T> = {
    [K in keyof T as `set${Capitalize<string & K>}`]: (
      value: SetterValue<T[K]>
    ) => void;
  };

  type ExtraActions<T> = {
    [K in keyof U]: (state: Readonly<T>, ...args: any[]) => void;
  };

  const contextStateContext = createContext<{
    contextState: typeof state;
    dispatch: Dispatch<IAction>;
  }>({
    contextState: state,
    dispatch: () => null,
  });

  const createSetters = <T extends object, U extends object>(
    stateKeys: T,
    extraKeys: U,
    dispatch: Dispatch<IAction>
  ): NormalSetters<T> & ExtraActions<U> => {
    const setterFunctions: NormalSetters<T> & ExtraActions<U> =
      {} as NormalSetters<T> & ExtraActions<U>;

    Object.keys(stateKeys).forEach((key) => {
      const setterName = `set${
        key.charAt(0).toUpperCase() + key.slice(1)
      }` as keyof NormalSetters<T>;
      setterFunctions[setterName] = ((value: SetterValue<T[keyof T]>) => {
        dispatch({
          type: key as Type,
          value:
            typeof value === "function"
              ? (prevState: T[keyof T]) => (value as Function)(prevState)
              : value,
        });
      }) as NormalSetters<T>[keyof NormalSetters<T>] as (NormalSetters<T> &
        ExtraActions<U>)[keyof NormalSetters<T>];
    });

    Object.keys(extraKeys).forEach((key) => {
      const actionName = `${
        key.charAt(0).toLowerCase() + key.slice(1)
      }` as keyof ExtraActions<U>;
      setterFunctions[actionName] = ((value: any) => {
        dispatch({ type: key as Type, value });
      }) as ExtraActions<U>[keyof ExtraActions<U>] as (NormalSetters<T> &
        ExtraActions<U>)[keyof ExtraActions<U>];
    });

    return setterFunctions;
  };

  const useHook = () => {
    const context = useContext(contextStateContext);
    const setters = useMemo(
      () => createSetters(state, extraActions ?? {}, context.dispatch),
      [context]
    );

    return {
      state: context.contextState,
      actions: setters,
    };
  };

  const Provider = ({ children }: { children: ReactNode }) => {
    return buildContextProvider({
      children,
      reducer,
      state,
      context: contextStateContext,
    });
  };

  return { Provider, useHook };
};
