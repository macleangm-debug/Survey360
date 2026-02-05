/**
 * DataPulse Offline Storage Service
 * Uses IndexedDB for storing forms, submissions, and media offline
 */

const DB_NAME = 'DataPulseOffline';
const DB_VERSION = 1;

// Store names
const STORES = {
  FORMS: 'forms',
  SUBMISSIONS: 'pendingSubmissions',
  MEDIA: 'media',
  SYNC_QUEUE: 'syncQueue'
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.readyPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isReady = true;
        console.log('IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Forms store - cached forms for offline use
        if (!db.objectStoreNames.contains(STORES.FORMS)) {
          const formsStore = db.createObjectStore(STORES.FORMS, { keyPath: 'id' });
          formsStore.createIndex('project_id', 'project_id', { unique: false });
          formsStore.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Pending submissions store
        if (!db.objectStoreNames.contains(STORES.SUBMISSIONS)) {
          const submissionsStore = db.createObjectStore(STORES.SUBMISSIONS, { 
            keyPath: 'local_id', 
            autoIncrement: true 
          });
          submissionsStore.createIndex('form_id', 'form_id', { unique: false });
          submissionsStore.createIndex('status', 'status', { unique: false });
          submissionsStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Media store - for photos, audio, video
        if (!db.objectStoreNames.contains(STORES.MEDIA)) {
          const mediaStore = db.createObjectStore(STORES.MEDIA, { keyPath: 'id' });
          mediaStore.createIndex('submission_id', 'submission_id', { unique: false });
          mediaStore.createIndex('type', 'type', { unique: false });
        }

        // Sync queue
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  async ensureReady() {
    if (!this.isReady) {
      await this.readyPromise;
    }
    return this.db;
  }

  // ============ Forms ============

  async saveForm(form) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FORMS], 'readwrite');
      const store = transaction.objectStore(STORES.FORMS);
      const request = store.put({ ...form, cached_at: new Date().toISOString() });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getForm(formId) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FORMS], 'readonly');
      const store = transaction.objectStore(STORES.FORMS);
      const request = store.get(formId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllForms() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FORMS], 'readonly');
      const store = transaction.objectStore(STORES.FORMS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFormsByProject(projectId) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.FORMS], 'readonly');
      const store = transaction.objectStore(STORES.FORMS);
      const index = store.index('project_id');
      const request = index.getAll(projectId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ============ Submissions ============

  async saveSubmission(submission) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBMISSIONS], 'readwrite');
      const store = transaction.objectStore(STORES.SUBMISSIONS);
      const data = {
        ...submission,
        status: 'pending',
        created_at: new Date().toISOString(),
        sync_attempts: 0
      };
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSubmission(localId) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBMISSIONS], 'readonly');
      const store = transaction.objectStore(STORES.SUBMISSIONS);
      const request = store.get(localId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingSubmissions() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBMISSIONS], 'readonly');
      const store = transaction.objectStore(STORES.SUBMISSIONS);
      const index = store.index('status');
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSubmissionStatus(localId, status, serverId = null) {
    await this.ensureReady();
    const submission = await this.getSubmission(localId);
    if (!submission) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBMISSIONS], 'readwrite');
      const store = transaction.objectStore(STORES.SUBMISSIONS);
      const updated = {
        ...submission,
        status,
        server_id: serverId,
        synced_at: status === 'synced' ? new Date().toISOString() : null,
        sync_attempts: submission.sync_attempts + 1
      };
      const request = store.put(updated);
      request.onsuccess = () => resolve(updated);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSubmission(localId) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBMISSIONS], 'readwrite');
      const store = transaction.objectStore(STORES.SUBMISSIONS);
      const request = store.delete(localId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingCount() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBMISSIONS], 'readonly');
      const store = transaction.objectStore(STORES.SUBMISSIONS);
      const index = store.index('status');
      const request = index.count('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ============ Media ============

  async saveMedia(id, submissionId, type, blob, metadata = {}) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.MEDIA], 'readwrite');
      const store = transaction.objectStore(STORES.MEDIA);
      const data = {
        id,
        submission_id: submissionId,
        type, // 'photo', 'audio', 'video'
        blob,
        metadata,
        created_at: new Date().toISOString()
      };
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMedia(id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.MEDIA], 'readonly');
      const store = transaction.objectStore(STORES.MEDIA);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMediaBySubmission(submissionId) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.MEDIA], 'readonly');
      const store = transaction.objectStore(STORES.MEDIA);
      const index = store.index('submission_id');
      const request = index.getAll(submissionId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMedia(id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.MEDIA], 'readwrite');
      const store = transaction.objectStore(STORES.MEDIA);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // ============ Utilities ============

  async clearAll() {
    await this.ensureReady();
    const stores = [STORES.FORMS, STORES.SUBMISSIONS, STORES.MEDIA, STORES.SYNC_QUEUE];
    
    return Promise.all(stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    }));
  }

  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      };
    }
    return null;
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();

// Sync manager for handling offline/online transitions
export class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.listeners = new Set();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_SUBMISSIONS') {
          this.syncPendingSubmissions();
        }
      });
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(callback => callback(event));
  }

  handleOnline() {
    console.log('Back online - starting sync');
    this.notifyListeners({ type: 'online' });
    this.syncPendingSubmissions();
  }

  handleOffline() {
    console.log('Gone offline');
    this.notifyListeners({ type: 'offline' });
  }

  async syncPendingSubmissions() {
    if (this.isSyncing || !navigator.onLine) return;
    
    this.isSyncing = true;
    this.notifyListeners({ type: 'sync_start' });

    try {
      const pending = await offlineStorage.getPendingSubmissions();
      console.log(`Syncing ${pending.length} pending submissions`);

      for (const submission of pending) {
        try {
          // Upload submission to server
          const response = await fetch('/api/submissions/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(submission.data)
          });

          if (response.ok) {
            const result = await response.json();
            await offlineStorage.updateSubmissionStatus(submission.local_id, 'synced', result.id);
            this.notifyListeners({ type: 'sync_success', submission: submission.local_id });
          } else {
            await offlineStorage.updateSubmissionStatus(submission.local_id, 'failed');
            this.notifyListeners({ type: 'sync_error', submission: submission.local_id });
          }
        } catch (error) {
          console.error('Failed to sync submission:', error);
          await offlineStorage.updateSubmissionStatus(submission.local_id, 'pending');
        }
      }

      this.notifyListeners({ type: 'sync_complete', synced: pending.length });
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners({ type: 'sync_error', error });
    } finally {
      this.isSyncing = false;
    }
  }

  // Request background sync if supported
  async requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.registration) {
      try {
        await window.registration.sync.register('sync-submissions');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }
}

export const syncManager = new SyncManager();
