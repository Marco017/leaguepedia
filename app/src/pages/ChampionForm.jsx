import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChampionById, createChampion, updateChampion } from "../api/jsonServer";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];
const PARTYPES = ["Mana", "Energy", "Fury", "Rage", "Flow", "Heat", "Ferocity", "Courage", "Grit", "None", ""];

const emptyForm = {
  id: "",
  key: "",
  name: "",
  title: "",
  blurb: "",
  tags: [],
  partype: "Mana",
  info: { attack: 5, defense: 5, magic: 5, difficulty: 5 },
  image: { full: "", sprite: "", group: "champion", x: 0, y: 0, w: 48, h: 48 },
  stats: {
    hp: 0, hpperlevel: 0, mp: 0, mpperlevel: 0, movespeed: 0, armor: 0, armorperlevel: 0,
    spellblock: 0, spellblockperlevel: 0, attackrange: 0, hpregen: 0, hpregenperlevel: 0,
    mpregen: 0, mpregenperlevel: 0, crit: 0, critperlevel: 0, attackdamage: 0, attackdamageperlevel: 0,
    attackspeed: 0, attackspeedperlevel: 0
  },
};
const statFields = [
  ["hp", "HP"],
  ["hpperlevel", "HP por nível"],
  ["mp", "Mana"],
  ["mpperlevel", "Mana por nível"],
  ["movespeed", "Move Speed"], 
  ["armor", "Armor"], 
  ["armorperlevel", "Armor por nível"],
  ["spellblock", "Spell Block"],
  ["spellblockperlevel", "Spell Block por nível"],
  ["attackrange", "Attack Range"],
  ["hpregen", "HP Regeneration"],
  ["hpregenperlevel", "HP Regeneration por nível"],
  ["mpregen", "Mana Regeneration"],
  ["mpregenperlevel", "Mana Regeneration por nível"],
  ["crit", "Critical Strike Chance"],
  ["critperlevel", "Critical Strike Chance por nível"],
  ["attackdamage", "Attack Damage"],
  ["attackdamageperlevel", "Attack Damage por nível"],
  ["attackspeed", "Attack Speed"],
  ["attackspeedperlevel", "Attack Speed por nível"]
];

export default function ChampionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getChampionById(id)
      .then(setForm)
      .catch(() => setError("Champion não encontrado"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await updateChampion(id, form);
      } else {
        await createChampion({ ...form, version: "16.8.1" });
      }
      navigate("/admin");
    } catch {
      setError("Erro ao guardar. Verifica se o JSON Server está a correr.");
    }
  };

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  };

  if (loading) return <p>A carregar...</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>{isEdit ? `Editar ${form.name}` : "Novo Champion"}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        
        <label>ID: <input required value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} disabled={isEdit} />
        </label>

        <label>Key: <input required value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} />
        </label>

        <label>Nome: <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </label>

        <label>Título: <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </label>

        <label>Descrição (blurb): <br/><textarea rows={5} value={form.blurb} onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))} />
        </label>

        <label>Recurso (partype): <select value={form.partype} onChange={(e) => setForm((f) => ({ ...f, partype: e.target.value }))}>
            {PARTYPES.map((p) => <option key={p} value={p}>{p || "Nenhum"}</option>)}
          </select>
        </label>

        <fieldset>
          <legend>Roles</legend>
          {ROLES.map((r) => (
            <label key={r} style={{ marginRight: "12px" }}>
              {r}<input
                type="checkbox"
                checked={form.tags.includes(r)}
                onChange={() => toggleTag(r)}
              /> 
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Info (0-10)</legend>
          {["attack", "defense", "magic", "difficulty"].map((stat) => (
            <label key={stat} style={{ display: "block" }}>
              {stat.charAt(0).toUpperCase() + stat.slice(1)}: {form.info[stat]}
              <input
                type="range" min={0} max={10}
                value={form.info[stat]}
                onChange={(e) => setForm((f) => ({ ...f, info: { ...f.info, [stat]: Number(e.target.value) } }))}
              />
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Stats principais</legend>
          {statFields.map(([key, label]) => (
            <label key={key} style={{ display: "block", marginBottom: "3px" }}>
              {label}: <br/><input
                type="number"
                value={form.stats[key]}
                onChange={(e) => setForm((f) => ({ ...f, stats: { ...f.stats, [key]: Number(e.target.value) } }))}
              />
            </label>
          ))}
        </fieldset>

        <div style={{ display: "flex", gap: "12px" }}>
          <button type="submit">{isEdit ? "Guardar" : "Criar"}</button>
          <button type="button" onClick={() => navigate("/admin")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}