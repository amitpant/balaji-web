// Thin fetch wrapper for the API (same origin: /api is routed to the balaji-api Worker).

export class ApiError extends Error {
  constructor(status, error = {}) {
    super(error.message || 'Something went wrong');
    this.status = status;
    this.code = error.code;
    this.fields = error.fields || {};
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, { code: 'NETWORK', message: 'No internet connection' });
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error);
  return data;
}

// Uploads one image straight to Cloudinary using a signature from our API.
export async function uploadImage(file, folder = 'projects') {
  const { uploadUrl, fields } = await api('/admin/uploads/sign', { method: 'POST', body: { folder } });
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);
  const res = await fetch(uploadUrl, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, { message: data.error?.message || 'Upload failed' });
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height };
}
