import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("stt_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("stt_token") || null);

  useEffect(() => {
    if (user) localStorage.setItem("stt_user", JSON.stringify(user)); else localStorage.removeItem("stt_user");
    if (token) localStorage.setItem("stt_token", token); else localStorage.removeItem("stt_token");
  }, [user, token]);

  async function login(email, password) {
    const res = await api("/api/auth/login", { method: "POST", body: { email, password } });
    setUser(res.user); setToken(res.token);
  }
  async function register(name, email, password) {
    const res = await api("/api/auth/register", { method: "POST", body: { name, email, password } });
    setUser(res.user); setToken(res.token);
  }
  function logout() { setUser(null); setToken(null); }

  return <AuthCtx.Provider value={{ user, token, login, register, logout }}>{children}</AuthCtx.Provider>;
}