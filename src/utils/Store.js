export class Store {
  store;

  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key);
  }

  add(key, value) {
    this.store.set(key, value);
  }

  remove(key) {
    this.store.remove(key);
  }

  getOfflineData() {
    return this.store.entries();
  }
}