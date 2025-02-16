import { createStore } from "vuex";
import { ChatState } from "./chat";
import { UserState } from "./user";

const state = {
  ...UserState,
  ...ChatState,
};

const mutations = {
  /** @param {state} state */
  SET_USER_LOGIN_INFO(state, data) {
    state.setUserLoginInfo(data);
  },

  /** @param {state} state */
  SET_LOGIN_STATE(state, data) {
    state.setIsLoggedIn(data);
  },

  /** @param {state} state */
  SET_CHAT_MODELS(state, data) {
    state.setChatModels(data);
  },

  /** @param {state} state */
  SET_CUR_CHAT_MODEL(state, data) {
    state.setCurChatModel(data);
  },

  /** @param {state} state */
  SET_CHAT_INS_TEMPLATE_LIST(state, data) {
    state.setChatInsTemplateList(data);
  },

  /** @param {state} state */
  SET_CURRENT_CHAT_MODEL_SETTINGS(state, data) {
    state.setCurChatModelSettings(data);
  },

  /** @param {state} state */
  RESET_CHAT_LIST(state, data) {
    state.resetChatList(data);
  },

  /** @param {state} state */
  SET_CURRENT_CHAT_ID(state, data) {
    state.setCurChatId(data);
  },

  /** @param {state} state */
  PUSH_MESSAGES(state, data) {
    state.pushMessages(data);
  },

  /** @param {state} state */
  SPLICE_MESSAGES(state, index) {
    state.spliceMessages(index);
  },

  /** @param {state} state */
  RESET_MESSAGES(state) {
    state.resetMessages();
  },
};

const actions = {
  async login({ commit }, username, password = "", uid = "") {
    commit("SET_USER_LOGIN_INFO", { username, password, uid });
    commit("SET_LOGIN_STATE", true);
  },

  async setChatModels({ commit }, chatModels) {
    commit("SET_CHAT_MODELS", chatModels);
  },

  async setCurChatModel({ commit }, model) {
    commit("SET_CUR_CHAT_MODEL", model);
  },

  async setChatInsTemplateList({ commit }, data) {
    commit("SET_CHAT_INS_TEMPLATE_LIST", data);
  },

  async setCurChatModelSettings({ commit }, data) {
    commit("SET_CURRENT_CHAT_MODEL_SETTINGS", data);
  },

  async resetChatList({ commit }, data) {
    commit("RESET_CHAT_LIST", data);
  },

  async setCurChatId({ commit }, data) {
    commit("SET_CURRENT_CHAT_ID", data);
  },

  async pushMessages({ commit }, data) {
    commit("PUSH_MESSAGES", data);
  },

  async spliceMessages({ commit }, index) {
    commit("SPLICE_MESSAGES", index);
  },

  async resetMessages({ commit }) {
    commit("RESET_MESSAGES");
  },
};

export default createStore({
  state,
  mutations,
  actions,
});
