import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllChampions, getChampionImageUrl } from "../api/dataDragon";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];

export default function ChampionList() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    getAllChampions()
      .then(setAll)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return all.filter((c) => {
      const matchName = c.name.toLowerCase().includes(search.toLowerCase());
      const matchRole = role ? c.tags.includes(role) : true;
      return matchName && matchRole;
    });
  }, [all, search, role]);

  if (loading) return <p>A carregar...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Champions ({filtered.length})</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Pesquisar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Todas as roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" }}>
        {filtered.map((c) => (
          <Link key={c.id} to={`/champion/${c.id}`} style={{ textDecoration: "none", textAlign: "center" }}>
            <img
              src={getChampionImageUrl(c.image.full)}
              alt={c.name}
              width={80}
              height={80}
              style={{ borderRadius: "8px" }}
            />
            <p style={{ margin: "4px 0", fontSize: "14px" }}>{c.name}</p>
            <p style={{ fontSize: "12px", color: "var(--text)" }}>{c.tags.join(", ")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}