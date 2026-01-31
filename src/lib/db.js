const DB_NAME = 'JolyTutorDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

export const idbHelper = {
    db: null,
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onupgradeneeded = (e) => {
                this.db = e.target.result;
                if (!this.db.objectStoreNames.contains(STORE_NAME)) {
                    this.db.createObjectStore(STORE_NAME, { keyPath: 'username' });
                }
            };
            
            request.onsuccess = (e) => {
                this.db = e.target.result;
                
                // DISABLED MIGRATION TO PREVENT FREEZING
                // If you have old data, we handle it separately.
                // this.migrateFromLocalStorage().then(() => resolve());
                
                resolve(); 
            };
            
            request.onerror = (e) => {
                console.error("DB Error:", e);
                reject(e);
            };
        });
    },
    
    async getAll() {
        return new Promise((resolve, reject) => {
            if(!this.db) {
                reject(new Error("DB not open"));
                return;
            }
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e);
        });
    },
    
    async put(user) {
        return new Promise((resolve, reject) => {
            if(!this.db) {
                reject(new Error("DB not open"));
                return;
            }
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(user);
            
            request.onsuccess = () => resolve();
            request.onerror = (e) => {
                console.error("Put Error:", e);
                reject(e);
            };
            
            // TIMEOUT FIX: If DB hangs for 2 seconds, force resolve
            // This prevents app from freezing forever
            setTimeout(() => {
                if(!request.result && !request.error) {
                    resolve(); // Resolve anyway to unfreeze UI
                }
            }, 2000);
        });
    },
    
    async delete(username) {
        return new Promise((resolve, reject) => {
            if(!this.db) {
                reject(new Error("DB not open"));
                return;
            }
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(username);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    }
};
