export function addHook(this: any, name: string, fn: (...args: any[]) => void) {
  if (this.hooks && !this.hooks.has(name))
    throw new Error(`Hook ${name} does not exist in ${this.toString()}`);
  this[keys.kHooks] =
    this[keys.kHooks] || (new Map() as Map<string, Set<typeof fn>>);
  const hooks = this[keys.kHooks].get(name) || new Set();
  hooks.add(fn);
  this[keys.kHooks].set(name, hooks);
}

export function runHook(this: any, name: string, ...args: any[]) {
  if (this.hooks && !this.hooks.has(name))
    throw new Error(`Hook ${name} does not exist in ${this.toString()}`);
  if (!this[keys.kHooks] || !this[keys.kHooks].get(name)) return;
  for (const hook of this[keys.kHooks].get(name)) {
    hook.call(this, ...args);
  }
}

export const keys = {
  kHooks: Symbol('hooks')
};
