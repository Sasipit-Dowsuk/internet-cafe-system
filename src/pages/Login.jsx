
import { useState } from "react";
import { Monitor, User, Lock, Eye, EyeOff } from "lucide-react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    // บัญชี Admin สำหรับทดลองใช้งาน
    if (username.trim() === "admin" && password === "admin123") {
      setError("");
      onLogin();
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          <Monitor size={34} strokeWidth={1.8} />
        </div>

        <h1>Internet Cafe</h1>
        <p className="login-subtitle">
          ระบบเข้าใช้บริการร้านอินเทอร์เน็ต
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="username">ชื่อผู้ใช้</label>
            <div className="login-input-wrap">
              <User size={18} />
              <input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">รหัสผ่าน</label>
            <div className="login-input-wrap">
              <Lock size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit">
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="login-footer">
          Internet Cafe Management System
        </p>
      </section>
    </main>
  );
}

export default Login;
