import { ExpirableLinkedList } from './index';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ExpirableLinkedList', () => {
  it('should act as a LinkedList if defaultTtl is 0', () => {
    const list = new ExpirableLinkedList([1, 2, 3]);
    expect(list.head!.value).toBe(1);
    expect(list.head!.next!.value).toBe(2);
    expect(list.head!.next!.next!.value).toBe(3);
  });

  it('should prepend an element in both an empty and filled list', () => {
    const list = new ExpirableLinkedList([1, 2, 3, 4]);
    list.prepend(4, 1000); // 4 will expire after 1s, adding second parameter only for coverage
    expect(list.head!.value).toBe(4);
    expect(list.head!.next!.value).toBe(1);
    expect(list.head!.next!.next!.value).toBe(2);
    expect(list.head!.next!.next!.next!.value).toBe(3);
    const list2 = new ExpirableLinkedList();
    list2.prepend(4);
    expect(list2.head!.value).toBe(4);
  });

  it('should clear the list', () => {
    const list = new ExpirableLinkedList([1, 2, 3]);
    expect(list.length).toBe(3);
    list.clear();
    expect(list.length).toBe(0);
  });

  it('should return false when removing an element that does not exist', () => {
    const list = new ExpirableLinkedList([1, 2, 3]);
    expect(list.remove(Symbol())).toBe(false);
  });

  it('should keep alive an element when setExpiration is called again', async () => {
    const list = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10,
      unrefTimeouts: true
    });
    expect(list.length).toBe(3);
    await sleep(5);
    list.setExpiration(list.head!, 20);
    await sleep(10);
    expect(list.length).toBe(2);
    list.setExpiration(list.head!, 20);
    await sleep(10);
    expect(list.length).toBe(1);
    await sleep(10);
    expect(list.length).toBe(0);
  });

  it('should remove the first element after the expiration time', async () => {
    const list = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10,
      unrefTimeouts: true
    });
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

  it('should allow entries to define a specific ttl and let them expire accordingly', async () => {
    const list = new ExpirableLinkedList([[1, 30], 2, [3, 50]], {
      defaultTtl: 10
    }); // 2 will expire after 10ms, 1 after 30ms and 3 after 50ms
    expect(list.length).toBe(3);
    await sleep(11);
    expect(list.length).toBe(2);
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
