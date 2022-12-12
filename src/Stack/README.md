# How to use it?

Simply import the module and start using it as follows:

```js
import { ExpirableStack } from '@cadienvan/expirables';
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

# What if I put the same value multiple times?

The `ExpirableStack` doesn't consider `value uniqueness`. If you put the same value multiple times, it will be considered as different entries and will be expired independently. If you want to have a unique value in the stack, please consider using the `ExpirableSet` instead.
