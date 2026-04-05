import client from "./client";
import type { User } from "../types";

export const authApi = {
  requestCode: (phone: string) =>
    client.post<{ message: string; phone: string }>("/auth/request_code", { phone }),

  verifyCode: (phone: string, code: string) =>
    client.post<{
      token?: string;
      user?: User;
      is_new_user: boolean;
      phone?: string;
    }>("/auth/verify_code", { phone, code }),

  register: (data: {
    user: {
      phone: string;
      password: string;
      nickname: string;
      gender: string;
      birth_year: number;
      region: string;
      occupation: string;
      desired_marriage_timing: string;
    };
    invite_code?: string;
    payment_token?: string;
    is_seed?: boolean;
  }) => client.post<{ token: string; user: User }>("/auth/register", data),

  me: () => client.get<{ user: User }>("/auth/me"),
  deactivate: () => client.put("/auth/deactivate"),
  reactivate: () => client.put("/auth/reactivate"),
};
