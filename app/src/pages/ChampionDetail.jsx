import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getChampionById, getChampionSplashUrl } from "../api/dataDragon";

export default function ChampionDetail() {
  const { id } = useParams();
  const [champion, setChampion] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getChampionById(id)
      .then(setChampion)
      .catch(() => setError("Champion not found."));
  }, [id]);

  if (error)    return <p className="error-msg" style={{ margin: "2rem" }}>{error}</p>;
  if (!champion) return <p className="loading-msg">Loading…</p>;

  const { stats } = champion;

  return (
    <div className="page">
      <Link to="/" className="detail-back">← Back to Champions</Link>

      <div
        className="detail-splash"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${getChampionSplashUrl(champion.id)})`,
        }}
      >
        <h1 style={{ margin: "0 0 4px" }}>{champion.name}</h1>
        <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>{champion.title}</p>
        <p style={{ marginBottom: "1rem" }}>{champion.lore ?? champion.blurb}</p>
        <p><strong>Role(s):</strong> {champion.tags.join(", ")}</p>
        <p><strong>Resource:</strong> {champion.partype || "None"}</p>
      </div>

      <hr />

      <h2>Info</h2>
      <ul className="detail-stats-list">
        <li>Attack: {champion.info.attack}/10</li>
        <li>Defense: {champion.info.defense}/10</li>
        <li>Magic: {champion.info.magic}/10</li>
        <li>Difficulty: {champion.info.difficulty}/10</li>
      </ul>

      <hr />

      <h2>Base Stats</h2>
      <ul className="detail-stats-list">
        <li>Health: {stats.hp}</li>
        <li>Health per level: {stats.hpperlevel}</li>
        <li>Mana: {stats.mp}</li>
        <li>Mana per level: {stats.mpperlevel}</li>
        <li>Move Speed: {stats.movespeed}</li>
        <li>Armor: {stats.armor}</li>
        <li>Armor per level: {stats.armorperlevel}</li>
        <li>Magic Resist: {stats.spellblock}</li>
        <li>Magic Resist per level: {stats.spellblockperlevel}</li>
        <li>Attack Range: {stats.attackrange}</li>
        <li>HP Regeneration: {stats.hpregen}</li>
        <li>HP Regeneration per level: {stats.hpregenperlevel}</li>
        <li>Mana Regeneration: {stats.mpregen}</li>
        <li>Mana Regeneration per level: {stats.mpregenperlevel}</li>
        <li>Critical Strike Chance: {stats.crit}%</li>
        <li>Critical Strike Chance per level: {stats.critperlevel}%</li>
        <li>Attack Damage: {stats.attackdamage}</li>
        <li>Attack Damage per level: {stats.attackdamageperlevel}</li>
        <li>Attack Speed: {stats.attackspeed}</li>
        <li>Attack Speed per level: {stats.attackspeedperlevel}%</li>
      </ul>
    </div>
  );
}