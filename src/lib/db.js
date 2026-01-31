const DB_NAME = 'JolyTutorDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

export const idbHelper = {
    db: null,
    
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            // TIMEOUT FIX: If DB doesn't open in 2 seconds, reject it (stops freeze)
            const timeoutId = setTimeout(() => {
                reject(new Error("Database Timeout: Check your browser settings or disable Private Mode."));
            }, 2000);
            
            request.onupgradeneeded = (e) => {
                this.db = e.target.result;
                if (!this.db.objectStoreNames.contains(STORE_NAME)) {
                    this.db.createObjectStore(STORE_NAME, { keyPath: 'username' });
                }
            };
            
            request.onsuccess = (e) => {
                clearTimeout(timeoutId); // Clear timeout on success
                this.db = e.target.result;
                resolve(); // Resolve immediately, don't run migration logic
            };
            
            request.onerror = (e) => {
                clearTimeout(timeoutId);
                reject(e);
            };
        });
    },
    
    async getAll() {
        return new Promise((resolve, reject) => {
            if(!this.db) return reject(new Error("DB not open"));
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e);
        });
    },
    
    async put(user) {
        return new Promise((resolve, reject) => {
            if(!this.db) return reject(new Error("DB not open"));
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(user);
            
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    
    async delete(username) {
        return new Promise((resolve, reject) => {
            if(!this.db) return reject(new Error("DB not open"));
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(username);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    }
};
