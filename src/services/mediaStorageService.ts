/**
 * CivicSignal Media Storage Service
 * Handles persistence of original and geotagged photographic assets using IndexedDB.
 * Prevents localStorage QuotaExceeded errors while ensuring full evidence integrity.
 */

const DB_NAME = 'civicsignal_evidence_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'evidence_assets';

export interface StoredEvidenceMedia {
  evidenceId: string;
  originalDataUrl: string;
  geotaggedDataUrl?: string;
  sizeFormatted: string;
  mimeType: string;
  createdAt: string;
}

// In-memory fallback if IndexedDB is blocked
const memoryStore = new Map<string, StoredEvidenceMedia>();

export class MediaStorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB not supported in this environment.'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'evidenceId' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, using memory fallback:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save original and geotagged evidence assets
   */
  static async saveEvidenceMedia(item: StoredEvidenceMedia): Promise<void> {
    memoryStore.set(item.evidenceId, item);

    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(item);

        req.onsuccess = () => resolve();
        req.onerror = () => {
          console.warn('Failed to save evidence to IndexedDB:', req.error);
          resolve(); // Fallback in memory already stored
        };
      });
    } catch (e) {
      // Memory store is already updated
    }
  }

  /**
   * Retrieve evidence assets by ID
   */
  static async getEvidenceMedia(evidenceId: string): Promise<StoredEvidenceMedia | null> {
    if (memoryStore.has(evidenceId)) {
      return memoryStore.get(evidenceId)!;
    }

    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(evidenceId);

        req.onsuccess = () => {
          const res = req.result as StoredEvidenceMedia | undefined;
          if (res) {
            memoryStore.set(evidenceId, res);
            resolve(res);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }
}
