import { beforeEach, describe, expect, it, vi } from 'vitest';

const { stores, database } = vi.hoisted(() => {
  const stores = new Map<string, Map<string, unknown>>();
  const storeFor = (name: string) => {
    let store = stores.get(name);
    if (!store) stores.set(name, store = new Map());
    return store;
  };
  const database = {
    get: async (store: string, key: string) => storeFor(store).get(key),
    put: async (store: string, value: unknown, key: string) => { storeFor(store).set(key, value); },
    delete: async (store: string, key: string) => { storeFor(store).delete(key); },
  };
  return { stores, database };
});

vi.mock('idb', () => ({ openDB: async () => database }));

import { getMilestoneSound, putMilestoneSound, removeMilestoneSound } from './db';

const sound = (content: string, type: string) => new Blob([content], { type });

describe('independent milestone sound storage', () => {
  beforeEach(() => stores.clear());

  it('retains three distinct files simultaneously and replaces only the selected tier', async () => {
    const bronze = sound('bronze audio', 'audio/mpeg');
    const silver = sound('silver audio', 'audio/wav');
    const gold = sound('legendary audio', 'audio/mpeg');
    await putMilestoneSound(25, bronze);
    await putMilestoneSound(50, silver);
    await putMilestoneSound(100, gold);

    expect(await getMilestoneSound(25)).toBe(bronze);
    expect(await getMilestoneSound(50)).toBe(silver);
    expect(await getMilestoneSound(100)).toBe(gold);

    const replacement = sound('replacement silver', 'audio/ogg');
    await putMilestoneSound(50, replacement);
    expect(await getMilestoneSound(25)).toBe(bronze);
    expect(await getMilestoneSound(50)).toBe(replacement);
    expect(await getMilestoneSound(100)).toBe(gold);
  });

  it('removes only the requested tier and leaves the other files available', async () => {
    const bronze = sound('bronze audio', 'audio/mpeg');
    const silver = sound('silver audio', 'audio/wav');
    const gold = sound('legendary audio', 'audio/mpeg');
    await Promise.all([
      putMilestoneSound(25, bronze),
      putMilestoneSound(50, silver),
      putMilestoneSound(100, gold),
    ]);

    await removeMilestoneSound(25);
    expect(await getMilestoneSound(25)).toBeNull();
    expect(await getMilestoneSound(50)).toBe(silver);
    expect(await getMilestoneSound(100)).toBe(gold);
  });
});
