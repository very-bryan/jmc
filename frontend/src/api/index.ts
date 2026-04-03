import client from "./client";
import type {
  User,
  Post,
  Interest,
  Conversation,
  Message,
  ValueSurvey,
  PreferenceFilter,
} from "../types";

export { authApi } from "./auth";

export const profileApi = {
  get: () => client.get("/profile"),
  update: (data: Partial<User>) => client.put("/profile", { user: data }),
  selfieVerify: () => client.put("/profile/selfie_verify"),
};

export const valueSurveyApi = {
  get: () => client.get("/value_survey"),
  create: (data: Partial<ValueSurvey>) =>
    client.post("/value_survey", { value_survey: data }),
  update: (data: Partial<ValueSurvey>) =>
    client.put("/value_survey", { value_survey: data }),
};

export const preferenceFilterApi = {
  get: () => client.get("/preference_filter"),
  create: (data: Partial<PreferenceFilter>) =>
    client.post("/preference_filter", { preference_filter: data }),
  update: (data: Partial<PreferenceFilter>) =>
    client.put("/preference_filter", { preference_filter: data }),
};

export const feedApi = {
  get: (page = 1) => client.get<{ posts: Post[] }>("/feed", { params: { page } }),
};

export const postApi = {
  list: (page = 1) => client.get("/posts", { params: { page } }),
  get: (id: number) => client.get(`/posts/${id}`),
  create: (data: { content: string; mood_tag?: string; post_images_attributes?: { image_url: string; position: number }[] }) =>
    client.post("/posts", { post: data }),
  delete: (id: number) => client.delete(`/posts/${id}`),
};

export const userApi = {
  get: (id: number) => client.get(`/users/${id}`),
};

export const interestApi = {
  list: (tab: string) => client.get("/interests", { params: { tab } }),
  create: (receiverId: number) =>
    client.post("/interests", { receiver_id: receiverId }),
  accept: (id: number) => client.post(`/interests/${id}/accept`),
  decline: (id: number) => client.post(`/interests/${id}/decline`),
};

export const conversationApi = {
  list: () => client.get<{ conversations: Conversation[] }>("/conversations"),
  get: (id: number) => client.get(`/conversations/${id}`),
  messages: (conversationId: number, page = 1) =>
    client.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`, {
      params: { page },
    }),
  sendMessage: (conversationId: number, content: string) =>
    client.post(`/conversations/${conversationId}/messages`, { content }),
};

export const blockApi = {
  list: () => client.get("/blocks"),
  create: (blockedId: number) => client.post("/blocks", { blocked_id: blockedId }),
  delete: (id: number) => client.delete(`/blocks/${id}`),
};

export const reportApi = {
  create: (data: {
    reported_id: number;
    reportable_type: string;
    reportable_id: number;
    report_type: string;
    reason: string;
  }) => client.post("/reports", data),
};

export const relationshipApi = {
  create: (partnerId: number, type = "dating") =>
    client.post("/relationships", { partner_id: partnerId, relationship_type: type }),
  confirm: (id: number) => client.post(`/relationships/${id}/confirm`),
  end: (id: number) => client.post(`/relationships/${id}/end_relationship`),
};
