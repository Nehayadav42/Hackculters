
import { supabase } from "../lib/supabase.js";

const API_BASE_URL = "/api/v1";

async function getAuthorizationHeader() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Unable to verify your sign-in session: ${error.message}`);
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Please sign in before using this archive feature.");
  }

  return { Authorization: `Bearer ${token}` };
}

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

export async function chatWithArchive({ monumentId, question }) {
  const authorization = await getAuthorizationHeader();
  return request("/ai/chat", {
    method: "POST",
    headers: authorization,
    body: JSON.stringify({ monumentId, question }),
  });
}

export async function summarizeDocument({ documentId }) {
  const authorization = await getAuthorizationHeader();
  return request("/ai/summarize", {
    method: "POST",
    headers: authorization,
    body: JSON.stringify({ documentId }),
  });
}

export async function uploadArchiveFile({
  file,
  monumentId,
  title,
  category,
}) {
  const authorization = await getAuthorizationHeader();
  const formData = new FormData();
  formData.append("archive_file", file);
  formData.append("monument_id", monumentId);
  formData.append("title", title);
  formData.append("category", category);

  const response = await fetch(`${API_BASE_URL}/monuments/upload`, {
    method: "POST",
    headers: authorization,
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
  const authorization = await getAuthorizationHeader();
  const formData = new FormData();

  formData.append("image", file);
  formData.append("title", title || file.name);

  const response = await fetch(
    `${API_BASE_URL}/monuments/${encodeURIComponent(monumentId)}/images`,
    {
      method: "POST",
      headers: authorization,
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

export async function processOcrDocument({
  file,
  sourceLanguage,
  targetLanguage,
  documentType,
  monumentId,
}) {
  const authorization = await getAuthorizationHeader();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source_language", sourceLanguage);
  formData.append("output_language", targetLanguage);
  formData.append("document_type", documentType);

  if (monumentId) {
    formData.append("site_id", monumentId);
  }

  const response = await fetch(`${API_BASE_URL}/ai/ocr`, {
    method: "POST",
    headers: authorization,
    body: formData,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response received from server.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "OCR processing failed.");
  }

  return result;
}
