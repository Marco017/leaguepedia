import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllChampions, getChampionImageUrl } from "../api/dataDragon";

export default function ChampionDetail() {
  const { id } = useParams();
  const [champion, setChampion] = useState(null);

  useEffect(() => {
    getAllChampions().then((list) => {
      const found = list.find((c) => c.id === id);
      setChampion(found || null);
    });
  }, [id]);

  if (!champion) return <p>A carregar...</p>;

  const stats = champion.stats;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <Link to="/">← Voltar</Link>
      <h1>{champion.name}</h1>
      <p style={{ fontStyle: "italic" }}>{champion.title}</p>
      <img
        src={getChampionImageUrl(champion.image.full)}
        alt={champion.name}
        width={120}
        height={120}
        style={{ borderRadius: "8px" }}
      />
      <p style={{ margin: "1rem 0" }}>{champion.blurb}</p>

      <p><strong>Role(s):</strong> {champion.tags.join(", ")}</p>
      <p><strong>Recurso:</strong> {champion.partype || "Nenhum"}</p>

      <h2>Stats base</h2>
      <ul style={{ textAlign: "left" }}>
        <li>HP: {stats.hp}</li>
        <li>Armor: {stats.armor}</li>
        <li>Attack Damage: {stats.attackdamage}</li>
        <li>Move Speed: {stats.movespeed}</li>
        <li>Attack Range: {stats.attackrange}</li>
        <li>Attack Speed: {stats.attackspeed}</li>
      </ul>

      <h2>Info</h2>
      <ul style={{ textAlign: "left" }}>
        <li>Attack: {champion.info.attack}/10</li>
        <li>Defense: {champion.info.defense}/10</li>
        <li>Magic: {champion.info.magic}/10</li>
        <li>Difficulty: {champion.info.difficulty}/10</li>
      </ul>
    </div>
  );
}