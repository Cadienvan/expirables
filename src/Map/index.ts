import { NOT_EXPIRING_TTL, TTL } from '../utils';
import type { ExpirableMapOptions } from '../types';
import { addHook, runHook } from '../utils/hooks';

const defaultOptions: ExpirableMapOptions = {
  defaultTtl: NOT_EXPIRING_TTL,
  keepAlive: true,
  unrefTimeouts: false
};

enum Hooks {
  beforeExpire = 'beforeExpire',
  afterExpire = 'afterExpire'
}

export class ExpirableMap<Key, Val> extends Map<Key, Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableMap';
  timeouts: Map<Key, NodeJS.Timeout>;
  options: ExpirableMapOptions;
  hooks = new Set(Object.values(Hooks));

  addHook = addHook;
  runHook = runHook;

  constructor(
    entries: Array<[Key, Val, TTL?]> = [],
    options: Partial<ExpirableMapOptions> = defaultOptions
  ) {
    super();
    this.options = { ...defaultOptions, ...options };
    this.timeouts = new Map();
    if (entries)
      entries.forEach((entry) =>
        this.set(entry[0], entry[1], entry[2] || this.options.defaultTtl)
      );
  }

  setExpiration(key: Key, timeInMs = this.options.defaultTtl) {
    if (timeInMs === NOT_EXPIRING_TTL) return this;

    if (this.timeouts.has(key)) this.clearTimeout(key);

    if (!this.has(key)) return;
    const value = this.get(key);

    const timeout = setTimeout(() => {
      this.runHook(Hooks.beforeExpire, value, key);
      this.delete(key);
      this.runHook(Hooks.afterExpire, value, key);
    }, timeInMs);
    this.timeouts.set(
      key,
      this.options.unrefTimeouts ? timeout.unref() : timeout
    );

    return this;
  }

  set(key: Key, value: Val, ttl = this.options.defaultTtl) {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    if (this.options.keepAlive) this.clearTimeout(key);

    const hasKey = this.has(key);
    const result = super.set(key, value);

    if ((this.options.keepAlive || !hasKey) && ttl !== NOT_EXPIRING_TTL)
      this.setExpiration(key, ttl);

    return result;
  }

  delete(key: Key) {
    this.clearTimeout(key);
    return super.delete(key);
  }

  clearTimeout(key: Key) {
    clearTimeout(this.timeouts.get(key));
    this.timeouts.delete(key);
  }
}
