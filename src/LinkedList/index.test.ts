import { ExpirableLinkedList } from './index';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ExpirableLinkedList', () => {
  it('should act as a LinkedList if defaultTtl is 0', () => {
    const list = new ExpirableLinkedList([1, 2, 3]);
    expect(list.head!.value).toBe(1);
    expect(list.head!.next!.value).toBe(2);
    expect(list.head!.next!.next!.value).toBe(3);
  });

  it('should prepend an element', () => {
    const list = new ExpirableLinkedList([1, 2, 3]);
    list.prepend(4);
    expect(list.head!.value).toBe(4);
    expect(list.head!.next!.value).toBe(1);
    expect(list.head!.next!.next!.value).toBe(2);
    expect(list.head!.next!.next!.next!.value).toBe(3);
  });

  it('should remove the first element after the expiration time', async () => {
    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    await sleep(20);
    expect(list.head).toBeNull();
  });

  it('should set an expirable entry and remove it after the expiration time', async () => {
    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    expect(list.length).toBe(3);
    await sleep(20);
    expect(list.length).toBe(0);
    list.append(4, 30);
    expect(list.length).toBe(1);
    await sleep(20);
    expect(list.length).toBe(1);
    await sleep(20);
    expect(list.length).toBe(0);
  });

  it('should remove an entry when remove is called by using the id', () => {
    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    expect(list.length).toBe(3);
    list.remove(list.head!.id);
    expect(list.length).toBe(2);
    list.remove(list.head!.id);
    expect(list.length).toBe(1);
    list.remove(list.head!.id);
    expect(list.length).toBe(0);
  });

  it('should remove an entry when remove is called by using the node', () => {
    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    expect(list.length).toBe(3);
    list.remove(list.head!);
    expect(list.length).toBe(2);
    list.remove(list.head!);
    expect(list.length).toBe(1);
    list.remove(list.head!);
    expect(list.length).toBe(0);
  });
});
