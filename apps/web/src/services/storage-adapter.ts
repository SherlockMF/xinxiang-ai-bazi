// 独立命名空间避免同域部署时覆盖原 H5 应用的数据。
const PREFIX = 'xinxiang_web:';

export const storage = {
  getItem(key: string): string | null {
    return globalThis.localStorage.getItem(PREFIX + key);
  },
  setItem(key: string, value: string): void {
    try {
      globalThis.localStorage.setItem(PREFIX + key, value);
    } catch {
      throw new Error('浏览器无法保存数据，请检查存储权限或可用空间。');
    }
  },
  removeItem(key: string): void {
    globalThis.localStorage.removeItem(PREFIX + key);
  }
};
