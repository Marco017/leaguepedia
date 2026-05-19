import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChampionById, createChampion, updateChampion } from "../api/jsonServer";
import { VERSION } from "../api/dataDragon";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];
const PARTYPES = [
  "Mana", "Energy", "Fury", "Rage", "Flow", "Heat",
  "Ferocity", "Courage", "Grit", "Blood Well", "Shield", "None",
];

const EMPTY_FORM = {
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
    hp: 0, hpperlevel: 0, mp: 0, mpperlevel: 0, movespeed: 0,
    armor: 0, armorperlevel: 0, spellblock: 0, spellblockperlevel: 0,
    attackrange: 0, hpregen: 0, hpregenperlevel: 0, mpregen: 0,
    mpregenperlevel: 0, crit: 0, critperlevel: 0, attackdamage: 0,
    attackdamageperlevel: 0, attackspeed: 0, attackspeedperlevel: 0,
  },
};

const STAT_FIELDS = [
  ["hp", "HP"],
  ["hpperlevel", "HP per level"],
  ["mp", "Mana"],
  ["mpperlevel", "Mana per level"],
  ["movespeed", "Move Speed"],
  ["armor", "Armor"],
  ["armorperlevel", "Armor per level"],
  ["spellblock", "Magic Resist"],
  ["spellblockperlevel", "Magic Resist per level"],
  ["attackrange", "Attack Range"],
  ["hpregen", "HP Regeneration"],
  ["hpregenperlevel", "HP Regeneration per level"],
  ["mpregen", "Mana Regeneration"],
  ["mpregenperlevel", "Mana Regeneration per level"],
  ["crit", "Critical Strike Chance"],
  ["critperlevel", "Critical Strike Chance per level"],
  ["attackdamage", "Attack Damage"],
  ["attackdamageperlevel", "Attack Damage per level"],
  ["attackspeed", "Attack Speed"],
  ["attackspeedperlevel", "Attack Speed per level"],
];

export default function ChampionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getChampionById(id)
      .then(setForm)
      .catch(() => setError("Champion not found."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await updateChampion(id, form);
      } else {
        await createChampion({ ...form, version: VERSION });
      }
      navigate("/admin");
    } catch {
      setError("Error saving. Make sure the JSON Server is running.");
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

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setInfo = (stat) => (e) =>
    setForm((f) => ({ ...f, info: { ...f.info, [stat]: Number(e.target.value) } }));

  const setStat = (stat) => (e) =>
    setForm((f) => ({ ...f, stats: { ...f.stats, [stat]: Number(e.target.value) } }));

  if (loading) return <p className="loading-msg">Loading…</p>;

  return (
    <div className="form-page">
      <h1>{isEdit ? `Edit — ${form.name}` : "New Champion"}</h1>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit} className="form-layout">

        <div className="form-field">
          <label htmlFor="f-id">ID</label>
          <input
            id="f-id"
            required
            value={form.id}
            onChange={setField("id")}
            disabled={isEdit}
          />
        </div>

        <div className="form-field">
          <label htmlFor="f-key">Key</label>
          <input id="f-key" required value={form.key} onChange={setField("key")} />
        </div>

        <div className="form-field">
          <label htmlFor="f-name">Name</label>
          <input id="f-name" required value={form.name} onChange={setField("name")} />
        </div>

        <div className="form-field">
          <label htmlFor="f-title">Title</label>
          <input id="f-title" required value={form.title} onChange={setField("title")} />
        </div>

        <div className="form-field">
          <label htmlFor="f-blurb">Description (blurb)</label>
          <textarea
            id="f-blurb"
            rows={5}
            value={form.blurb}
            onChange={setField("blurb")}
          />
        </div>

        <div className="form-field">
          <label htmlFor="f-partype">Resource type</label>
          <select id="f-partype" value={form.partype} onChange={setField("partype")}>
            {PARTYPES.map((p) => (
              <option key={p} value={p}>{p || "None"}</option>
            ))}
          </select>
        </div>

        <fieldset className="form-fieldset">
          <legend>Roles</legend>
          {ROLES.map((r) => (
            <label key={r} className="checkbox-row">
              <input
                type="checkbox"
                checked={form.tags.includes(r)}
                onChange={() => toggleTag(r)}
              />
              {r}
            </label>
          ))}
        </fieldset>

        <fieldset className="form-fieldset">
          <legend>Info (0 – 10)</legend>
          {["attack", "defense", "magic", "difficulty"].map((stat) => (
            <div key={stat} className="range-row">
              <label style={{ fontSize: 14, minWidth: 80, textTransform: "capitalize" }}>
                {stat}
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={form.info[stat]}
                onChange={setInfo(stat)}
              />
              <span>{form.info[stat]}</span>
            </div>
          ))}
        </fieldset>

        <fieldset className="form-fieldset">
          <legend>Base Stats</legend>
          {STAT_FIELDS.map(([key, label]) => (
            <div key={key} className="form-field" style={{ marginBottom: 6 }}>
              <label htmlFor={`stat-${key}`}>{label}</label>
              <input
                id={`stat-${key}`}
                type="number"
                value={form.stats[key]}
                onChange={setStat(key)}
              />
            </div>
          ))}
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isEdit ? "Save changes" : "Create champion"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin")}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}