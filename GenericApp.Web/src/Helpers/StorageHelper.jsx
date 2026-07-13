import CryptoJS from 'crypto-js';

// La clave se toma de las variables de entorno. Define VITE_STORAGE_SECRET en tu .env
const SECRET = import.meta.env.VITE_STORAGE_SECRET || '325fa9758bd9df6618887215fdd253fe7ff1ebc29d80d2a66e40a00ee66c9338Fake';

const encrypt = (value) => {
    if (value === null || value === undefined) return null;
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    return CryptoJS.AES.encrypt(str, SECRET).toString();
};

const decrypt = (cipher) => {
    if (!cipher) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
        return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
        return null;
    }
};

export const StorageHelper = {
    setItem: (key, value) => {
        const encrypted = encrypt(value);
        if (encrypted) {
            localStorage.setItem(key, encrypted);
        } else {
            localStorage.removeItem(key);
        }
    },

    getString: (key) => {
        return decrypt(localStorage.getItem(key));
    },

    getObject: (key) => {
        const raw = decrypt(localStorage.getItem(key));
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    removeItem: (key) => localStorage.removeItem(key),
};
