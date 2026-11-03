
const API_BASE_URL = "/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from server.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Something went wrong");
  }

  return result;
}

export const getMonuments = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const query = params.toString();

  return request(`/monuments${query ? `?${query}` : ""}`);
};

export const getMonumentById = (id) => {
  if (!id) {
    return Promise.reject(new Error("Monument ID is required."));
  }

  return request(`/monuments/${encodeURIComponent(id)}`);
};

export const getMapData = () => request("/monuments/map-data");

export const searchArchives = (query) =>
  request(`/monuments/search/all?q=${encodeURIComponent(query)}`);

export async function uploadArchiveFile({
  file,
  monumentId,
  title,
  category,
}) {
  const formData = new FormData();
  formData.append("archive_file", file);
  formData.append("monument_id", monumentId);
  formData.append("title", title);
  formData.append("category", category);

  const response = await fetch(`${API_BASE_URL}/monuments/upload`, {
    method: "POST",
    body: formData,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from server.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || "Unable to upload this archive item."
    );
  }

  return result;
}


export const getMonumentImages = (id) =>
  request(`/monuments/${encodeURIComponent(id)}/images`);

export async function uploadMonumentImage({ monumentId, file, title }) {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("title", title || file.name);

  const response = await fetch(
    `${API_BASE_URL}/monuments/${encodeURIComponent(monumentId)}/images`,
    {
      method: "POST",
      body: formData,
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from server.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Image upload failed.");
  }

  return result;
}
