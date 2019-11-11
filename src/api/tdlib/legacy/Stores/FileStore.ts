/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events';
import { FILE_PRIORITY } from '../Constants';
import TdLibController from '../../LegacyTdLibController';

const useReadFile = true;
const useDownloadFile = true;

class FileStore extends EventEmitter {
    constructor() {
        super();

        this.reset();

        this.addTdLibListener();
        this.setMaxListeners(Infinity);
    }

    reset = () => {
        this.callbacks = [];

        //this.transactionCount = 0;
        this.db = null;
        this.urls = new WeakMap();
        this.items = new Map();
        this.blobItems = new Map();
        this.locationItems = new Map();

        this.downloads = new Map();
        this.uploads = new Map();
    };

    onUpdate = async update => {
        switch (update['@type']) {
            case 'updateAuthorizationState': {
                await this.onUpdateAuthorizationState(update);

                break;
            }
            case 'updateFile': {
                this.set(update.file);

                this.onUpdateFile(update);

                this.emit(update['@type'], update);
                break;
            }
            default:
                break;
        }
    };

    addTdLibListener = () => {
        TdLibController.addListener('update', this.onUpdate);
    };

    removeTdLibListener = () => {
        TdLibController.removeListener('update', this.onUpdate);
    };

    onUpdateAuthorizationState = async update => {
        if (!update) return;

        const { authorization_state } = update;
        if (!authorization_state) return;

        switch (authorization_state['@type']) {
            case 'authorizationStateWaitTdlibParameters': {
                await this.initDB();
                break;
            }
            case 'authorizationStateClosed': {
                this.reset();
                break;
            }
        }
    };

    onUpdateFile = update => {
        if (!update) return;

        const { file } = update;
        if (!file) return;

        this.handleDownloads(file);
        this.handleUploads(file);
    };

    handleDownloads = file => {
        const { arr, id, idb_key, local } = file;
        delete file.arr;

        if (!this.downloads.has(id)) return;
        if (!local.is_downloading_completed) return;
        if (!useReadFile && !idb_key && !arr) return;

        const items = this.downloads.get(id);
        if (!items) return;

        this.downloads.delete(id);

        const store = this.getStore();

        items.forEach(item => {
            switch (item['@type']) {
                case 'chat': {
                    this.handleChat(store, item, file, arr);
                    break;
                }
                case 'user': {
                    this.handleUser(store, item, file, arr);
                    break;
                }
                default:
                    console.error('FileStore.onUpdateFile unhandled item', item);
                    break;
            }
        });
    };

    handleChat = (store, chat, file, arr) => {
        if (!chat) return;

        this.getLocalFile(
            store,
            file,
            arr,
            () => this.updateChatPhotoBlob(chat.id, file.id),
            () => this.getRemoteFile(file.id, FILE_PRIORITY, chat)
        );
    };

    handleUser = (store, user, file, arr) => {
        if (!user) return;

        this.getLocalFile(
            store,
            file,
            arr,
            () => this.updateUserPhotoBlob(user.id, file.id),
            () => this.getRemoteFile(file.id, FILE_PRIORITY, user)
        );
    };

    async initDB(callback) {
        /*if (this.store) return;
            if (this.initiatingDB) return;

            this.initiatingDB = true;
            this.store = localForage.createInstance({
                name: 'tdlib'
            });
            this.initiatingDB = false;

            return;*/
        if (this.db) {
            console.log('[FileStore] db exists');
            if (callback) callback();
            return;
        }

        if (this.initiatingDB) {
            console.log('[FileStore] add callback');
            if (callback) this.callbacks.push(callback);
            return;
        }

        console.log('[FileStore] start initDB');
        if (callback) this.callbacks.push(callback);

        this.initiatingDB = true;
        this.db = await this.openDB().catch(error => console.log('[FileStore] initDB error', error));
        this.initiatingDB = false;

        console.log('[FileStore] stop initDB');

        if (this.callbacks.length) {
            console.log('[FileStore] invoke callbacks count=' + this.callbacks.length);
            for (let i = 0; i < this.callbacks.length; i++) {
                this.callbacks[i]();
            }
            this.callbacks = [];
        }
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('tdlib');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getStore() {
        if (useReadFile) {
            return undefined;
        }

        //console.log('FileStore.getStore ' + this.transactionCount++);
        return this.db.transaction(['keyvaluepairs'], 'readonly').objectStore('keyvaluepairs');
    }

    getReadWriteStore() {
        if (useReadFile) {
            return undefined;
        }

        return this.db.transaction(['keyvaluepairs'], 'readwrite').objectStore('keyvaluepairs');
    }

    deleteLocalFile = (store, file) => {};

    getLocalFile(store, file, arr, callback, faultCallback) {
        if (!useDownloadFile) {
            return;
        }

        if (useReadFile) {
            file = this.get(file.id) || file;
            if (file && file.local && !file.local.is_downloading_completed) {
                faultCallback();
                return;
            }

            (async file => {
                // console.log('[fs] readFile file_id=' + file.id);
                const response = await TdLibController.send({
                    '@type': 'readFile',
                    file_id: file.id
                });

                // console.log(`[fs] readFile result file_id=${file.id}`, file, response);
                this.setBlob(file.id, response.data);
            })(file).then(callback, faultCallback);

            return;
        }

        let idb_key = file.idb_key;
        if (!idb_key) {
            file = this.get(file.id) || file;
            idb_key = file.idb_key;
        }

        if (!idb_key && !arr) {
            faultCallback();
            return;
        }

        if (arr) {
            file.blob = new Blob([arr]);
            this.setBlob(file.id, file.blob);
            callback();
            return;
        }

        if (file.blob) {
            //callback();
            return;
        }

        // if (this.getBlob(file.id)){
        //     return;
        // }

        const request = store.get(idb_key);
        request.onsuccess = event => {
            const blob = event.target.result;

            if (blob) {
                file.blob = blob;
                this.setBlob(file.id, file.blob);
                callback();
            } else {
                faultCallback();
            }
        };
        request.onerror = () => {
            faultCallback();
        };
    }

    getRemoteFile(fileId, priority, obj) {
        if (!useDownloadFile) {
            return;
        }

        const items = this.downloads.get(fileId) || [];
        if (items.some(x => x === obj)) return;

        items.push(obj);
        this.downloads.set(fileId, items);

        TdLibController.send({
            '@type': 'downloadFile',
            file_id: fileId,
            priority: priority
        });
    }

    cancelGetRemoteFile(fileId, obj) {
        if (!this.downloads.has(fileId)) return;

        if (!obj) {
            this.downloads.delete(fileId);
        } else {
            const items = this.downloads.get(fileId).filter(x => x !== obj);
            this.downloads.set(fileId, items);
        }

        TdLibController.send({
            '@type': 'cancelDownloadFile',
            file_id: fileId,
            only_if_pending: false
        });
    }

    get = fileId => {
        return this.items.get(fileId);
    };

    set = file => {
        this.items.set(file.id, file);
    };

    getBlob = fileId => {
        return this.blobItems.get(fileId);
    };

    setBlob = (fileId, blob) => {
        this.blobItems.set(fileId, blob);
    };

    deleteBlob = fileId => {
        this.blobItems.delete(fileId);
    };

    getBlobUrl = blob => {
        if (!blob) {
            return null;
        }

        if (this.urls.has(blob)) {
            return this.urls.get(blob);
        }

        const url = URL.createObjectURL(blob);
        this.urls.set(blob, url);

        return url;
    };

    deleteBlobUrl = blob => {
        if (this.urls.has(blob)) {
            this.urls.delete(blob);
        }
    };

    updateUserPhotoBlob(userId, fileId) {
        this.emit('clientUpdateUserBlob', {
            userId: userId,
            fileId: fileId
        });
    }

    updateChatPhotoBlob(chatId, fileId) {
        this.emit('clientUpdateChatBlob', {
            chatId: chatId,
            fileId: fileId
        });
    }
}

const store = new FileStore();
export default store;
