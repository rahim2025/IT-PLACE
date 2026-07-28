const JSON_HEADERS = { "Content-Type": "application/json" };

class ApiError extends Error {
  constructor(message, status, fieldErrors, code) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || null;
    this.code = code || null;
  }
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(body?.error || "Something went wrong. Please try again.", res.status, body?.fieldErrors, body?.code);
  }
  return body;
}

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: isFormData ? undefined : JSON_HEADERS,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  return parseResponse(res);
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  patch: (path, body, opts) => request(path, { method: "PATCH", body, ...opts }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export { ApiError };
