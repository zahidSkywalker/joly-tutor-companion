import { writable } from 'svelte/store';

// User Store
export const userStore = writable(null);
export const usersStore = writable([]);

// Theme Store
export const themeStore = writable('light');

// Initialize DB
export async function initDB() {
    await idbHelper.open();
    const users = await idbHelper.getAll();
    usersStore.set(users);
}

export async function saveUser(user) {
    await idbHelper.put(user);
    // Update local store
    usersStore.update(u => {
        const idx = u.findIndex(x => x.username === user.username);
        if(idx !== -1) u[idx] = user;
        else u.push(user);
        return u;
    });
}
