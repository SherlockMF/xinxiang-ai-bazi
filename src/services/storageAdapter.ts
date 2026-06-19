// 统一存储适配器 - storageAdapter
// 用 Taro 的同步存储 API 封装出与 localStorage 一致的接口，
// 使存储逻辑在小程序 / H5 各端表现一致，业务层无需关心底层差异。

import Taro from '@tarojs/taro';

/**
 * 统一存储接口。
 * 约定：值统一以字符串形式存取（业务层自行 JSON.stringify / JSON.parse），
 * 与原 localStorage 行为保持一致；读取不到时返回 null。
 */
export const storage = {
  /**
   * 读取字符串值，不存在返回 null
   */
  getItem(key: string): string | null {
    try {
      const value = Taro.getStorageSync(key);
      // Taro.getStorageSync 在 key 不存在时返回 ''，统一归一化为 null
      if (value === '' || value === undefined || value === null) {
        return null;
      }
      return typeof value === 'string' ? value : JSON.stringify(value);
    } catch {
      return null;
    }
  },

  /**
   * 写入字符串值
   */
  setItem(key: string, value: string): void {
    try {
      Taro.setStorageSync(key, value);
    } catch (error) {
      console.error('[storageAdapter] 写入失败:', key, error);
    }
  },

  /**
   * 删除指定 key
   */
  removeItem(key: string): void {
    try {
      Taro.removeStorageSync(key);
    } catch (error) {
      console.error('[storageAdapter] 删除失败:', key, error);
    }
  }
};

export default storage;
