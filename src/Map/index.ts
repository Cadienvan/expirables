import { NOT_EXPIRING_TTL, TTL } from '../utils';

export type ExpirableMapOptions = {
  defaultTtl: number | undefined;
  keepAlive: boolean | undefined;
  unrefTimeouts: boolean | undefined;
};

const defaultOptions: ExpirableMapOptions = {
  defaultTtl: NOT_EXPIRING_TTL,
  keepAlive: true,
  unrefTimeouts: false
};

export class ExpirableMap<Key, Val> extends Map<Key, Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableMap';
  timeouts: Map<Key, NodeJS.Timeout>;
  options: ExpirableMapOptions;

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

  set(key: Key, value: Val, ttl = this.options.defaultTtl) {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    if (this.options.keepAlive) this.clearTimeout(key);
    if ((this.options.keepAlive || !this.has(key)) && ttl !== NOT_EXPIRING_TTL)
      this.setExpiration(key, ttl);
    return super.set(key, value);
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
