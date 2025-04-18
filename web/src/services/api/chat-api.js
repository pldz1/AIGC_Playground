import store from "@/store";
import { apiRequest, dsAlert, isValidChatInfoArray, getUuid, generateRandomCname } from "@/utils";

/**
 * 对话列表元素类型
 * @typedef {Object} ChatInfo
 * @property {string} cid - 对话的id
 * @property {string} cname - 对话的名称
 */

/**
 * 获取全部的对话列表
 * @return {Promise<{ flag: boolean, log: string, data:ChatInfo[] }>} 服务器返回的结果
 */
export const getChatListAPI = (username) => apiRequest("post", "/api/v1/chat/getChatList", { username });

/**
 * 获取对话的模型设置参数
 * @return {Promise<{ flag: boolean, log: string, data:string }>} 服务器返回的结果
 */
export const getChatSettingsAPI = (username, cid) => apiRequest("post", "/api/v1/chat/getChatSettings", { username, cid });

/**
 * 设置对话的模型设置参数
 * @return {Promise<{ flag: boolean, log: string }>} 服务器返回的结果
 */
export const setChatSettingsAPI = (username, cid, data) => apiRequest("post", "/api/v1/chat/setChatSettings", { username, cid, data });

/**
 * 新增对话请求
 * @return {Promise<{ flag: boolean, log: string }>} 服务器返回的结果
 */
export const addChatAPI = (username, cid, cname) => apiRequest("post", "/api/v1/chat/addChat", { username, cid, cname });

/**
 * 删除对话
 * @return {Promise<{ flag: boolean, log: string }>} 服务器返回的结果
 */
export const deleteChatAPI = (username, cid) => apiRequest("post", "/api/v1/chat/deleteChat", { username, cid });

/**
 * 重命名对话
 * @return {Promise<{ flag: boolean, log: string }>} 服务器返回的结果
 */
export const renameChatAPI = (username, cid, cname) => apiRequest("post", "/api/v1/chat/renameChat", { username, cid, cname });

/**
 * 获得全部消息内容
 * @return {Promise<{ flag: boolean, log: string, data: any[]}>} 服务器返回的结果
 */
export const getAllMessageAPI = (username, cid) => apiRequest("post", "/api/v1/chat/getAllMessage", { username, cid });

/**
 * 新增消息
 * @return {Promise<{ flag: boolean, log: string }>} 服务器返回的结果
 */
export const addMessageAPI = (username, cid, mid, message) => apiRequest("post", "/api/v1/chat/addMessage", { username, cid, mid, message });

/**
 * 删除对话
 * @return {Promise<{ flag: boolean, log: string }>} 服务器返回的结果
 */
export const deleteMessageAPI = (username, cid, mid) => apiRequest("post", "/api/v1/chat/deleteMessage", { username, cid, mid });

/**
 * 获得全部对话历史
 */
export async function getChatList() {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  const res = await getChatListAPI(username);
  if (!res.flag) {
    await store.dispatch("resetChatList", []);
    dsAlert({ type: "error", message: `Get chat list failed: ${res.log}` });
    return false;
  } else {
    const isValidData = isValidChatInfoArray(res.data);
    if (isValidData) {
      await store.dispatch("resetChatList", res.data);
      return true;
    } else {
      await store.dispatch("resetChatList", []);
      dsAlert({ type: "error", message: `chat list is valid!` });
      return false;
    }
  }
}

/**
 * 获得对话对于模型参数的设置
 * @return {Promise<boolean}>} 操作的结果
 */
export async function getChatSettings() {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  const cid = store.state.curChatId;

  if (!isLoggedIn || !username || !cid) return false;

  const res = await getChatSettingsAPI(username, cid);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Get current chat settings failed: ${res.log}` });
    return false;
  } else {
    const validData = JSON.parse(res.data);
    await store.dispatch("setCurChatModelSettings", validData);
    return true;
  }
}

/**
 * 设置对话的模型参数
 * @return {Promise<boolean}>} 操作的结果
 */
export async function setChatSettings() {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  const cid = store.state.curChatId;

  if (!isLoggedIn || !username || !cid) return false;

  const curChatModelSettings = store.state.curChatModelSettings;
  const data = JSON.stringify(curChatModelSettings);

  const res = await setChatSettingsAPI(username, cid, data);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Set current chat settings failed: ${res.log}` });
    return false;
  }

  return true;
}

/**
 * 新增对话
 * @return {Promise<boolean}>} 操作的结果
 */
export async function addChat(name = null) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  const cid = getUuid("chat");
  const cname = name ? name : generateRandomCname();

  const res = await addChatAPI(username, cid, cname);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Add chat failed: ${res.log}` });
    return false;
  }

  const chatList = [...store.state.chatList];
  chatList.push({ cid, cname });
  await store.dispatch("resetChatList", chatList);

  await store.dispatch("setCurChatId", cid);

  // 同时设置对话的模型的设置
  await setChatSettings();
  return true;
}

/**
 * 删除对话
 * @return {Promise<boolean>} 操作的结果
 */
export async function deleteChat(cid) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  const res = await deleteChatAPI(username, cid);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Delete chat failed: ${res.log}` });
    return false;
  }

  const chatList = [...store.state.chatList];
  const index = chatList.findIndex((chat) => chat.cid === cid);
  if (index >= 0) chatList.splice(index, 1);
  await store.dispatch("resetChatList", chatList);
  return true;
}

/**
 * 重命名对话
 * @return {Promise<boolean>} 操作的结果
 */
export async function renameChat(cid, cname) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  if (!isLoggedIn || !username) return false;

  const res = await renameChatAPI(username, cid, cname);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Rename chat failed: ${res.log}` });
    return false;
  }

  const chatList = [...store.state.chatList];
  const index = chatList.findIndex((chat) => chat.cid === cid);
  if (index >= 0) chatList[index].cname = cname;
  await store.dispatch("resetChatList", chatList);
  return true;
}

/**
 * 获得全部消息
 * @return {any[]} 返回数据库的对话数据
 */
export async function getAllMessage(callback) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  const cid = store.state.curChatId;
  if (!isLoggedIn || !username || !cid) return false;

  const res = await getAllMessageAPI(username, cid);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Get all messages list failed: ${res.log}` });
    return [];
  } else {
    for (let index = 0; index < res.data.length; index++) {
      const data = res.data[index];
      const mid = data.mid;
      const strMsg = data.message;
      const message = JSON.parse(strMsg);
      await store.dispatch("pushMessages", message);
      if (callback) {
        callback([{ ...message, mid }]);
      }
    }
    return true;
  }
}

/**
 * 新增消息
 * @return {Promise<boolean>} 操作的结果
 */
export async function addMessage(mid, message) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  const cid = store.state.curChatId;
  if (!isLoggedIn || !username || !cid) return false;

  const msgStr = JSON.stringify(message);
  const res = await addMessageAPI(username, cid, mid, msgStr);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Add message failed: ${res.log}` });
    return false;
  }
  return true;
}

/**
 * 删除消息
 * @return {Promise<boolean>} 操作的结果
 */
export async function deleteMessage(mid) {
  const username = store.state.username;
  const isLoggedIn = store.state.isLoggedIn;
  const cid = store.state.curChatId;
  if (!isLoggedIn || !username || !cid) return false;

  const res = await deleteMessageAPI(username, cid, mid);
  if (!res.flag) {
    dsAlert({ type: "error", message: `Delete message failed: ${res.log}` });
    return false;
  }
  return true;
}
