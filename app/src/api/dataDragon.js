const VERSION = "16.9.1";
const BASE = `https://ddragon.leagueoflegends.com/cdn/${VERSION}`;

export async function getAllChampions() {
  const res = await fetch(`${BASE}/data/en_US/champion.json`);
  const data = await res.json();
  return Object.values(data.data);
}

export function getChampionImageUrl(imageFull) {
  return `${BASE}/img/champion/${imageFull}`;
}