
const API_BASE_URL = "/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export const getMonuments = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();

  return request(`/monuments${query ? `?${query}` : ""}`);
};

export const getMapData = () => request("/monuments/map-data");

export const searchArchives = (query) =>
  request(`/monuments/search/all?q=${encodeURIComponent(query)}`);
