// Create an expirable queue based on the ExpirableMap class

import { NOT_EXPIRING_TTL, TTL } from '../utils';
import type { ExpirableQueueOptions } from '../types';

const defaultOptions: ExpirableQueueOptions = {
  defaultTtl: NOT_EXPIRING_TTL,
  unrefTimeouts: false
};
export class ExpirableQueue<Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableQueue';
  timeouts: Map<Symbol, NodeJS.Timeout>;
  options: ExpirableQueueOptions;
  elements: Array<{ key: Symbol; value: Val }> = [];

  constructor(
    entries: Array<Val> | Array<[Val, TTL]> = [],
    options: Partial<ExpirableQueueOptions> = defaultOptions
  ) {
    this.options = { ...defaultOptions, ...options };
    this.timeouts = new Map();
    if (entries) {
      for (const entry of entries) {
        if (entry instanceof Array) {
          this.enqueue(entry[0], entry[1] || this.options.defaultTtl);
        } else {
          this.enqueue(entry, this.options.defaultTtl);
        }
      }
    }
  }
  enqueue(value: Val, ttl = this.options.defaultTtl): Symbol {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    const key = Symbol();
    this.elements.push({ key, value });
    if (ttl !== NOT_EXPIRING_TTL) this.setExpiration(key, ttl);
    return key;
  }

  dequeue() {
    if (this.elements.length === 0) return;
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
    if (this.timeouts.has(key)) this.clearTimeout(key);
    const timeout = setTimeout(() => {
      this.delete(key);
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
    return this.elements[0];
  }
}
