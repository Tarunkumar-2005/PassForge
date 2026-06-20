import { useState, useCallback, useEffect } from "react";
import "./App.css";

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function getStrength(password, options) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (options.uppercase) score++;
  if (options.numbers) score++;
  if (options.symbols) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "#ff4d4d" };
  if (score === 2) return { score: 2, label: "Fair", color: "#ffa94d" };
  if (score === 3) return { score: 3, label: "Good", color: "#ffd43b" };
  if (score === 4) return { score: 4, label: "Strong", color: "#69db7c" };
  return { score: 5, label: "Very Strong", color: "#40c057" };
}

function generatePassword(length, options) {
  let charset = "";
  if (options.uppercase) charset += CHARS.uppercase;
  if (options.lowercase) charset += CHARS.lowercase;
  if (options.numbers) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;
  if (!charset) charset = CHARS.lowercase;

  let mandatory = [];
  if (options.uppercase) mandatory.push(CHARS.uppercase[Math.floor(Math.random() * CHARS.uppercase.length)]);
  if (options.lowercase) mandatory.push(CHARS.lowercase[Math.floor(Math.random() * CHARS.lowercase.length)]);
  if (options.numbers) mandatory.push(CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)]);
  if (options.symbols) mandatory.push(CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)]);

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let password = Array.from(array, (x) => charset[x % charset.length]);

  mandatory.forEach((ch, i) => { password[i] = ch; });

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

export default function App() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generate = useCallback(() => {
    const pw = generatePassword(length, options);
    setPassword(pw);
    setCopied(false);
    setHistory((prev) => [pw, ...prev].slice(0, 5));
  }, [length, options]);

  useEffect(() => { generate(); }, []);

  const copy = async (pw) => {
    await navigator.clipboard.writeText(pw || password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggle = (key) =>
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return Object.values(next).some(Boolean) ? next : prev;
    });

  const strength = getStrength(password, options);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔐</span>
            <span className="logo-text">PassForge</span>
          </div>
          <div className="author-tag">
            <span>Tarun Kumar VS</span>
            <span className="dot">·</span>
            <a href="mailto:varadatarunkumar5@gmail.com">varadatarunkumar5@gmail.com</a>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="eyebrow">Cryptographically Secure</p>
          <h1 className="headline">
            Generate passwords<br />
            <span className="accent">hackers can't crack.</span>
          </h1>
          <p className="subline">
            Built with <code>window.crypto</code> — no server, no storage, no tracking.
          </p>
        </section>

        <div className="card">
          <div className="pw-display">
            <span className="pw-text">{password || "—"}</span>
            <button className="copy-btn" onClick={() => copy()} aria-label="Copy password">
              {copied ? (
                <span className="copied-label">✓ Copied!</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          <div className="strength-row">
            <span className="strength-label" style={{ color: strength.color }}>{strength.label || "—"}</span>
            <div className="strength-bar">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="strength-seg"
                  style={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
          </div>

          <div className="control-group">
            <div className="control-header">
              <label className="control-label">Length</label>
              <span className="control-value">{length}</span>
            </div>
            <input type="range" min="6" max="64" value={length}
              onChange={(e) => setLength(Number(e.target.value))} className="slider" />
            <div className="slider-ticks">
              <span>6</span><span>16</span><span>32</span><span>64</span>
            </div>
          </div>

          <div className="options-grid">
            {[
              { key: "uppercase", label: "A–Z", desc: "Uppercase" },
              { key: "lowercase", label: "a–z", desc: "Lowercase" },
              { key: "numbers",   label: "0–9", desc: "Numbers"   },
              { key: "symbols",   label: "!@#", desc: "Symbols"   },
            ].map(({ key, label, desc }) => (
              <button key={key} className={`option-chip ${options[key] ? "active" : ""}`} onClick={() => toggle(key)}>
                <span className="chip-mono">{label}</span>
                <span className="chip-desc">{desc}</span>
              </button>
            ))}
          </div>

          <button className="generate-btn" onClick={generate}>Generate Password</button>
        </div>

        {history.length > 1 && (
          <div className="history-card">
            <h3 className="history-title">Recent passwords</h3>
            <ul className="history-list">
              {history.slice(1).map((pw, i) => (
                <li key={i} className="history-item">
                  <span className="history-pw">{pw}</span>
                  <button className="history-copy" onClick={() => copy(pw)} title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="tips-card">
          <h3 className="tips-title">What makes a strong password?</h3>
          <div className="tips-grid">
            <div className="tip">
              <span className="tip-icon">📏</span>
              <div><strong>Length over complexity</strong><p>16+ characters matter more than random symbols.</p></div>
            </div>
            <div className="tip">
              <span className="tip-icon">🎲</span>
              <div><strong>True randomness</strong><p>We use your browser's crypto API — not Math.random().</p></div>
            </div>
            <div className="tip">
              <span className="tip-icon">🔁</span>
              <div><strong>Never reuse</strong><p>Use a password manager to store unique passwords per site.</p></div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-author">
            <strong>Tarun Kumar VS</strong>
            <span className="dot">·</span>
            <a href="mailto:varadatarunkumar5@gmail.com">varadatarunkumar5@gmail.com</a>
          </div>
          <a className="dh-btn" href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">
            Built for Digital Heroes
          </a>
        </div>
      </footer>
    </div>
  );
}
