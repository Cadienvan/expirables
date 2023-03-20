// Create an expirable stack based on the ExpirableMap class

import { NOT_EXPIRING_TTL, TTL } from '../utils';
import type { ExpirableStackOptions } from '../types';
import { addHook, runHook } from '../utils/hooks';

const defaultOptions: ExpirableStackOptions = {
  defaultTtl: NOT_EXPIRING_TTL,
  unrefTimeouts: false
};

enum Hooks {
  beforeExpire = 'beforeExpire',
  afterExpire = 'afterExpire'
}

export class ExpirableStack<Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableStack';
  timeouts: Map<Symbol, NodeJS.Timeout>;
  options: ExpirableStackOptions;
  elements: Array<{ key: Symbol; value: Val }> = [];
  hooks = new Set(Object.values(Hooks));

  addHook = addHook;
  runHook = runHook;

  constructor(
    entries: Array<Val> | Array<[Val, TTL]> = [],
    options: Partial<ExpirableStackOptions> = defaultOptions
  ) {
    this.options = { ...defaultOptions, ...options };
    this.timeouts = new Map();
    if (entries) {
      for (const entry of entries) {
        if (entry instanceof Array) {
          this.push(entry[0], entry[1] || this.options.defaultTtl);
        } else {
          this.push(entry, this.options.defaultTtl);
        }
      }
    }
  }
  push(value: Val, ttl = this.options.defaultTtl): Symbol {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    const key = Symbol();
    this.elements.push({ key, value });
    if (ttl !== NOT_EXPIRING_TTL) this.setExpiration(key, ttl);
    return key;
  }

  pop() {
    const element = this.elements.shift();
    if (typeof element === 'undefined') return;
    const { key, value } = element;
    this.clearTimeout(key);
    return value;
  }

  delete(key: Symbol) {
    this.elements = this.elements.filter((element) => element.key !== key);
    this.clearTimeout(key);
  }

  setExpiration(key: Symbol, timeInMs = this.options.defaultTtl) {
    if (timeInMs === NOT_EXPIRING_TTL) return this;

    /* c8 ignore next */
    if (this.timeouts.has(key)) this.clearTimeout(key);

    const el = this.elements.find((e) => e.key === key);
    if (!el) return this;
    const timeout = setTimeout(() => {
      this.runHook(Hooks.beforeExpire, el.value, key);
      this.delete(key);
      this.runHook(Hooks.afterExpire, el.value, key);
    }, timeInMs);
    this.timeouts.set(
      key,
      this.options.unrefTimeouts ? timeout.unref() : timeout
    );
    return this;
  }

  clearTimeout(key: Symbol) {
    clearTimeout(this.timeouts.get(key));
    this.timeouts.delete(key);
  }

  get size() {
    return this.elements.length;
  }

  get next() {
    return this.elements.length > 0
      ? this.elements[this.elements.length - 1].value
      : undefined;
  }
}
