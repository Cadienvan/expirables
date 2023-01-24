export default class LinkedListNode<Val> {
  id: Symbol = Symbol();
  value: Val;
  next: LinkedListNode<Val> | null;

  constructor(value: Val, next = null) {
    this.id = Symbol();
    this.value = value;
    this.next = next;
  }
}
