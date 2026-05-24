import {type MapStore, type StoreValue, type WritableAtom} from 'nanostores';
import {createThrottle} from '../timing/createThrottle';
import {normalize} from '../format/keys';

type StorageType = 'local' | 'session';

type WritableStore = WritableAtom | MapStore;

interface SyncOptions<S extends WritableStore, V extends StoreValue<S> = StoreValue<S>> {
    encode?: (data: V) => string;
    decode?: (raw: string) => V;
    throttleMs?: number;
    storageType?: StorageType;
    loadInitial?: boolean;
    syncTabs?: boolean;
}

type SyncAtomOptions<V = unknown> = Omit<SyncOptions<WritableAtom, V>, 'encode' | 'decode'>;

type SyncMapOptions<M extends Record<string, unknown>> = {
    keys?: (keyof M)[];
} & Omit<SyncOptions<MapStore<M>, M>, 'encode' | 'decode'>;

/**
 * Synchronizes a Nanostores store with browser storage (localStorage or sessionStorage).
 *
 * This utility sets up bidirectional synchronization between the store and browser storage:
 * - Writes store changes to storage with optimized throttling (leading + trailing edge)
 * - Optionally loads initial value from storage into the store
 * - Optionally syncs changes from other tabs/windows (localStorage only)
 * - Automatically flushes pending writes on page unload/visibility change
 *
 * The store is the single source of truth. The returned cleanup function only handles
 * synchronization cleanup.
 *
 * @returns Cleanup function. Call with no argument to cleanup. Call with `true` to also clear storage.
 */
function syncStore<S extends WritableStore, V extends StoreValue<S> = StoreValue<S>>(
    store: S,
    storeName: string,
    options: SyncOptions<S, V> = {}
): (clearStorage?: boolean) => void {
    const {
        throttleMs = 100,
        encode = (data: V): string => JSON.stringify(data),
        decode = (raw: string): V => JSON.parse(raw) as V,
        storageType = 'local',
        loadInitial = false,
        syncTabs = false,
    } = options;

    const storage = getStorage(storageType);
    if (!storage) {
        console.warn(`${storageType}Storage is not available. Store sync will not work.`);
        return createNoopSync();
    }

    const normalizedKey = normalize(storeName);
    if (!normalizedKey) {
        console.error(`Invalid store name: "${storeName}". Store sync will not work.`);
        return createNoopSync();
    }

    const storageKey = getStorageKey(normalizedKey);

    const getFromStorage = (): V | undefined => {
        try {
            const raw = storage.getItem(storageKey);
            if (!raw) return undefined;
            return decode(raw);
        } catch (error: unknown) {
            console.error(`Error getting value from ${storageType}Storage ${storageKey}`, error);
            return undefined;
        }
    };

    const writeToStorage = (value: V): void => {
        try {
            storage.setItem(storageKey, encode(value));
        } catch (error: unknown) {
            if (isQuotaExceededError(error)) {
                console.error(`${storageType}Storage quota exceeded for ${storageKey}`, error);
            } else {
                console.error(`Error writing to ${storageType}Storage ${storageKey}`, error);
            }
        }
    };

    const removeFromStorage = (): void => {
        try {
            storage.removeItem(storageKey);
        } catch (error: unknown) {
            console.error(`Error removing from ${storageType}Storage ${storageKey}`, error);
        }
    };

    const throttledWrite = createThrottle((value: V, _oldValue: V | undefined): void => {
        try {
            if (value !== undefined) {
                writeToStorage(value);
            } else {
                removeFromStorage();
            }
        } catch (error: unknown) {
            console.error(`Error syncing store with ${storageType}Storage ${storageKey}`, error);
        }
    }, throttleMs);

    if (loadInitial) {
        const initialValue = getFromStorage();
        if (initialValue !== undefined && 'set' in store) {
            try {
                store.set(initialValue);
            } catch (error: unknown) {
                console.error(`Error loading initial value from ${storageType}Storage`, error);
            }
        }
    }

    const unsubscribe = store.listen(throttledWrite);

    let storageListener: ((e: StorageEvent) => void) | null = null;
    if (syncTabs && storageType === 'local') {
        storageListener = (e: StorageEvent) => {
            if (e.key === storageKey && e.newValue !== null && 'set' in store) {
                try {
                    const newValue = decode(e.newValue);
                    store.set(newValue);
                } catch (error: unknown) {
                    console.error(`Error syncing from other tab for ${storageKey}`, error);
                }
            }
        };
        window.addEventListener('storage', storageListener);
    }

    const visibilityListener = (): void => {
        if (document.visibilityState === 'hidden') {
            throttledWrite.flush();
        }
    };
    document.addEventListener('visibilitychange', visibilityListener);

    const beforeUnloadListener = () => {
        throttledWrite.flush();
    };
    window.addEventListener('beforeunload', beforeUnloadListener);

    return (clearStorage?: boolean) => {
        try {
            throttledWrite.flush();
            unsubscribe();

            if (storageListener) {
                window.removeEventListener('storage', storageListener);
                storageListener = null;
            }
            document.removeEventListener('visibilitychange', visibilityListener);
            window.removeEventListener('beforeunload', beforeUnloadListener);

            if (clearStorage) {
                removeFromStorage();
            }
        } catch (error: unknown) {
            console.error(`Error unsyncing from store ${storeName}`, error);
        }
    };
}

/**
 * Convenience wrapper for syncing a Nanostores atom (WritableAtom) to browser storage.
 * Syncs the entire atom value (deep equality, full overwrite).
 */
export function syncAtomStore<V = unknown>(
    store: WritableAtom<V>,
    storeName: string,
    options: SyncAtomOptions<V> = {}
): (clearStorage?: boolean) => void {
    return syncStore(store, storeName, options);
}

/**
 * Convenience wrapper for syncing a Nanostores map store with optional partial key syncing.
 *
 * - `keys` undefined or empty: syncs the entire map
 * - `keys` non-empty: syncs only those keys; loaded values are merged with current store state
 */
export function syncMapStore<M extends Record<string, unknown>>(
    store: MapStore<M>,
    storeName: string,
    options: SyncMapOptions<M> = {}
): (clearStorage?: boolean) => void {
    const {keys, ...syncOptions} = options;

    const isPartialSync = keys !== undefined && keys.length > 0;

    const encode = isPartialSync
        ? (data: M): string => {
              const partial: Partial<M> = {};
              for (const key of keys) {
                  if (key in data) {
                      partial[key] = data[key];
                  }
              }
              return JSON.stringify(partial);
          }
        : (data: M): string => JSON.stringify(data);

    const decode = isPartialSync
        ? (raw: string): M => {
              const partial = JSON.parse(raw) as Partial<M>;
              const current = store.get();
              return {...current, ...partial};
          }
        : (raw: string): M => JSON.parse(raw) as M;

    return syncStore(store, storeName, {
        ...syncOptions,
        encode,
        decode,
    });
}

//
// * Utilities
//

/**
 * Create a key for the current application's storage.
 * The key is prefixed with 'enonic:apps:' to avoid conflicts when CS and apps
 * run in the same admin session.
 */
function getStorageKey(normalizedKey: string): string {
    return 'enonic:apps:' + normalizedKey;
}

const storageCache = new Map<StorageType, Storage | null>();

function getStorage(type: StorageType): Storage | null {
    if (storageCache.has(type)) {
        return storageCache.get(type) ?? null;
    }

    let storage: Storage | null = null;

    try {
        const storageImpl = type === 'local' ? window.localStorage : window.sessionStorage;
        const testKey = '__storage_test__';
        storageImpl.setItem(testKey, 'test');
        storageImpl.removeItem(testKey);
        storage = storageImpl;
    } catch {
        storage = null;
    }

    storageCache.set(type, storage);
    return storage;
}

function isQuotaExceededError(error: unknown): boolean {
    if (!(error instanceof DOMException)) {
        return false;
    }

    return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
}

function createNoopSync(): (clearStorage?: boolean) => void {
    return () => {
        // No-op cleanup function
    };
}
