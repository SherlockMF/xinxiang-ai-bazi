import { create } from 'zustand';
import type { BaziProfile, DailyFortune, UserProfile, FavoriteItem } from './types/index.ts';
import { generateBaziProfile } from './services/bazi-service.ts';
import { generateDailyFortune } from './services/fortune-service.ts';
import { getTodayDateString } from './services/birth-utils.ts';
import {
  getProfiles,
  getActiveProfileId,
  setActiveProfileId,
  upsertProfile,
  saveBaziForUser,
  removeProfileData,
  clearAllData,
  clearDailyCacheForUser,
  STORAGE_KEYS
} from './services/storage-service.ts';
import { getFavoriteItems, addFavoriteItem, removeFavoriteItem } from './services/favorite-service.ts';
import { appendDailyHistory, clearDailyHistoryForUser } from './services/history-service.ts';
import { recordVisit } from './services/visit-stats-service.ts';
import { storage } from './services/storage-adapter.ts';

interface AppState {
  profiles: UserProfile[];
  profile: UserProfile | null;
  bazi: BaziProfile | null;
  fortune: DailyFortune | null;
  favorites: FavoriteItem[];
  ready: boolean;
  loading: boolean;
  error: string;
  revision: number;
  initialize: () => Promise<void>;
  selectProfile: (id: string) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  clear: () => void;
  favorite: (item: FavoriteItem) => 'added' | 'duplicate' | 'error';
  unfavorite: (id: string) => void;
  refresh: () => void;
}

let generation = 0;
export const useAppStore = create<AppState>((set, get) => ({
  profiles: [],
  profile: null,
  bazi: null,
  fortune: null,
  favorites: [],
  ready: false,
  loading: false,
  error: '',
  revision: 0,
  initialize: async () => {
    try {
      const profiles = getProfiles();
      set({ profiles });
      const selected = profiles.find((p) => p.id === getActiveProfileId()) || profiles[0];
      if (selected) await get().selectProfile(selected.id);
    } catch {
      set({ error: '无法读取本地档案，请允许浏览器使用本地存储。' });
    } finally {
      set({ ready: true });
    }
  },
  selectProfile: async (id) => {
    const current = ++generation;
    const profiles = getProfiles();
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;
    set({ profiles, profile, bazi: null, fortune: null, favorites: [], loading: true, error: '' });
    try {
      setActiveProfileId(id);
      const bazi = await generateBaziProfile(profile);
      if (current !== generation) return;
      saveBaziForUser(bazi);
      const fortune = await generateDailyFortune(bazi, profile, getTodayDateString());
      if (current !== generation) return;
      recordVisit(id);
      appendDailyHistory(id, fortune);
      set({ bazi, fortune, favorites: getFavoriteItems(id), loading: false, revision: get().revision + 1 });
    } catch (error) {
      if (current === generation)
        set({ loading: false, error: error instanceof Error ? error.message : '读取心象失败，请重试。' });
    }
  },
  saveProfile: async (profile) => {
    const previous = getProfiles().find((p) => p.id === profile.id);
    if (previous) {
      clearDailyCacheForUser(profile.id);
      clearDailyHistoryForUser(profile.id);
      const reports = JSON.parse(storage.getItem(STORAGE_KEYS.BAZI_ANALYSIS) || '{}');
      delete reports[profile.id];
      storage.setItem(STORAGE_KEYS.BAZI_ANALYSIS, JSON.stringify(reports));
    }
    upsertProfile(profile);
    await get().selectProfile(profile.id);
    if (get().error) throw new Error(get().error);
  },
  deleteProfile: async (id) => {
    const activeId = get().profile?.id;
    removeProfileData(id);
    const profiles = getProfiles();
    set({ profiles });
    if (activeId === id) {
      ++generation;
      set({ profile: null, bazi: null, fortune: null, favorites: [], loading: false });
      if (profiles[0]) await get().selectProfile(profiles[0].id);
    }
  },
  clear: () => {
    ++generation;
    clearAllData();
    set({
      profiles: [],
      profile: null,
      bazi: null,
      fortune: null,
      favorites: [],
      error: '',
      loading: false,
      revision: get().revision + 1
    });
  },
  favorite: (item) => {
    const result = addFavoriteItem(item);
    if (get().profile?.id === item.userId) set({ favorites: getFavoriteItems(item.userId) });
    return result;
  },
  unfavorite: (id) => {
    const uid = get().profile?.id;
    if (!uid) return;
    removeFavoriteItem(uid, id);
    set({ favorites: getFavoriteItems(uid) });
  },
  refresh: () => set({ revision: get().revision + 1 })
}));
