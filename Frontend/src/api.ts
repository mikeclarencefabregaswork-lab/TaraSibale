import { toast } from "./toastStore";

/** Shared by normal mutations and page-exit saves so owner binding cannot drift. */
export function jsonRequest(
  body: unknown,
  method = "POST",
  expectedUserId?: string,
): RequestInit {
  return {
    credentials: "same-origin",
    method,
    headers: {
      "Content-Type": "application/json",
      ...(expectedUserId ? { "X-TaraSibale-User-Id": expectedUserId } : {}),
    },
    body: JSON.stringify(body),
  };
}

export async function api<T>(
  path: string,
  body?: unknown,
  method = "POST",
  expectedUserId?: string,
): Promise<T> {
  try {
    const response = await fetch(
      path,
      body === undefined
        ? { credentials: "same-origin" }
        : jsonRequest(body, method, expectedUserId),
    );
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(
        data?.error ||
          data?.message ||
          `Request failed (${response.status}). Please try again.`,
      );
    }
    return response.status === 204 ? (undefined as T) : await response.json();
  } catch (error) {
    toast.error(errorText(error));
    throw error;
  }
}
export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to save. Please try again.";
