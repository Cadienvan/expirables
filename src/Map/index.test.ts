import { ExpirableMap } from '.';
import { sleep } from '../utils';

describe('ExpirableMap', () => {
  it('should initialize the map with the given values', () => {
    const map = new ExpirableMap();
    map.set('a', 1);
    map.set('b', 2);
    expect(map.size).toBe(2);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
  });

  it('should set the expiration time for a key', () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
  });

  it('should remove the key after the expiration time', async () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    await sleep(20);
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
  });

  it('should keep the key alive when re-set before expiring', async () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    map.set('a', 1, 30);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    await sleep(20);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
  });

  it('should remove the key when set twice without keepAlive and time passed', async () => {
    const map = new ExpirableMap([], { defaultTtl: 100, keepAlive: false });
    map.set('a', 1);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    map.set('a', 1, 3000);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    await sleep(500);
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
  });

  it('should maintain the key when firstly set with time and then set with 0', async () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    map.set('a', 1, 0);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    await sleep(20);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
  });

  it('should initialize the map with the given entries', () => {
    const map = new ExpirableMap([
      ['a', 1],
      ['b', 2]
    ]);
    expect(map.size).toBe(2);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
  });

  it('should initialize the map with the given entries and expiration times', async () => {
    const map = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);
    expect(map.size).toBe(2);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    await sleep(15);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(undefined);
    expect(map.get('b')).toBe(2);
    await sleep(15);
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
    expect(map.get('b')).toBe(undefined);
  });
});
