import { writable, derived } from 'svelte/store';
import { idbHelper } from './db.js';

// User Stores
export const userStore = writable(null);
export const usersStore = writable([]);

// UI Stores (To connect Pages to Modals in Layout)
export const modalStore = writable({
    add: false,
    settings: false,
    note: false,
    profile: false,
    qr: false
});
export const viewingStudentStore = writable(-1);

export async function initDB() {
    await idbHelper.open();
    const users = await idbHelper.getAll();
    usersStore.set(users);
}

export async function saveUser(user) {
    await idbHelper.put(user);
    usersStore.update(u => {
        const idx = u.findIndex(x => x.username === user.username);
        if(idx !== -1) u[idx] = user;
        else u.push(user);
        return u;
    });
    userStore.set(user);
}

export function checkDue(lastPayStr) {
    if(!lastPayStr) return true;
    const lastPay = new Date(lastPayStr);
    const nextDue = new Date(lastPay);
    nextDue.setDate(lastPay.getDate() + 30);
    return new Date() > nextDue;
}

export function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1024;
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(img, 0, 0, width, height);
            tempCanvas.toBlob((blob) => {
                callback(blob);
            }, 'image/jpeg', 0.7);
        }
    };
}
