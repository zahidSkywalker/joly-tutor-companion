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
                this.migrateFromLocalStorage().then(() => resolve()).catch(err => {
                    console.error("Migration Error:", err);
                    // Even if migration fails, we resolve so app works
                    resolve(); 
                });
            };
            
            request.onerror = (e) => {
                console.error("DB Error:", e);
                reject(e);
            };
        });
    },
    async migrateFromLocalStorage() {
        const oldData = localStorage.getItem('lumina_pro_users');
        if (oldData) {
            try {
                const users = JSON.parse(oldData);
                const tx = this.db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                
                // Safely migrate in batches to avoid freezing
                for (const user of users) {
                    if (!user.attendanceHistory) user.attendanceHistory = {}; 
                    if (!user.students) user.students = [];
                    user.students.forEach(s => {
                        if(!s.attendanceHistory) s.attendanceHistory = {};
                    });
                    store.put(user);
                }
                
                return new Promise(r => tx.oncomplete = r);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                // Clear corrupted local data
                localStorage.removeItem('lumina_pro_users');
                throw e;
            }
        }
    },
    async getAll() {
        return new Promise((resolve, reject) => {
            if(!this.db) {
                reject(new Error("DB not initialized"));
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
                reject(new Error("DB not initialized"));
                return;
            }
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(user);
            request.onsuccess = () => resolve();
            request.onerror = (e) => {
                console.error("DB Save Error:", e);
                reject(e);
            };
        });
    },
    async delete(username) {
        return new Promise((resolve, reject) => {
            if(!this.db) {
                reject(new Error("DB not initialized"));
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
