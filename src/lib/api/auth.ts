import api from "@/lib/api";
import type { LoginRequest, RegisterRequest } from "@/types/auth";
import type { MeResponse } from "@/types/member";

export async function registerMember(payload: RegisterRequest): Promise<void> {
  await api.post("/auth/register", payload);
}

export async function loginMember(payload: LoginRequest): Promise<void> {
  await api.post("/auth/login", payload);
}

export async function getMyMember(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me");
  return res.data;
}

export async function logoutMember(): Promise<void> {
  await api.post("/auth/logout");
}