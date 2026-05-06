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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Champions ({filtered.length})</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 2fr))", gap: "5px" }}>
        {filtered.map((c) => (
          <Link key={c.id} to={`/champion/${c.id}`} style={{ textDecoration: "none", textAlign: "center" }}>
            <img
              src={getChampionImageUrl(c.image.full)}
              alt={c.name}
              width={120}
              style={{ borderRadius: "3px" }}
            />
            <p style={{ marginTop: "0px", fontSize: "14px" }}>{c.name}</p>
            {/* <p style={{ fontSize: "12px", color: "var(--text)" }}>{c.tags.join(", ")}</p> */}
          </Link>
        ))}
      </div>
    </div>
  );
}