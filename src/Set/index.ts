import { NOT_EXPIRING_TTL, TTL } from '../utils';

export type ExpirableSetOptions = {
  defaultTtl: number | undefined;
  keepAlive: boolean | undefined;
  unrefTimeouts: boolean | undefined;
};

const defaultOptions: ExpirableSetOptions = {
  defaultTtl: 0,
  keepAlive: true,
  unrefTimeouts: false
};

export class ExpirableSet<Val> extends Set<Val> {
  public readonly [Symbol.toStringTag] = 'ExpirableSet';
  timeouts: Map<Val, NodeJS.Timeout>;
  options: ExpirableSetOptions;

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
    if (this.timeouts.has(value)) this.clearTimeout(value);
    const timeout = setTimeout(() => {
      this.delete(value);
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
    if (
      (this.options.keepAlive || !this.has(value)) &&
      ttl !== NOT_EXPIRING_TTL
    )
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
