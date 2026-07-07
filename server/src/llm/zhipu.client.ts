// 智谱 AI（BigModel / GLM）LLM 客户端
// 替换原扣子 coze-coding-dev-sdk 的 LLMClient，保持 invoke(messages, options) 接口一致，
// 业务层（chat / bazi-analysis）几乎无需改动。
//
// 凭证与模型经环境变量配置（server/.env）：
//   ZHIPU_API_KEY   必填，智谱开放平台的 API Key
//   ZHIPU_MODEL     选填，默认 glm-4.5-air
//   ZHIPU_BASE_URL  选填，默认官方 v4 chat/completions 地址
//
// 智谱 v4 接口为 OpenAI 兼容格式，直接用 API Key 作 Bearer 即可。

export interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InvokeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface InvokeResult {
  content: string;
}

const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const DEFAULT_MODEL = 'glm-4.5-air';

export class ZhipuClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY || '';
    this.baseUrl = process.env.ZHIPU_BASE_URL || DEFAULT_BASE_URL;
    this.defaultModel = process.env.ZHIPU_MODEL || DEFAULT_MODEL;
  }

  /**
   * 调用智谱对话补全接口
   * @returns { content } 与原扣子 SDK 返回结构一致
   */
  async invoke(messages: ZhipuMessage[], options: InvokeOptions = {}): Promise<InvokeResult> {
    if (!this.apiKey) {
      throw new Error('缺少环境变量 ZHIPU_API_KEY，请在 server/.env 中配置智谱 API Key');
    }

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.8,
        // 默认放宽到 4096，避免长文（深度命理 900-1400 字）被截断
        max_tokens: options.maxTokens ?? 4096,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`智谱 API 调用失败 ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data: any = await res.json();
    // OpenAI 兼容结构；部分带思考的模型会把正文放 content，思考放 reasoning_content
    const msg = data?.choices?.[0]?.message;
    const content: string | undefined = msg?.content || msg?.reasoning_content;

    if (!content) {
      throw new Error('智谱 API 返回内容为空');
    }

    return { content };
  }
}
