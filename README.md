# react-context-builder

This package provides utilities to create and manage state context in a React application using TypeScript.

## Installation

```bash
npm install react-context-builder
```

## Usage

To use the `react-context-builder` package, follow the steps below:

1. Import the `contextBuilder` function from the package.
2. Define your state and extra actions.
3. Use the `contextBuilder` function to create a context provider and a custom hook.

Here's an example of how to use the package:

````typescript
import { contextBuilder } from 'react-context-builder';

2. Define your state and extra actions.

```typescript
interface State {
  count: number;
  name: string | null;
}

interface ExtraActions {
  increment: (amount: number) => void;
  decrement: (amount: number) => void;
}

const { Provider, useHook } = contextBuilder<State, ExtraActions>({
  state: { count: 0, name: null },
  extraActions: {
    increment: (amount) => (state, dispatch) => dispatch({ type: 'INCREMENT', payload: amount }),
    decrement: (amount) => (state, dispatch) => dispatch({ type: 'DECREMENT', payload: amount }),
  },
});

const App = () => {
  const { state, actions } = useHook();

  return (
    <Provider>
      <div>
        <p>Count: {state.count}</p>
        <button onClick={() => actions.increment(1)}>Increment</button>
        <button onClick={() => actions.decrement(1)}>Decrement</button>
        <button onClick={() => actions.setName('Jane')}>Change Name</button>
      </div>
    </Provider>
  );
};

export default App;
````

This example demonstrates how to create a context provider and a custom hook using the `contextBuilder` function. The `Provider` component wraps your application and provides the state and actions to its children. The `useHook` function returns the current state and the actions that can be used to update the state.

Note that in addition to the custom `increment` and `decrement` actions, you automatically get setters for each state property. In this example, `actions.setName` is automatically generated and can be used to update the `name` state.
