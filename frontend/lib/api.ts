import {
  AuthUser,
  ExamResponse,
  LoginResponse,
  MemoryInsights,
  NotificationItem,
  ParentMessage,
  ResultItem,
  StudentAnalytics,
  TeacherAnalytics,
  TrainerPlan,
  UploadResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_V1 = `${API_BASE}/api/v1`;
const GET_CACHE_TTL_MS = 10_000;

type CacheEntry = {
  expiresAt: number;
  payload: unknown;
};

const responseCache = new Map<string, CacheEntry>();
const inflightGetRequests = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function methodOf(init: RequestInit): string {
  return (init.method || "GET").toUpperCase();
}

function shouldCache(init: RequestInit): boolean {
  return methodOf(init) === "GET" && !init.body;
}

function authFromHeaders(headers?: HeadersInit): string {
  if (!headers) return "";
  const source = new Headers(headers);
  return source.get("Authorization") || source.get("authorization") || "";
}

function cacheKey(url: string, init: RequestInit): string {
  return `${methodOf(init)}:${url}:${authFromHeaders(init.headers)}`;
}

export function clearApiCache(): void {
  responseCache.clear();
  inflightGetRequests.clear();
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail || body.message || `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_V1}${path}`;
  const useCache = shouldCache(init);
  const key = cacheKey(url, init);

  if (useCache) {
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as T;
    }

    const inflight = inflightGetRequests.get(key);
    if (inflight) {
      return (await inflight) as T;
    }
  }

  const operation = (async () => {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new ApiError(res.status, await parseErrorMessage(res));
    }

    const payload = (await res.json()) as T;
    if (useCache) {
      responseCache.set(key, { expiresAt: Date.now() + GET_CACHE_TTL_MS, payload });
    }
    return payload;
  })();

  if (!useCache) {
    return operation;
  }

  inflightGetRequests.set(key, operation as Promise<unknown>);
  try {
    return await operation;
  } finally {
    inflightGetRequests.delete(key);
  }
}

function withLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function mergeHeaders(initHeaders?: HeadersInit, extra: Record<string, string> = {}): Record<string, string> {
  const source = new Headers(initHeaders);
  const merged: Record<string, string> = {};
  source.forEach((value, key) => {
    merged[key] = value;
  });

  return { ...merged, ...extra };
}

export async function fetchApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers = mergeHeaders(init.headers, token ? { Authorization: `Bearer ${token}` } : {});

  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = path.startsWith("http") ? path : `${API_V1}${withLeadingSlash(path)}`;
  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }

  if (res.status === 204) {
    return {} as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as T;
  }

  return (await res.json()) as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload = await request<LoginResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  clearApiCache();
  return payload;
}

export async function register(name: string, email: string, password: string, role: string): Promise<AuthUser> {
  const payload = await request<AuthUser>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  clearApiCache();
  return payload;
}

export async function getMyResults(): Promise<ResultItem[]> {
  return request<ResultItem[]>("/student/results", { headers: authHeaders() });
}

export async function getStudentAnalytics(): Promise<StudentAnalytics> {
  return request<StudentAnalytics>("/student/analytics", { headers: authHeaders() });
}

export async function getTeacherAnalytics(examId: number): Promise<TeacherAnalytics> {
  return request<TeacherAnalytics>(`/teacher/analytics/${examId}`, { headers: authHeaders() });
}

export async function getParentMessage(): Promise<ParentMessage> {
  return request<ParentMessage>("/student/parent-message", { headers: authHeaders() });
}

export async function getTrainerPlan(): Promise<TrainerPlan> {
  return request<TrainerPlan>("/student/trainer-plan", { headers: authHeaders() });
}

export async function getMemoryInsights(): Promise<MemoryInsights> {
  return request<MemoryInsights>("/student/memory-insights", { headers: authHeaders() });
}

export async function getNotifications(): Promise<{ notifications: NotificationItem[] }> {
  return request<{ notifications: NotificationItem[] }>("/student/notifications", { headers: authHeaders() });
}

export async function uploadAnswerSheet(examId: number, file: File): Promise<UploadResponse> {
  const token = getToken();
  const formData = new FormData();
  formData.append("exam_id", String(examId));
  formData.append("file", file);

  const res = await fetch(`${API_V1}/student/upload-answer`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  return (await res.json()) as UploadResponse;
}

export async function createExam(subject: string): Promise<ExamResponse> {
  return request<ExamResponse>("/teacher/exams", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ subject }),
  });
}

export async function downloadReport(examId: number): Promise<void> {
  if (typeof window === "undefined") return;

  const res = await fetch(`${API_V1}/teacher/report/${examId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `exam_${examId}_report.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function me(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me", { headers: authHeaders() });
}

export async function getTeacherResults(): Promise<ResultItem[]> {
  return request<ResultItem[]>("/teacher/results", { headers: authHeaders() });
}

export async function getStudentResults(): Promise<ResultItem[]> {
  return getMyResults();
}

export async function getStudentFeedback(examId: number): Promise<ResultItem> {
  return request<ResultItem>(`/student/feedback/${examId}`, { headers: authHeaders() });
}

export async function getStudentTrainerPlan(): Promise<TrainerPlan> {
  return getTrainerPlan();
}

export async function getStudentNotifications(): Promise<{ notifications: NotificationItem[] }> {
  return getNotifications();
}

export async function uploadTeacherFile(payload: { examId?: number; type: string; file: File }): Promise<UploadResponse> {
  const token = getToken();
  const formData = new FormData();
  if (payload.examId) formData.append("exam_id", String(payload.examId));
  formData.append("type", payload.type);
  formData.append("file", payload.file);

  const res = await fetch(`${API_V1}/teacher/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  return (await res.json()) as UploadResponse;
}

export async function uploadStudentAnswer(payload: { examId: number; file: File }): Promise<UploadResponse> {
  return uploadAnswerSheet(payload.examId, payload.file);
}

export function getTeacherReportUrl(examId: number): string {
  return `${API_V1}/teacher/report/${examId}`;
}
