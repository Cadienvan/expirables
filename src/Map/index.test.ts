import { ExpirableMap } from '.';
import { sleep } from '../utils';

jest.useFakeTimers();

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

  it('should remove the key after the expiration time', () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
  });

  it('should keep the key alive when re-set before expiring', () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    map.set('a', 1, 30);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
  });

  it('should remove the key when set twice without keepAlive and time passed', () => {
    const map = new ExpirableMap([], { defaultTtl: 100, keepAlive: false });
    map.set('a', 1);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    map.set('a', 1, 3000);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    sleep(500);
    jest.advanceTimersByTime(500);
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
  });

  it('should maintain the key when firstly set with time and then set with 0', () => {
    const map = new ExpirableMap();
    map.set('a', 1, 10);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    map.set('a', 1, 0);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
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

  it('should initialize the map with the given entries and expiration times', () => {
    const map = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);
    expect(map.size).toBe(2);
    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    sleep(15);
    jest.advanceTimersByTime(15);
    expect(map.size).toBe(1);
    expect(map.get('a')).toBe(undefined);
    expect(map.get('b')).toBe(2);
    sleep(15);
    jest.advanceTimersByTime(15);
    expect(map.size).toBe(0);
    expect(map.get('a')).toBe(undefined);
    expect(map.get('b')).toBe(undefined);
  });
});

describe('ExpirableMap hooks', () => {
  it('should fail if the hook name is not valid', () => {
    const map = new ExpirableMap([
      [1, 'one'],
      [2, 'two'],
      [3, 'three']
    ]);

    expect(() => {
      map.addHook('notValid', () => {return;});
    }).toThrow();
  });

  it('should call the beforeExpire hook before expiring an entry', () => {
    const map = new ExpirableMap([
      [1, 'one'], 
      [2, 'two'],
      [3, 'three']
    ], {
      defaultTtl: 10
    });

    const beforeExpire = jest.fn();
    map.addHook('beforeExpire', beforeExpire);
    expect(map.size).toBe(3);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(map.size).toBe(0);
    expect(beforeExpire).toHaveBeenCalledTimes(3);
  });

  it('should call the afterExpire hook after expiring an entry', () => {
    const map = new ExpirableMap([
      [1, 'one'], 
      [2, 'two'],
      [3, 'three']
    ], {
      defaultTtl: 10
    });

    const afterExpire = jest.fn();
    map.addHook('afterExpire', afterExpire);
    expect(map.size).toBe(3);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(map.size).toBe(0);
    expect(afterExpire).toHaveBeenCalledTimes(3);
  });
});