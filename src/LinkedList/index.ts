// Create an expirable stack based on the ExpirableMap class

import { NOT_EXPIRING_TTL, TTL } from '../utils';
import LinkedListNode from './Node';
import type { ExpirableLinkedListOptions } from '../types';
import { addHook, runHook } from '../utils/hooks';

const defaultOptions: ExpirableLinkedListOptions = {
  defaultTtl: NOT_EXPIRING_TTL,
  unrefTimeouts: false
};

enum Hooks {
  beforeExpire = 'beforeExpire',
  afterExpire = 'afterExpire'
}

export class ExpirableLinkedList<Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableLinkedList';
  timeouts: Map<Symbol, NodeJS.Timeout>;
  options: ExpirableLinkedListOptions;
  head: LinkedListNode<Val> | null;
  tail: LinkedListNode<Val> | null;
  hooks = new Set(Object.values(Hooks));

  addHook = addHook;
  runHook = runHook;

  constructor(
    entries: Array<Val> | Array<[Val, TTL]> = [],
    options: Partial<ExpirableLinkedListOptions> = {}
  ) {
    this.timeouts = new Map();
    this.options = { ...defaultOptions, ...options };
    this.head = null;
    this.tail = null;
    if (entries) {
      for (const entry of entries) {
        if (entry instanceof Array) {
          this.append(entry[0], entry[1] || this.options.defaultTtl);
        } else {
          this.append(entry, this.options.defaultTtl);
        }
      }
    }
  }

  append(value: Val, ttl: TTL = this.options.defaultTtl) {
    const node = new LinkedListNode(value);
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }

    if (ttl !== NOT_EXPIRING_TTL) {
      this.setExpiration(node, ttl);
    }

    return node.id;
  }

  prepend(value: Val, ttl: TTL = this.options.defaultTtl) {
    const node = new LinkedListNode(value);
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }

    if (ttl !== NOT_EXPIRING_TTL) {
      this.setExpiration(node, ttl);
    }

    return node.id;
  }

  remove(param: Symbol | LinkedListNode<Val>) {
    const id = param instanceof LinkedListNode ? param.id : param;
    let node = this.head;
    let prev: LinkedListNode<Val> | null = null;

    while (node !== null) {
      if (node.id === id) {
        if (prev !== null) {
          prev.next = node.next;
        } else {
          this.head = node.next;
        }

        if (node.next === null) {
          this.tail = prev;
        }

        const timeout = this.timeouts.get(node.id);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(node.id);
        }

        return true;
      }

      prev = node;
      node = node.next;
    }

    return false;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  setExpiration(param: Symbol | LinkedListNode<Val>, ttl: TTL) {
    const id = param instanceof LinkedListNode ? param.id : param;
    const el = param instanceof LinkedListNode ? param : this.get(id);
    if (!el) return;
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    if (ttl !== NOT_EXPIRING_TTL) {
      const timeout = setTimeout(() => {
        const el = param instanceof LinkedListNode ? param : this.get(id);
        if (!el) return;
        this.runHook(Hooks.beforeExpire, el.value, id);
        this.remove(id);
        this.runHook(Hooks.afterExpire, el.value, id);
      }, ttl);

      if (this.options.unrefTimeouts) {
        timeout.unref();
      }

      this.timeouts.set(id, timeout);
    }
  }

  get(id: Symbol): LinkedListNode<Val> | undefined {
    let node = this.head;

    while (node !== null) {
      if (node.id === id) {
        return node;
      }

      node = node.next;
    }

    return undefined;
  }

  get length() {
    let node = this.head;
    let length = 0;

    while (node !== null) {
      length++;
      node = node.next;
    }

    return length;
  }
}
