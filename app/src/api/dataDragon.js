export const VERSION = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
  .then((res) => res.json())
  .then((versions) => versions[0]);
const BASE = `https://ddragon.leagueoflegends.com/cdn/${VERSION}`;

export async function getAllChampions() {
  const res = await fetch(`${BASE}/data/en_US/champion.json`); // pt_BR ou en_US
  const data = await res.json();
  return Object.values(data.data);
}
export async function getChampionById(id) {
  const res = await fetch(`${BASE}/data/en_US/champion/${id}.json`);
  if (!res.ok) throw new Error("Champion not found");
  const data = await res.json();
  return data.data[id];
}

export function getChampionImageUrl(imageFull) {
  return `${BASE}/img/champion/${imageFull}`;
}
export function getChampionSplashUrl(championId) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
}
