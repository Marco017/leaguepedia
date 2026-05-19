import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllChampions, getChampionImageUrl } from "../api/dataDragon";
import { getChampions as getServerChampions } from "../api/jsonServer";
import Pagination from "../components/Pagination";

const ROLES = ["Fighter", "Mage", "Assassin", "Tank", "Support", "Marksman"];
const PER_PAGE = 30;

export default function ChampionList() {
  // All champions from Data Dragon (static, fetched once)
  const [ddChampions, setDdChampions] = useState([]);
  // Champions from the local json-server (custom entries)
  const [serverChampions, setServerChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // Fetch both sources in parallel on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllChampions().catch(() => []),
      // Fetch all custom champions without pagination so we can merge properly
      fetch("http://localhost:3000/champions")
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([dd, server]) => {
        setDdChampions(Array.isArray(dd) ? dd : []);
        // server may return a pagination envelope or a plain array
        const serverArr = Array.isArray(server)
          ? server
          : Array.isArray(server?.data)
          ? server.data
          : [];
        setServerChampions(serverArr);
      })
      .catch(() => setError("Failed to load champion data."))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Merge Data Dragon + json-server champions.
   * json-server entries override DD entries when IDs match
   * (so custom edits win), and purely custom entries are appended.
   */
  const merged = useMemo(() => {
    const serverById = Object.fromEntries(serverChampions.map((c) => [c.id, c]));
    const ddFiltered = ddChampions.map((c) => serverById[c.id] ?? c);
    const ddIds = new Set(ddChampions.map((c) => c.id));
    const extraServer = serverChampions.filter((c) => !ddIds.has(c.id));
    return [...ddFiltered, ...extraServer];
  }, [ddChampions, serverChampions]);

  // Client-side filter applied to merged list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return merged.filter((c) => {
      const matchName = c.name?.toLowerCase().includes(q);
      const matchRole = role ? (c.tags ?? []).includes(role) : true;
      return matchName && matchRole;
    });
  }, [merged, search, role]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <p className="loading-msg">Loading champions…</p>;
  if (error)   return <p className="error-msg">{error}</p>;

  return (
    <div className="page">
      <h1>Champions ({filtered.length})</h1>

      <div className="filters-bar">
        <input
          placeholder="Search by name…"
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

      <div className="champion-grid">
        {paginated.map((c) => (
          <Link key={c.id} to={`/champion/${c.id}`} className="champion-card">
            {c.image?.full ? (
              <img
                src={getChampionImageUrl(c.image.full)}
                alt={c.name}
                width={120}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: "var(--accent-bg)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  margin: "0 auto",
                }}
              >
                ?
              </div>
            )}
            <p className="champion-card-name">{c.name}</p>
          </Link>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}