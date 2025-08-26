import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(name, email, password);
      nav("/");
    } catch (e) {
      setErr(e.message || "Register failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2 className="title">Create account</h2>
      <form onSubmit={handleSubmit}>
        <div className="spacer"></div>
        <input className="input" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <div className="spacer"></div>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="spacer"></div>
        <input type="password" className="input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {err && <p className="muted">{err}</p>}
        <div className="spacer"></div>
        <button className="btn" type="submit">Register</button>
      </form>
      <div className="spacer"></div>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}