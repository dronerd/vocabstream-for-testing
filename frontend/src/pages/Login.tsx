import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      const res = await apiLogin(username, password);
      setToken(res.token);
      navigate("/");
    } catch (err) {
      setError("Login failed (demo). Try any username.");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "24px auto" }}>
      <h2>ログイン</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label>ユーザー名またはメール</label><br />
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>パスワード</label><br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        </div>
        <button type="submit">ログイン</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <a href="#" onClick={(e)=>{e.preventDefault(); alert("ここはパスワード再設定の画面に遷移します（未実装）");}}>パスワードを忘れた場合</a>
      </div>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
