# How to use it?

Simply import the module and start using it as follows:

```js
import { ExpirableMap } from '@cadienvan/expirables';
const map = new ExpirableMap();
map.set('key', 'value');
map.get('key'); // "value"
```

You can also pass a third parameter to the `set` method to override the default expiration time (`0`) for that entry:

```js
map.set('key', 'value', 2000); // 2000 is the expiration time in milliseconds for this entry
```

The ExpirableMap also has a `setExpiration` method which takes a `key` and a `timeInMs` arguments and expires the entry associated with that key after the specified expiration time:

```js
map.setExpiration('key', 2000); // Expires the entry associated with the key "key" after 2000 milliseconds
```

Passing `0` as the expiration time will make the entry never expire:

```js
map.set('key', 'value', 0); // The entry associated with the key "key" will never expire
```

# How does this work?

The `ExpirableMap` constructor can take two optional arguments:

- `options` (Object, if only partially specified, the rest will be set to their default values): An object containing the following properties:
  - `defaultTtl` (Number): The default expiration time in milliseconds for the entries in the map. Defaults to `0` (never expires).
  - `keepAlive` (Boolean): Whether or not to keep alive (Re-start expiration timer) entries when set before expiring. Defaults to `true`.
  - `unrefTimeouts` (Boolean): Whether or not to unref the timeout. Defaults to `false`. [Here's an explanation of what this means and why it matters you](https://nodejs.org/api/timers.html#timeoutunref).
- `entries` (Array): An array of entries to initialize the map with. Each entry can be either a value or an array containing the key, the value and the expiration time in milliseconds (Default: `defaultTtl`)
  You can simply swap a `Map` with an `ExpirableMap` and it will work as expected.

# What if I set a key that already exists?

The `set` method will override the previous entry and reset the timeout for that key if the `keepAlive` option is set to `true` (default). If it is set to `false`, the timeout will not be reset.
