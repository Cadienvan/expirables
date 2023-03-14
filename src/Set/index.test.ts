import { ExpirableSet } from '.';
import { sleep } from '../utils';

jest.useFakeTimers();

describe('ExpirableSet', () => {
  it('should initialize the set with the given values', () => {
    const set = new ExpirableSet(['a', 'b']);
    expect(set.size).toBe(2);
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(true);
  });

  it('should set the expiration time for a key', () => {
    const set = new ExpirableSet(['a']);
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
  });

  it('should remove the key after the expiration time', () => {
    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(set.size).toBe(0);
    expect(set.has('a')).toBe(false);
  });

  it('should keep the key alive when re-set before expiring', () => {
    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    set.add('a', 30);
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
  });

  it('should remove the key when set twice without keepAlive and time passed', () => {
    const set = new ExpirableSet(['a'], { defaultTtl: 100, keepAlive: false });
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    set.add('a');
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    sleep(500);
    jest.advanceTimersByTime(500);
    expect(set.size).toBe(0);
    expect(set.has('a')).toBe(false);
  });

  it('should maintain the key when firstly set with time and then set with 0', () => {
    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    set.add('a', 0);
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
    sleep(500);
    jest.advanceTimersByTime(500);
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(true);
  });

  it('should initialize the map with the given entries and expiration times', () => {
    const set = new ExpirableSet([
      ['a', 10],
      ['b', 20]
    ]);
    expect(set.size).toBe(2);
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(true);
    sleep(15);
    jest.advanceTimersByTime(15);
    expect(set.size).toBe(1);
    expect(set.has('a')).toBe(false);
    expect(set.has('b')).toBe(true);
    sleep(10);
    jest.advanceTimersByTime(10);
    expect(set.size).toBe(0);
    expect(set.has('a')).toBe(false);
    expect(set.has('b')).toBe(false);
  });
});

describe('ExpirableSet hooks', () => {
  it('should call the beforeExpire hook before expiring an entry', () => {
    const set = new ExpirableSet([1, 2, 3], { defaultTtl: 10 });
    const beforeExpire = jest.fn();
    set.addHook('beforeExpire', beforeExpire);
    expect(set.size).toBe(3);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(beforeExpire).toHaveBeenCalledTimes(3);
  });

  it('should call the afterExpire hook after expiring an entry', () => {
    const set = new ExpirableSet([1, 2, 3], { defaultTtl: 10 });
    const afterExpire = jest.fn();
    set.addHook('afterExpire', afterExpire);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(afterExpire).toHaveBeenCalledTimes(3);
    expect(set.size).toBe(0);
  });

  it('should fail if the hook name is not valid', () => {
    const set = new ExpirableSet([1, 2, 3], { defaultTtl: 10 });
    expect(() =>
      set.addHook('notValid' as any, () => {
        return;
      })
    ).toThrow();
  });
});
