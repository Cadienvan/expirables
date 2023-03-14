import { NOT_EXPIRING_TTL, TTL } from '../utils';
import type { ExpirableSetOptions } from '../types';
import { addHook, runHook } from '../utils/hooks';

const defaultOptions: ExpirableSetOptions = {
  defaultTtl: 0,
  keepAlive: true,
  unrefTimeouts: false
};

enum Hooks {
  beforeExpire = 'beforeExpire',
  afterExpire = 'afterExpire'
}

export class ExpirableSet<Val> extends Set<Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableSet';
  timeouts: Map<Val, NodeJS.Timeout>;
  options: ExpirableSetOptions;
  hooks = new Set(Object.values(Hooks));

  addHook = addHook;
  runHook = runHook;

  constructor(
    entries: Array<Val> | Array<[Val, TTL]> = [],
    options: Partial<ExpirableSetOptions> = defaultOptions
  ) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.timeouts = new Map();
    if (entries) {
      for (const entry of entries) {
        if (entry instanceof Array) {
          this.add(entry[0], entry[1] || this.options.defaultTtl);
        } else {
          this.add(entry, this.options.defaultTtl);
        }
      }
    }
  }

  setExpiration(value: Val, timeInMs = this.options.defaultTtl) {
    if (timeInMs === NOT_EXPIRING_TTL) return this;

    if (this.timeouts.has(value)) this.clearTimeout(value);
    if (!this.has(value)) return this;

    const timeout = setTimeout(() => {
      this.runHook(Hooks.beforeExpire, value);
      this.delete(value);
      this.runHook(Hooks.afterExpire, value);
    }, timeInMs);
    this.timeouts.set(
      value,
      this.options.unrefTimeouts ? timeout.unref() : timeout
    );

    return this;
  }

  add(value: Val, ttl = this.options.defaultTtl) {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    if (this.options.keepAlive) this.clearTimeout(value);

    const hasKey = this.has(value);
    const result = super.add(value);

    if ((this.options.keepAlive || !hasKey) && ttl !== NOT_EXPIRING_TTL)
      this.setExpiration(value, ttl);
    return result;
  }

  delete(value: Val) {
    this.clearTimeout(value);
    return super.delete(value);
  }

  clearTimeout(value: Val) {
    clearTimeout(this.timeouts.get(value));
    this.timeouts.delete(value);
  }
}
