import { NOT_EXPIRING_TTL, TTL } from '../utils';

export type ExpirableSetOptions = {
  defaultTtl: number | undefined;
  keepAlive: boolean | undefined;
};

const defaultOptions: ExpirableSetOptions = {
  defaultTtl: 0,
  keepAlive: true
};

export class ExpirableSet<Val> extends Set<Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableSet';
  timeouts: Map<Val, NodeJS.Timeout>;
  defaultTtl: number;
  keepAlive: boolean;

  constructor(
    entries: Array<Val> | Array<[Val, TTL]> = [],
    options: ExpirableSetOptions = defaultOptions
  ) {
    super();
    this.defaultTtl = options.defaultTtl || NOT_EXPIRING_TTL;
    this.keepAlive = options.keepAlive ?? true;
    this.timeouts = new Map();
    if (entries) {
      for (const entry of entries) {
        if (entry instanceof Array) {
          this.add(entry[0], entry[1] || this.defaultTtl);
        } else {
          this.add(entry, this.defaultTtl);
        }
      }
    }
  }

  setExpiration(value: Val, timeInMs = this.defaultTtl) {
    if (this.timeouts.has(value)) this.clearTimeout(value);
    this.timeouts.set(
      value,
      setTimeout(() => {
        this.delete(value);
      }, timeInMs)
    );
    return this;
  }

  add(value: Val, ttl = this.defaultTtl) {
    if (!Number.isFinite(ttl)) throw new Error('TTL must be a number');
    if (this.keepAlive) this.clearTimeout(value);
    if ((this.keepAlive || !this.has(value)) && ttl !== NOT_EXPIRING_TTL)
      this.setExpiration(value, ttl);
    return super.add(value);
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
