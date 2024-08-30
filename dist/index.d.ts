import { ReactNode } from "react";
export declare const contextBuilder: <T extends object, U extends object>({ state, extraActions, }: {
    state: T;
    extraActions?: U;
}) => {
    Provider: ({ children }: {
        children: ReactNode;
    }) => import("react/jsx-runtime").JSX.Element;
    useHook: () => {
        state: T;
        actions: { [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K] | ((prevState: T[K]) => T[K])) => void; } & { [K_1 in keyof U]: (state: Readonly<{}>, ...args: any[]) => void; };
    };
};
