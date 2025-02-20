import { OpenAI } from "openai";

export class DeepSeekClient {
  constructor(baseURL, apiKey, model) {
    this.init(baseURL, apiKey, model);
  }

  init(baseURL, apiKey, model) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.model = model;
    this.client = null;

    if (apiKey) this.client = new OpenAI({ baseURL: baseURL, apiKey: apiKey, dangerouslyAllowBrowser: true });
  }

  update(baseURL, apiKey, model) {
    if (baseURL !== this.baseURL || apiKey !== this.apiKey || model !== this.model) {
      this.init(baseURL, apiKey, model);
    }
  }

  destroy() {
    this.baseURL = "";
    this.apiKey = "";
    this.model = "";
    this.client = null;
  }

  /**
   * 处理对话模型的输入的消息并返回流式响应，并支持回调
   * @param {Array<{role: string, content: string}>} message - 输入的消息数组，每个对象包含 `role` 和 `content`
   * @returns {string} 处理后的流内容
   */
  async *chatStream(messages, params) {
    if (this.client == null) {
      yield "模型初始化失败, 无法向服务器发送消息.";
      return;
    }

    try {
      const results = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        ...params,
      });

      let thinkingOver = true;

      for await (const chunk of results) {
        if (!chunk.choices[0]?.delta?.reasoning_content) {
          if (!thinkingOver && chunk.choices[0]?.delta?.content) {
            thinkingOver = true;
            yield `\n --- \n`;
          }
        } else {
          if (thinkingOver) {
            thinkingOver = false;
            yield `> ${chunk.choices[0]?.delta?.reasoning_content}`;
          } else if (chunk.choices[0]?.delta?.reasoning_content?.includes("\n\n")) {
            yield chunk.choices[0]?.delta?.reasoning_content?.replace(/\n\n/g, "\n> ");
          } else {
            yield chunk.choices[0]?.delta?.reasoning_content;
          }
        }

        if (chunk.choices[0]?.delta?.content !== null) {
          yield chunk.choices[0]?.delta?.content;
        }
      }
    } catch (err) {
      yield String(err);
      return;
    }
  }

  /**
   * 处理对话模型输入的消息并返回流式响应，并支持回调
   * @param {Array<{role: string, content: string}>} messages - 输入的消息数组，每个对象包含 `role` 和 `content`
   * @param {function(string): Promise<void> | function(string): void} [callback=null] - 用于处理流响应的回调函数。每次接收到新的响应内容时，都会调用该回调，并将其作为参数传递给回调函数。如果提供回调，返回的流将逐步发送给回调（可选，默认值 `null`）。
   * @returns {Promise<void>} - 处理完成后返回 `Promise<void>`
   * @example
   * const client = new OpenAIClient("OpenAI", "https://xxx", "xxx", "gpt-4o-mini");
   * const messages = [{ role: "user", content: "Hello!" }];
   *
   * await client.chat(messages, params={}, callback = async (response) => {
   *   console.log("AI:", response);
   * });
   */
  async chat(data, params = {}, callback = null) {
    // deepseek 的对话协议还是v1版本的 需要额外处理
    const messages = data.map((item) => ({ role: item.role, content: item.content[0].text }));
    for await (const response of this.chatStream(messages, { ...params, stream: true })) {
      if (callback) await callback(response);
    }
  }

  /**
   * 生成图片
   * @param {string} prompt - 图片生成的提示词
   * @param {string} size - 图片尺寸
   * @param {number} n - 生成图片的数量
   * @returns {Promise<Array<{ type: string, data: string }>>} 返回包含图片 URL 或错误信息的数组
   */
  async generateImage(prompt, size, n) {
    if (this.client == null) {
      return [{ type: "text", data: "模型无效" }];
    }

    try {
      const res = await this.client.images.generate({ model: this.model, prompt: prompt, size: size, n: n });
      const urls = res.data.map((item) => ({ type: "url", data: item.url }));
      return urls;
    } catch (err) {
      return [{ type: "text", data: String(err) }];
    }
  }
}
