import { useEffect, useMemo, useRef, useState, useCallback, createContext, useContext } from "react";
import "./App.css";
import StudyCompanion from "./StudyCompanion";

const API_BASE = "http://localhost:5001/api";

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchUser() {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  }

  function login(newToken, userData) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (token) {
      await fetchUser();
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/bible", label: "Bible" },
  { href: "/notes", label: "Notes", requiresAuth: true },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profile", requiresAuth: true },
];

const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

function normalizePath(pathname) {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

function TopNav({ pathname, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <header className="top-nav-wrap">
      <nav className="top-nav container">
        <a
          href="/"
          className="brand"
          onClick={(event) => onNavigate("/", event)}
        >
          Scripture
        </a>
        <div className="nav-links">
          {NAV_LINKS.filter(link => !link.requiresAuth || user).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "is-active" : ""}
              onClick={(event) => onNavigate(link.href, event)}
            >
              {link.label}
            </a>
          ))}
        </div>
        {user ? (
          <div className="nav-user">
            <span className="nav-username">{user.name || user.username}</span>
            <button className="btn btn-outline nav-cta" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="btn btn-solid nav-cta"
            onClick={(event) => onNavigate("/login", event)}
          >
            Sign In
          </a>
        )}
      </nav>
    </header>
  );
}

function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, { id: data.user_id, username: data.username });
        onNavigate("/profile");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Connection failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="container auth-page">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your Bible study journey</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>
              <span>Username or Email</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn btn-solid" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <a href="/register" onClick={(e) => onNavigate("/register", e)}>
              Create one
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function RegisterPage({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, name: name || username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, { id: data.user_id, username: data.username });
        onNavigate("/profile");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Connection failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="container auth-page">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p>Join our Bible study community</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Display Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <button type="submit" className="btn btn-solid" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <a href="/login" onClick={(e) => onNavigate("/login", e)}>
              Sign in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const [randVerse, setRandVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerse() {
      try {
        const verse = await getRand();
        setRandVerse(verse.random_verse);
      } catch (err) {
        console.error("Failed to fetch verse:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, []);

  return (
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <h1>Read scripture like YOU mean it</h1>
          <p>
            Bible Aid helps you stay focused with clean reading,
            and practical study prompts in one place.
          </p>
          <div className="hero-actions">
            <a
              href="/bible"
              className="btn btn-solid"
              onClick={(event) => onNavigate("/bible", event)}
            >
              Open Bible
            </a>
            {user ? (
              <a
                href="/notes"
                className="btn btn-outline"
                onClick={(event) => onNavigate("/notes", event)}
              >
                My Notes
              </a>
            ) : (
              <a
                href="/register"
                className="btn btn-outline"
                onClick={(event) => onNavigate("/register", event)}
              >
                Get Started
              </a>
            )}
          </div>
        </div>
        <div className="hero-card">
          <h2>Random Verse</h2>
          {loading ? (
            <p>Loading verse...</p>
          ) : randVerse ? (
            <>
              <p>
                {randVerse.book} {randVerse.chapter}:{randVerse.verse}
              </p>
              <blockquote>{randVerse.text}</blockquote>
            </>
          ) : (
            <p>Couldn't load verse.</p>
          )}
          {user && (
            <div className="hero-card-row">
              <span>Plan streak</span>
              <strong>{user.stats?.streak || 0} days</strong>
            </div>
          )}
        </div>
      </section>

      <section className="feature-band">
        <div className="container two-col">
          <div>
            <p className="kicker">Designed for reading</p>
            <h2>Made to remove friction from your Bible habit</h2>
            <p>
              Everything is organized so you can move from reading to reflection
              to action without bouncing between tools.
            </p>
          </div>
          <div className="mini-grid">
            <article>
              <h3>Verse Focus</h3>
              <p>
                Keep your eyes on one passage while context tools stay nearby.
              </p>
            </article>
            <article>
              <h3>Simple Notes</h3>
              <p>Capture thoughts and prayer points in a clean side panel.</p>
            </article>
            <article>
              <h3>Smart Prompts</h3>
              <p>Get reflective questions that help you apply what you read.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="container section-stack">
        <div className="section-title">
          <p className="kicker">What you get</p>
          <h2>Powerful tools for deeper reading</h2>
        </div>
        <div className="card-grid">
          <article className="feature-card">
            <h3>Bible Reader</h3>
            <p>
              Navigate chapters quickly with a distraction-light reading layout.
            </p>
          </article>
          <article className="feature-card">
            <h3>AI Study Companion</h3>
            <p>
              Get key themes, context, and practical applications powered by AI.
            </p>
          </article>
          <article className="feature-card">
            <h3>Community Notes</h3>
            <p>
              Share your insights and see what others discover in the same passages.
            </p>
          </article>
        </div>
      </section>

      <section className="container split-cta">
        <div>
          <p className="kicker">Need help?</p>
          <h2>Find what you need quickly</h2>
          <p>Browse common questions or reach us directly if you get stuck.</p>
        </div>
        <div className="faq-list">
          <details open>
            <summary>Can I create reading plans?</summary>
            <p>
              Yes. Create a plan by selecting a book and setting a daily chapter
              target.
            </p>
          </details>
          <details>
            <summary>How do I save notes?</summary>
            <p>
              Sign in to your account and use the Notes page to save and organize
              your Bible study notes.
            </p>
          </details>
        </div>
      </section>

    </main>
  );
}

function getRand() {
  return fetch(`https://bible-api.com/data/web/random/NT`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("API request failed");
      }
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getChap(book, chap) {
  return fetch(`https://bible-api.com/${book}+${chap}?translation=asv`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("API request failed");
      }
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error(error);
    });
}

function BiblePage({ onNavigate }) {
  const { user, token } = useAuth();
  const [chapter, setChapter] = useState(1);
  const [book, setBook] = useState("Genesis");
  const [dat, setDat] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const utteranceRef = useRef(null);
  const playbackIdRef = useRef(0);
  const manualStopRef = useRef(false);
  const [voiceList, setVoiceList] = useState([]);
  const [publicNotes, setPublicNotes] = useState([]);
  const selectedBook = BIBLE_BOOKS.find((entry) => entry.name === book);
  const maxChapter = selectedBook?.chapters ?? 1;
  const ttsSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;
  const passageText =
    dat?.verses?.map((verse) => verse.text.trim()).join(" ").trim() ?? "";

  function pickWiseVoice(voices) {
    if (!voices || voices.length === 0) return null;

    const preferredNames = [
      "google uk english male",
      "microsoft david",
      "daniel",
      "fred",
      "alex",
    ];
    const avoidNames = ["child", "junior", "novelty", "whisper"];

    const rankedVoices = voices
      .filter((voice) => voice.lang?.toLowerCase().startsWith("en"))
      .map((voice) => {
        const name = voice.name.toLowerCase();
        let score = 0;

        if (preferredNames.some((term) => name.includes(term))) score += 4;
        if (name.includes("male") || name.includes("man")) score += 2;
        if (voice.localService) score += 1;
        if (name.includes("enhanced") || name.includes("neural")) score += 1;
        if (avoidNames.some((term) => name.includes(term))) score -= 5;

        return { voice, score };
      })
      .sort((a, b) => b.score - a.score);

    return rankedVoices[0]?.voice ?? null;
  }

  useEffect(() => {
    setChapter((currentChapter) => Math.min(currentChapter, maxChapter));
  }, [maxChapter]);

  useEffect(() => {
    if (!ttsSupported) return;

    const synth = window.speechSynthesis;
    const loadVoices = () => {
      const nextVoices = synth.getVoices();
      if (nextVoices?.length) {
        setVoiceList(nextVoices);
      }
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);

    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, [ttsSupported]);

  useEffect(() => {
    if (dat?.reference) {
      fetchPublicNotes();
    }
  }, [dat?.reference]);

  async function fetchPublicNotes() {
    try {
      const res = await fetch(`${API_BASE}/notes/public?book=${encodeURIComponent(book)}&chapter=${chapter}`);
      if (res.ok) {
        const notes = await res.json();
        setPublicNotes(notes);
      }
    } catch (err) {
      console.error("Failed to fetch public notes:", err);
    }
  }

  async function trackSession() {
    if (token) {
      try {
        await fetch(`${API_BASE}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ book, chapter }),
        });
      } catch (err) {
        console.error("Failed to track session:", err);
      }
    }
  }

  function stopSpeech({ manual = true } = {}) {
    if (!ttsSupported) return;
    manualStopRef.current = manual;
    playbackIdRef.current += 1;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
    if (manual) {
      setTtsError("");
    }
  }

  function speakPassage() {
    if (!ttsSupported) {
      setTtsError("Text-to-speech is not supported in this browser.");
      return;
    }

    if (!passageText) {
      return;
    }

    const verseChunks =
      dat?.verses?.map((verse) => verse.text.trim()).filter(Boolean) ?? [];
    if (verseChunks.length === 0) {
      return;
    }

    setTtsError("");
    manualStopRef.current = false;
    playbackIdRef.current += 1;
    const playbackId = playbackIdRef.current;
    window.speechSynthesis.cancel();
    const voices = voiceList.length
      ? voiceList
      : window.speechSynthesis.getVoices();
    const wiseVoice = pickWiseVoice(voices);
    let useWiseVoice = Boolean(wiseVoice);
    setIsSpeaking(true);

    let index = 0;
    const speakNext = () => {
      if (playbackId !== playbackIdRef.current) return;

      if (index >= verseChunks.length) {
        setIsSpeaking(false);
        utteranceRef.current = null;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(verseChunks[index]);
      if (useWiseVoice && wiseVoice) {
        utterance.voice = wiseVoice;
        utterance.lang = wiseVoice.lang || "en-US";
      } else {
        utterance.lang = "en-US";
      }
      utterance.rate = 0.9;
      utterance.pitch = 0.67;
      utterance.volume = 1;
      utterance.onend = () => {
        if (playbackId !== playbackIdRef.current) return;
        index += 1;
        speakNext();
      };
      utterance.onerror = (event) => {
        if (playbackId !== playbackIdRef.current) return;

        const synthError = event?.error;
        const wasCanceled =
          synthError === "canceled" || synthError === "interrupted";

        if (!wasCanceled && useWiseVoice) {
          useWiseVoice = false;
          window.speechSynthesis.cancel();
          speakNext();
          return;
        }

        if (!wasCanceled || !manualStopRef.current) {
          setTtsError("Could not read this passage aloud.");
        }
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  useEffect(() => {
    if (!ttsSupported) {
      setTtsError("Text-to-speech is not supported in this browser.");
    }
  }, [ttsSupported]);

  useEffect(() => {
    stopSpeech({ manual: false });
  }, [dat?.reference]);

  useEffect(() => () => stopSpeech({ manual: false }), []);

  function handleSubmit(e) {
    e.preventDefault();

    if (!book || !chapter) return;

    stopSpeech({ manual: false });
    getChap(book, chapter).then((data) => {
      setDat(data);
      trackSession();
    });
  }

  return (
    <main>
      <section className="bible-hero">
        <div className="container bible-hero-inner">
          <p className="kicker">Bible</p>
          <h1>{dat?.reference ?? "Choose a chapter to begin reading"}</h1>
          <p className="hero-support">
            Read with context, notes, and focused verse highlights.
          </p>
        </div>
      </section>
      <section className="container bible-content">
        <article className="reading-card">
          <form className="chapter-picker" onSubmit={handleSubmit}>
            <div className="chapter-picker-head">
              <div>
                <p className="kicker">Select a Passage</p>
              </div>
              <div className="chapter-picker-actions">
                <button type="submit" className="btn btn-solid">
                  Load Chapter
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={
                    isSpeaking ? () => stopSpeech({ manual: true }) : speakPassage
                  }
                  disabled={!passageText || !ttsSupported}
                >
                  {isSpeaking ? "Stop Reading" : "Read Aloud"}
                </button>
              </div>
            </div>
            <div className="chapter-picker-grid">
              <label>
                <span>Book</span>
                <select value={book} onChange={(e) => setBook(e.target.value)}>
                  {BIBLE_BOOKS.map((entry) => (
                    <option key={entry.name} value={entry.name}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Chapter</span>
                <input
                  type="number"
                  min="1"
                  max={maxChapter}
                  value={chapter}
                  onChange={(e) => {
                    const nextChapter = Number(e.target.value);
                    if (Number.isNaN(nextChapter)) {
                      setChapter(1);
                      return;
                    }
                    setChapter(Math.min(Math.max(nextChapter, 1), maxChapter));
                  }}
                />
              </label>
            </div>
            <p className="chapter-picker-note">
              {book} has {maxChapter} chapter{maxChapter === 1 ? "" : "s"}.
            </p>
            <p className="tts-status" aria-live="polite">
              {ttsError ? ttsError : isSpeaking ? "Speaking..." : ""}
            </p>
          </form>
          {dat && dat.verses ? (
            dat.verses.map((v) => (
              <p key={v.verse}>
                <sup>{v.verse}</sup> {v.text}
              </p>
            ))
          ) : (
            <p></p>
          )}

                    {publicNotes.length > 0 && (
            <div className="public-notes-section">
              <h3>Community Notes on this Chapter</h3>
              {publicNotes.map((note) => (
                <div key={note.id} className="public-note">
                  <div className="public-note-header">
                    <a
                      href={`/user/${note.user_id}`}
                      onClick={(e) => onNavigate(`/user/${note.user_id}`, e)}
                      className="public-note-author"
                    >
                      {note.user_name || note.username}
                    </a>
                    {note.verse && <span className="public-note-verse">v. {note.verse}</span>}
                  </div>
                  <p>{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </article>
        <aside className="study-panel">
          {user && passageText && dat?.reference ? (
            <StudyCompanion
              passageText={passageText}
              reference={dat.reference}
            />
          ) : (
            <div className="panel-card">
              <h3>Study Companion</h3>
              {user ? (
                <p>Load a chapter to start studying with AI.</p>
              ) : (
                <p>Sign in to use the AI Study Companion.</p>
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function NotesPage({ onNavigate }) {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    book: "Genesis",
    chapter: 1,
    verse: "",
    content: "",
    is_public: false,
  });

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  async function fetchNotes() {
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...formData,
      verse: formData.verse ? parseInt(formData.verse) : null,
    };

    try {
      if (editingNote) {
        await fetch(`${API_BASE}/notes/${editingNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setEditingNote(null);
      setFormData({
        book: "Genesis",
        chapter: 1,
        verse: "",
        content: "",
        is_public: false,
      });
      fetchNotes();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  }

  async function handleDelete(noteId) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await fetch(`${API_BASE}/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  }

  function startEdit(note) {
    setEditingNote(note);
    setFormData({
      book: note.book,
      chapter: note.chapter,
      verse: note.verse || "",
      content: note.content,
      is_public: note.is_public,
    });
    setShowForm(true);
  }

  if (!user) {
    return (
      <main>
        <section className="container auth-page">
          <div className="auth-card">
            <h1>Sign in Required</h1>
            <p>Please sign in to view and create notes.</p>
            <a
              href="/login"
              className="btn btn-solid"
              onClick={(e) => onNavigate("/login", e)}
            >
              Sign In
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container profile-top">
        <p className="kicker">My Notes</p>
        <h1>Your Bible Study Notes</h1>
      </section>

      <section className="container notes-section">
        <div className="notes-header">
          <button
            className="btn btn-solid"
            onClick={() => {
              setEditingNote(null);
              setFormData({
                book: "Genesis",
                chapter: 1,
                verse: "",
                content: "",
                is_public: false,
              });
              setShowForm(true);
            }}
          >
            Add Note
          </button>
        </div>

        {showForm && (
          <div className="note-form-card">
            <h3>{editingNote ? "Edit Note" : "New Note"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="note-form-row">
                <label>
                  <span>Book</span>
                  <select
                    value={formData.book}
                    onChange={(e) =>
                      setFormData({ ...formData, book: e.target.value })
                    }
                  >
                    {BIBLE_BOOKS.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Chapter</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.chapter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chapter: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </label>
                <label>
                  <span>Verse (optional)</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.verse}
                    onChange={(e) =>
                      setFormData({ ...formData, verse: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                <span>Note</span>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  required
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) =>
                    setFormData({ ...formData, is_public: e.target.checked })
                  }
                />
                <span>Share publicly (visible on Bible page and your profile)</span>
              </label>
              <div className="note-form-actions">
                <button type="submit" className="btn btn-solid">
                  {editingNote ? "Save Changes" : "Create Note"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any notes yet.</p>
            <p>Start by reading a chapter and capturing your thoughts!</p>
          </div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-card-header">
                  <h3>
                    {note.book} {note.chapter}
                    {note.verse && `:${note.verse}`}
                  </h3>
                  <div className="note-card-actions">
                    {note.is_public && (
                      <span className="badge badge-public">Public</span>
                    )}
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => startEdit(note)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-outline btn-danger"
                      onClick={() => handleDelete(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p>{note.content}</p>
                <p className="note-date">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CommunityPage({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("notes");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [usersRes, notesRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/notes/public`),
      ]);

      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
      if (notesRes.ok) {
        setPublicNotes(await notesRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch community data:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="container profile-top">
        <p className="kicker">Community</p>
        <h1>Connect with Fellow Readers</h1>
      </section>

      <section className="container community-section">
        <div className="community-tabs">
          <button
            className={`tab-btn ${tab === "notes" ? "active" : ""}`}
            onClick={() => setTab("notes")}
          >
            Recent Notes
          </button>
          <button
            className={`tab-btn ${tab === "members" ? "active" : ""}`}
            onClick={() => setTab("members")}
          >
            Members
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : tab === "notes" ? (
          <div className="community-notes">
            {publicNotes.length === 0 ? (
              <p>No public notes yet. Be the first to share!</p>
            ) : (
              publicNotes.map((note) => (
                <div key={note.id} className="community-note">
                  <div className="community-note-header">
                    <a
                      href={`/user/${note.user_id}`}
                      onClick={(e) => onNavigate(`/user/${note.user_id}`, e)}
                      className="community-note-author"
                    >
                      {note.user_name || note.username}
                    </a>
                    <span className="community-note-passage">
                      {note.book} {note.chapter}
                      {note.verse && `:${note.verse}`}
                    </span>
                  </div>
                  <p>{note.content}</p>
                  <p className="community-note-date">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="community-members">
            {users.length === 0 ? (
              <p>No members yet.</p>
            ) : (
              users.map((u) => (
                <a
                  key={u.id}
                  href={`/user/${u.id}`}
                  onClick={(e) => onNavigate(`/user/${u.id}`, e)}
                  className="member-card"
                >
                  <div className="member-avatar">
                    {(u.name || u.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h3>{u.name || u.username}</h3>
                    <p>@{u.username}</p>
                    {u.bio && <p className="member-bio">{u.bio}</p>}
                    <p className="member-stats">{u.public_notes} public notes</p>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function UserProfilePage({ userId, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`);
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main>
        <section className="container profile-top">
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <section className="container profile-top">
          <h1>User not found</h1>
          <a
            href="/community"
            className="btn btn-solid"
            onClick={(e) => onNavigate("/community", e)}
          >
            Back to Community
          </a>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container profile-top">
        <p className="kicker">Member Profile</p>
        <h1>{profile.name || profile.username}</h1>
      </section>

      <section className="container profile-grid">
        <article className="profile-card">
          <div className="avatar" aria-hidden="true">
            {(profile.name || profile.username).charAt(0).toUpperCase()}
          </div>
          <h2>{profile.name || profile.username}</h2>
          <p>@{profile.username}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <p className="member-since">
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </article>

        <div className="user-notes-section">
          <h2>Public Notes ({profile.public_notes.length})</h2>
          {profile.public_notes.length === 0 ? (
            <p>No public notes yet.</p>
          ) : (
            <div className="notes-list">
              {profile.public_notes.map((note) => (
                <div key={note.id} className="note-card">
                  <h3>
                    {note.book} {note.chapter}
                    {note.verse && `:${note.verse}`}
                  </h3>
                  <p>{note.content}</p>
                  <p className="note-date">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProfilePage({ onNavigate }) {
  const { user, token, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    daily_goal: "1 chapter",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        daily_goal: user.daily_goal || "1 chapter",
      });
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        refreshUser();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch (err) {
      setMessage("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <main>
        <section className="container auth-page">
          <div className="auth-card">
            <h1>Sign in Required</h1>
            <p>Please sign in to view your profile.</p>
            <a
              href="/login"
              className="btn btn-solid"
              onClick={(e) => onNavigate("/login", e)}
            >
              Sign In
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container profile-top">
        <p className="kicker">My profile</p>
        <h1>Manage your account and reading habits</h1>
      </section>
      <section className="container profile-grid">
        <article className="profile-card">
          <div className="avatar" aria-hidden="true">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>
          <h2>{user.name || user.username}</h2>
          <p>@{user.username}</p>
          <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
          <div className="stat-row">
            <div>
              <strong>{user.stats?.sessions || 0}</strong>
              <span>Sessions</span>
            </div>
            <div>
              <strong>{user.stats?.notes || 0}</strong>
              <span>Notes</span>
            </div>
            <div>
              <strong>{user.stats?.streak || 0}</strong>
              <span>Streak</span>
            </div>
          </div>
        </article>
        <form className="settings-card" onSubmit={handleSubmit}>
          <h2>Profile details</h2>
          {message && (
            <p className={message.includes("success") ? "success-msg" : "error-msg"}>
              {message}
            </p>
          )}
          <label htmlFor="name">Display Name</label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            placeholder="Tell others about yourself..."
          />
          <label htmlFor="goal">Daily reading goal</label>
          <select
            id="goal"
            value={formData.daily_goal}
            onChange={(e) =>
              setFormData({ ...formData, daily_goal: e.target.value })
            }
          >
            <option>1 chapter</option>
            <option>2 chapters</option>
            <option>3 chapters</option>
          </select>
          <button type="submit" className="btn btn-solid" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      <section className="container split-cta profile-faq">
        <div>
          <h2>Profile FAQs</h2>
          <p>Account settings and data questions.</p>
        </div>
        <div className="faq-list">
          <details open>
            <summary>Can I export my notes?</summary>
            <p>
              Yes. Use the export action in the Notes tab to download a text
              file.
            </p>
          </details>
          <details>
            <summary>How is my streak calculated?</summary>
            <p>
              Your streak counts consecutive days where you've loaded and read
              at least one chapter.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}

function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container footer-simple">
        <div className="footer-brand">
          <h3>Scripture</h3>
          <p>Read deeply. Reflect daily.</p>
        </div>
        <div className="footer-links">
          <a href="/" onClick={(e) => onNavigate("/", e)}>Home</a>
          <a href="/bible" onClick={(e) => onNavigate("/bible", e)}>Bible</a>
          <a href="/notes" onClick={(e) => onNavigate("/notes", e)}>Notes</a>
          <a href="/community" onClick={(e) => onNavigate("/community", e)}>Community</a>
        </div>
      </div>
    </footer>
  );
}

function AppContent() {
  const { loading } = useAuth();
  const [pathname, setPathname] = useState(() =>
    normalizePath(window.location.pathname),
  );

  useEffect(() => {
    const onPopState = () =>
      setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleNavigate = (to, event) => {
    if (event) event.preventDefault();
    if (to === pathname) return;
    window.history.pushState({}, "", to);
    setPathname(to);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const { activePage, userId } = useMemo(() => {
    if (pathname === "/bible") return { activePage: "bible", userId: null };
    if (pathname === "/profile") return { activePage: "profile", userId: null };
    if (pathname === "/notes") return { activePage: "notes", userId: null };
    if (pathname === "/community") return { activePage: "community", userId: null };
    if (pathname === "/login") return { activePage: "login", userId: null };
    if (pathname === "/register") return { activePage: "register", userId: null };
    if (pathname.startsWith("/user/")) {
      const id = pathname.split("/")[2];
      return { activePage: "userProfile", userId: parseInt(id) };
    }
    return { activePage: "home", userId: null };
  }, [pathname]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-screen">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopNav
        pathname={activePage === "home" ? "/" : `/${activePage}`}
        onNavigate={handleNavigate}
      />
      {activePage === "home" && <HomePage onNavigate={handleNavigate} />}
      {activePage === "bible" && <BiblePage onNavigate={handleNavigate} />}
      {activePage === "profile" && <ProfilePage onNavigate={handleNavigate} />}
      {activePage === "notes" && <NotesPage onNavigate={handleNavigate} />}
      {activePage === "community" && <CommunityPage onNavigate={handleNavigate} />}
      {activePage === "login" && <LoginPage onNavigate={handleNavigate} />}
      {activePage === "register" && <RegisterPage onNavigate={handleNavigate} />}
      {activePage === "userProfile" && (
        <UserProfilePage userId={userId} onNavigate={handleNavigate} />
      )}
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
