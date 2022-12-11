import { NOT_EXPIRING_TTL, TTL } from '../utils';

export type ExpirableMapOptions = {
  defaultTtl: number | undefined;
  keepAlive: boolean | undefined;
};

const defaultOptions: ExpirableMapOptions = {
  defaultTtl: 0,
  keepAlive: true
};

export class ExpirableMap<Key, Val> extends Map<Key, Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableMap';
  timeouts: Map<Key, NodeJS.Timeout>;
  defaultTtl: number;
  keepAlive: boolean;

  constructor(
    entries: Array<[Key, Val, TTL?]> = [],
    options: ExpirableMapOptions = defaultOptions
  ) {
    super();
    this.defaultTtl = options.defaultTtl || NOT_EXPIRING_TTL;
    this.keepAlive = options.keepAlive ?? true;
    this.timeouts = new Map();
    if (entries)
      entries.forEach((entry) =>
        this.set(entry[0], entry[1], entry[2] || this.defaultTtl)
      );
  }

  setExpiration(key: Key, timeInMs = this.defaultTtl) {
    if (this.timeouts.has(key)) this.clearTimeout(key);
    this.timeouts.set(
      key,
      setTimeout(() => {
        this.delete(key);
      }, timeInMs)
    );
    return this;
  }

  set(key: Key, value: Val, ttl = this.defaultTtl) {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    if (this.keepAlive) this.clearTimeout(key);
    if ((this.keepAlive || !this.has(key)) && ttl !== NOT_EXPIRING_TTL)
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
