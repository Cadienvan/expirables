# How to use it?

Simply import the module and start using it as follows:

```js
import { ExpirableLinkedList } from 'expirables';
const list = new ExpirableLinkedList();
list.append('value');
```

# How does this work?

The `ExpirableLinkedList` constructor can take two arguments:

- `options` (Object, if only partially specified, the rest will be set to their default values): An object containing the following properties:
  - `defaultTtl` (Number): The default expiration time in milliseconds for the entries in the linked list. Defaults to `0` (never expires).
  - `unrefTimeouts` (Boolean): Whether or not to unref the timeout. Defaults to `false`. [Here's an explanation of what this means and why it matters you](https://nodejs.org/api/timers.html#timeoutunref).
- `entries` (Array): An array of entries to initialize the linked list with. Each entry can be either a value or an array containing the value and the expiration time in milliseconds (Default: `defaultTtl`)

# API

## Append

You can append entries to the linked list by calling the `append` method:

```js
list.append('value');
```

You can also pass a second parameter to the `append` method to override the default expiration time (`0`) for that entry:

```js
list.append('value', 2000); // 2000 is the expiration time in milliseconds for this entry
```

## Prepend

You can also prepend entries to the linked list:

```js
list.prepend('value');
```

## Remove

You can remove entries from the linked list by calling the `remove` method:

```js
list.remove(element); // element is the LinkedListNode instance or the Symbol returned from the append method
```

## setExpiration

The ExpirableLinkedList also has a `setExpiration` method which takes a `Symbol` (Returned from the `push` method) or a `LinkedListNode` and a `timeInMs` arguments and expires the entry associated with that index after the specified expiration time:

```js
const key = list.append('value');
list.setExpiration(key, 2000); // Expires the entry associated with the index 0 after 2000 milliseconds
list.setExpiration(list.next, 2000); // This would do the same thing as the previous line
```

_**Note:** We suggest to always pass the `LinkedListNode` instance to the `setExpiration` method instead of the `Symbol` returned from the `push` method. This is because, internally, the method has to traverse the whole `LinkedList` to get the element and this can be a performance bottleneck for big lists._

## get

The ExpirableLinkedList also provides a `get` method which takes a `Symbol` (Returned from the `push` method) and returns the `LinkedListNode` associated with that key:

```js
const key = list.append('value');
const node = list.get(key);
```

_**Note:** Please note that the `get` method is not a `O(1)` operation. It has to traverse the whole `LinkedList` to get the element and this can be a performance bottleneck for big lists._

# Hooks

The `ExpirableLinkedList` class has hooks that you can use to execute some code in certain points of the list's lifecycle.

## Available Hooks

The `ExpirableLinkedList` class has the following hooks:

- `beforeExpire` (Function): A function that will be called before an entry is expired. It takes the following arguments:
  - `value` (Any): The value of the entry that is about to be expired.
  - `key` (Symbol): The key of the entry that is about to be expired.
- `afterExpire` (Function): A function that will be called after an entry is expired. It takes the following arguments:
  - `value` (Any): The value of the entry that was expired.
  - `key` (Symbol): The key of the entry that was expired.

## How to use them?

You can use the hooks by calling the `addHook` method on the `ExpirableLinkedList` instance:

```js
const list = new ExpirableLinkedList();
list.addHook('beforeExpire', (value) => {
  console.log(`The value ${value} is about to expire`);
});
list.addHook('afterExpire', (value) => {
  console.log(`The value ${value} has expired`);
});
```

### `this` keyword

The `this` keyword in the hooks will refer to the `ExpirableLinkedList` instance.

# What if I append the same value multiple times?

The `ExpirableLnkedList` doesn't consider `value uniqueness`. If you put the same value multiple times, it will be considered as different entries and will be expired independently. If you want to have a unique value in the linked list, please consider using the `ExpirableSet` instead.
