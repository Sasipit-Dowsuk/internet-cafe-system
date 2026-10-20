
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "เกิดข้อผิดพลาดในการเรียก API");
  }

  return data;
}
