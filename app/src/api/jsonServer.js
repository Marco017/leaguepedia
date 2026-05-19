const BASE = "http://localhost:3000";

/**
 * Fetch a paginated + filtered page of champions from json-server.
 *
 * json-server v1 (beta) filter syntax:
 *   field:contains=value   →  case-insensitive substring match
 *   field:eq=value         →  exact match
 *   _page=N&_per_page=N    →  pagination  (response: { data, first, prev, next, last, pages, items })
 */
export async function getChampions({ name = "", tag = "", partype = "", page = 1, perPage = 20 } = {}) {
  const params = new URLSearchParams();

  if (name)    params.append("name:contains", name);
  if (tag)     params.append("tags:contains", tag);
  if (partype) params.append("partype:eq", partype);

  params.append("_page", page);
  params.append("_per_page", perPage);

  const res = await fetch(`${BASE}/champions?${params}`);
  if (!res.ok) throw new Error("Error loading champions");

  // json-server v1 returns { data, pages, items, ... } when paginated
  const json = await res.json();

  // Normalise: if the server returned a pagination envelope use it,
  // otherwise fall back to treating the response as a plain array.
  if (json && typeof json === "object" && Array.isArray(json.data)) {
    return {
      data: json.data,
      pages: json.pages ?? 1,
      total: json.items ?? json.data.length,
    };
  }

  // Fallback for plain arrays (safety net)
  const arr = Array.isArray(json) ? json : [];
  return { data: arr, pages: 1, total: arr.length };
}

export async function getChampionById(id) {
  const res = await fetch(`${BASE}/champions/${id}`);
  if (!res.ok) throw new Error("Champion not found");
  return res.json();
}

export async function createChampion(champion) {
  const res = await fetch(`${BASE}/champions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(champion),
  });
  if (!res.ok) throw new Error("Error creating champion");
  return res.json();
}

export async function updateChampion(id, champion) {
  const res = await fetch(`${BASE}/champions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(champion),
  });
  if (!res.ok) throw new Error("Error updating champion");
  return res.json();
}

export async function deleteChampion(id) {
  const res = await fetch(`${BASE}/champions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting champion");
  return res.json();
}