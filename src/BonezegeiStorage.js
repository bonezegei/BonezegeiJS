// Bonezegei-Storage (localStorage wrapper)

export class BonezegeiStorage {
  /**
   * @param {string} dbName - IndexedDB name or localStorage key
   * @param {string} store  - IndexedDB object store name (ignored for localStorage)
   * @param {object} options - { type: "local" | "indexeddb", autoIncrement: true|false }
   */
  constructor(dbName = 'bonezegei-db', store = 'object', options = {}) {
    this.type = options.type || 'local'; // default to localStorage
    this.dbName = dbName;
    this.store = store;
    this.db = null;
    this.autoIncrement = !!options.autoIncrement;
    if (this.type === 'local') {
      // localStorage: store all items as array under dbName key
      this._localKey = dbName;
      this._localAutoIncKey = dbName + '_autoid';
    }
  }

  // --- IndexedDB methods ---
  async open() {
    if (this.type === 'local') return;
    // Try to open, and if the store is missing, auto-upgrade version until it exists
    const tryOpen = (version) => new Promise((res, rej) => {
      const req = indexedDB.open(this.dbName, version);
      req.onerror = () => rej(req.error);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.store)) {
          db.createObjectStore(this.store, { keyPath: 'id', autoIncrement: this.autoIncrement });
        }
      };
      req.onsuccess = () => {
        this.db = req.result;
        if (!this.db.objectStoreNames.contains(this.store)) {
          // Store still missing, bump version and try again
          const nextVersion = this.db.version + 1;
          this.db.close();
          tryOpen(nextVersion).then(res).catch(rej);
        } else {
          res();
        }
      };
    });
    // Start with version 1 or current version
    return tryOpen(undefined);
  }

  tx(mode, fn) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(this.store, mode);
      const store = tx.objectStore(this.store);
      const request = fn(store);
      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
      tx.onerror = () => rej(tx.error);
    });
  }

  // --- Unified API ---
  async add(item) {
    if (this.type === 'local') {
      const arr = this._getLocalArr();
      if (this.autoIncrement) {
        let id = parseInt(localStorage.getItem(this._localAutoIncKey) || '1', 10);
        item.id = id;
        localStorage.setItem(this._localAutoIncKey, (id + 1).toString());
      }
      arr.push(item);
      this._setLocalArr(arr);
      return item;
    }
    return this.tx('readwrite', s => s.add(item));
  }

  async update(item) {
    if (this.type === 'local') {
      let arr = this._getLocalArr();
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx >= 0) arr[idx] = item;
      else arr.push(item);
      this._setLocalArr(arr);
      return item;
    }
    return this.tx('readwrite', s => s.put(item));
  }

  async delete(id) {
    if (this.type === 'local') {
      let arr = this._getLocalArr();
      arr = arr.filter(x => x.id !== id);
      this._setLocalArr(arr);
      return;
    }
    return this.tx('readwrite', s => s.delete(id));
  }

// Add this static method inside the BonezegeiStorage class:
static async deleteDatabase(dbName, type = 'indexeddb') {
  if (type === 'indexeddb') {
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(dbName);
      req.onsuccess = () => {
        console.log(`IndexedDB database "${dbName}" deleted.`);
        resolve();
      };
      req.onerror = (e) => {
        console.error(`Failed to delete IndexedDB database "${dbName}"`, e);
        reject(e);
      };
      req.onblocked = () => {
        console.warn(`Delete blocked for IndexedDB database "${dbName}"`);
      };
    });
  } else if (type === 'local') {
    // Remove all localStorage keys that start with dbName
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(dbName)) {
        localStorage.removeItem(key);
      }
    });
    console.log(`localStorage keys for "${dbName}" deleted.`);
    return Promise.resolve();
  }
  return Promise.reject(new Error('Unknown storage type'));
}
// ...rest of BonezegeiStorage class...




// Add this method to the BonezegeiStorage class:
async getById(id) {
  if (this.type === 'indexeddb') {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.store, 'readonly');
      const store = tx.objectStore(this.store);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } else if (this.type === 'local') {
    const all = await this.getAll();
    return all.find(item => item.id === id);
  }
  return null;
}
// const record = await db.getById(id);
// ...rest of BonezegeiStorage class...

  async getAll() {
    if (this.type === 'local') {
      return this._getLocalArr();
    }
    return this.tx('readonly', s => s.getAll());
  }

  async count() {
    if (this.type === 'local') {
      return this._getLocalArr().length;
    }
    return this.tx('readonly', s => s.count());
  }

  /**
   * Get all records matching a predicate function (like SQL WHERE)
   * @param {function} predicate - function(record) => boolean
   * @returns {Promise<Array>} filtered records
   */
  async where(predicate) {
    const all = await this.getAll();
    return all.filter(predicate);
  }

  // --- LocalStorage helpers ---
  _getLocalArr() {
    try {
      const raw = localStorage.getItem(this._localKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  _setLocalArr(arr) {
    localStorage.setItem(this._localKey, JSON.stringify(arr));
  }
}