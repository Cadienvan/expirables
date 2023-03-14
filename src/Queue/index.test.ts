import { ExpirableQueue } from './index';
import { sleep } from '../utils';

jest.useFakeTimers();

describe('ExpirableQueue', () => {
  it('should act as a queue if defaultTtl is 0', () => {
    const queue = new ExpirableQueue([1, 2, 3]);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should return the correct next element', () => {
    const queue = new ExpirableQueue([1, 2, 3]);
    expect(queue.next.value).toBe(1);
  });

  it('should allow entries to define a specific ttl and let them expire accordingly', () => {
    const queue = new ExpirableQueue([[1, 30], 2, [3, 50]], { defaultTtl: 10 }); // 2 will expire after 10ms, 1 after 30ms and 3 after 50ms
    expect(queue.size).toBe(3);
    sleep(11);
    jest.advanceTimersByTime(11);
    expect(queue.size).toBe(2);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(queue.size).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(queue.size).toBe(0);
  });

  it('should remove the first element after the expiration time', () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should set an expirable entry and remove it after the expiration time', () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    expect(queue.size).toBe(3);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(queue.size).toBe(0);
    queue.enqueue(4, 30);
    expect(queue.size).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(queue.size).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(queue.size).toBe(0);
  });
});

describe('ExpirableQueue hooks', () => {
  it('should call the beforeExpire hook before expiring an entry', () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    const beforeExpire = jest.fn();
    queue.addHook('beforeExpire', beforeExpire);
    expect(queue.size).toBe(3);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(beforeExpire).toHaveBeenCalledTimes(3);
  });

  it('should call the afterExpire hook after expiring an entry', () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    const afterExpire = jest.fn();
    queue.addHook('afterExpire', afterExpire);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(afterExpire).toHaveBeenCalledTimes(3);
    expect(queue.size).toBe(0);
  });

  it('should fail if the hook name is not valid', () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    expect(() =>
      queue.addHook('notValid' as any, () => {
        return;
      })
    ).toThrow();
  });
});
