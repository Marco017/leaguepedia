const BASE = "http://localhost:3000";

export async function getChampions({ name, tag, partype } = {}) {
  const params = new URLSearchParams();
  if (name)    params.append("name_like", name);
  if (tag)     params.append("tags", tag);
  if (partype) params.append("partype", partype);

  const res = await fetch(`${BASE}/champions?${params}`);
  if (!res.ok) throw new Error("Erro ao carregar champions");
  return res.json();
}

export async function getChampionById(id) {
  const res = await fetch(`${BASE}/champions/${id}`);
  if (!res.ok) throw new Error("Champion não encontrado");
  return res.json();
}

export async function createChampion(champion) {
  const res = await fetch(`${BASE}/champions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(champion),
  });
  if (!res.ok) throw new Error("Erro ao criar champion");
  return res.json();
}

export async function updateChampion(id, champion) {
  const res = await fetch(`${BASE}/champions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(champion),
  });
  if (!res.ok) throw new Error("Erro ao atualizar champion");
  return res.json();
}

export async function deleteChampion(id) {
  const res = await fetch(`${BASE}/champions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao eliminar champion");
  return res.json();
}