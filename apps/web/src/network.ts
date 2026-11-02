interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  data?: unknown;
  timeout?: number;
}

export const Network = {
  async request({ url, method = 'GET', data, timeout = 45000 }: RequestOptions) {
    const base = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(`${base}${url}`, {
        method,
        headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: data === undefined ? undefined : JSON.stringify(data),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`服务暂不可用（${response.status}）`);
      const payload = await response.json();
      if (payload?.code && payload.code !== 200) throw new Error('服务暂未完成请求，请稍后再试。');
      return { data: payload };
    } finally {
      clearTimeout(timer);
    }
  }
};
