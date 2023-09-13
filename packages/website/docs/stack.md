---
sidebar_position: 5
---

# Stack

Simply import the module and start using it as follows:

```js
import { ExpirableStack } from 'expirables';
const stack = new ExpirableStack();
stack.push('value');
stack.pop();
```

You can also pass a second parameter to the `push` method to override the default expiration time (`0`) for that entry:

```js
stack.push('value', 2000); // 2000 is the expiration time in milliseconds for this entry
```

The ExpirableStack also has a `setExpiration` method which takes a `Symbol` (Returned from the `push` method) and a `timeInMs` arguments and expires the entry associated with that index after the specified expiration time:

```js
const key = stack.push('value');
stack.setExpiration(key, 2000); // Expires the entry associated with the index 0 after 2000 milliseconds
```

# How does this work?

The `ExpirableStack` constructor can take two arguments:

- `options` (Object, if only partially specified, the rest will be set to their default values): An object containing the following properties:
  - `defaultTtl` (Number): The default expiration time in milliseconds for the entries in the stack. Defaults to `0` (never expires).
  - `unrefTimeouts` (Boolean): Whether or not to unref the timeout. Defaults to `false`. [Here's an explanation of what this means and why it matters you](https://nodejs.org/api/timers.html#timeoutunref).
- `entries` (Array): An array of entries to initialize the stack with. Each entry can be either a value or an array containing the value and the expiration time in milliseconds (Default: `defaultTtl`)

# Hooks

The `ExpirableStack` class has hooks that you can use to execute some code in certain points of the stack's lifecycle.

## Available Hooks

The `ExpirableStack` class has the following hooks:

- `beforeExpire` (Function): A function that will be called before an entry is expired. It takes the following arguments:
  - `value` (Any): The value of the entry that is about to be expired.
  - `key` (Symbol): The key of the entry that is about to be expired.
- `afterExpire` (Function): A function that will be called after an entry is expired. It takes the following arguments:
  - `value` (Any): The value of the entry that was expired.
  - `key` (Symbol): The key of the entry that was expired.

## How to use them?

You can use the hooks by calling the `addHook` method on the `ExpirableStack` instance:

```js
const queue = new ExpirableStack();
queue.addHook('beforeExpire', (value) => {
  console.log(`The value ${value} is about to expire`);
});
queue.addHook('afterExpire', (value) => {
  console.log(`The value ${value} has expired`);
});
```

### `this` keyword

The `this` keyword in the hooks will refer to the `ExpirableStack` instance.

# What if I put the same value multiple times?

The `ExpirableStack` doesn't consider `value uniqueness`. If you put the same value multiple times, it will be considered as different entries and will be expired independently. If you want to have a unique value in the stack, please consider using the `ExpirableSet` instead.
