import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getChampionById, getChampionImageUrl, getChampionSplashUrl } from "../api/dataDragon";

export default function ChampionDetail() {
  const { id } = useParams();
  const [champion, setChampion] = useState(null);
  
  useEffect(() => {
    getChampionById(id).then((champ) => {
      setChampion(champ);
      console.log(champ)
    });
  }, [id]);
  if (!champion) return <p>Loading...</p>;

  const stats = champion.stats;

  return (
    <div>
      <Link to="/">← Back</Link>
      <div style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(${getChampionSplashUrl(champion.id)})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", padding: "2rem", borderRadius: "2px", color: "white", textShadow: "1px 1px black", backgroundPosition: "center"}}>
        <h1>{champion.name}</h1>
        <p style={{ fontStyle: "italic" }}>{champion.title}</p>
        <p style={{ margin: "1rem 0" }}>{champion?.lore || champion.blurb}</p>

        <p><strong>Role(s):</strong> {champion.tags.join(", ")}</p>
        <p><strong>Resource:</strong> {champion.partype || "None"}</p>
      </div>
      <hr/>
      <h2>Info</h2>
      <ul style={{ textAlign: "left" }}>
        <li>Attack: {champion.info.attack}/10</li>
        <li>Defense: {champion.info.defense}/10</li>
        <li>Magic: {champion.info.magic}/10</li>
        <li>Difficulty: {champion.info.difficulty}/10</li>
      </ul>
      <hr/>
      <h2>Base stats</h2>
      <ul style={{ textAlign: "left" }}>
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