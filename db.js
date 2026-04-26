// IndexedDB 存储层 - 替代 localStorage
// 数据库名: speech_contest_db
// 对象存储: grades, results

const DB_NAME = 'speech_contest_db';
const DB_VERSION = 1;
const STORE_GRADES = 'grades';
const STORE_RESULTS = 'results';

let dbInstance = null;

// 打开数据库
function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_GRADES)) {
                db.createObjectStore(STORE_GRADES, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_RESULTS)) {
                db.createObjectStore(STORE_RESULTS, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// 保存数据（通用）
function dbPut(storeName, data) {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
}

// 读取数据（通用）
function dbGet(storeName, key) {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
}

// 获取所有数据
function dbGetAll(storeName) {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        }).catch(reject);
    });
}

// 保存所有年段数据
function saveGrades(grades) {
    return dbPut(STORE_GRADES, { id: 'all', data: grades });
}

// 加载所有年段数据
function loadGrades() {
    return new Promise((resolve) => {
        dbGet(STORE_GRADES, 'all').then(result => {
            resolve(result ? result.data : null);
        }).catch(() => resolve(null));
    });
}

// 保存比赛结果
function saveResults(results) {
    return dbPut(STORE_RESULTS, { id: 'all', data: results });
}

// 加载比赛结果
function loadResults() {
    return new Promise((resolve) => {
        dbGet(STORE_RESULTS, 'all').then(result => {
            resolve(result ? result.data : []);
        }).catch(() => resolve([]));
    });
}

// 清空所有数据
function clearAllData() {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const tx = db.transaction([STORE_GRADES, STORE_RESULTS], 'readwrite');
            tx.objectStore(STORE_GRADES).clear();
            tx.objectStore(STORE_RESULTS).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        }).catch(reject);
    });
}

// 导出函数供全局使用
window.SpeechContestDB = {
    saveGrades,
    loadGrades,
    saveResults,
    loadResults,
    clearAllData,
    openDB
};
