"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Password errata.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <div style={{ background: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "100%", maxWidth: "360px" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.25rem", color: "#1a1a2e" }}>PLASE — Accesso Clinico</h1>
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.5rem" }}>Bidoc S.r.l. — Dr. Laura De Clara</p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "1rem", marginBottom: "1rem", boxSizing: "border-box" }}
            required
          />
          {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Accesso..." : "Entra"}
          </button>
        </form>
      </div>
    </div>
  );
}
