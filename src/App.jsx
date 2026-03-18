import { useEffect, useMemo, useState } from "react";
import "./App.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/bible", label: "Bible" },
  { href: "/profile", label: "Profile" },
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
          {NAV_LINKS.map((link) => (
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
        <a
          href="/bible"
          className="btn btn-solid nav-cta"
          onClick={(event) => onNavigate("/bible", event)}
        >
          Start Reading
        </a>
      </nav>
    </header>
  );
}

function HomePage({ onNavigate }) {
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
  }, []); // Empty array = runs once on mount

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
            <a
              href="/profile"
              className="btn btn-outline"
              onClick={(event) => onNavigate("/profile", event)}
            >
              View Profile
            </a>
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
            <p> Couldn't load verse.</p>
          )}
          <div className="hero-card-row">
            <span>Plan streak</span>
            <strong>14 days</strong>
          </div>
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
            <h3>Study Companion</h3>
            <p>
              Get key themes, context, and practical applications for each
              passage.
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
            <summary>How do I change translation?</summary>
            <p>
              Open reader settings and choose your preferred translation from
              the list.
            </p>
          </details>
        </div>
      </section>

      <section className="container contact-strip">
        <div className="contact-card">
          <h3>Contact us</h3>
          <p>Chicago, IL</p>
          <p>+1 (777) 777-7777</p>
          <p>help@scriptureaid.app</p>
        </div>
        <div className="map-card" aria-label="Map preview">
          <span>Office Location</span>
        </div>
      </section>
    </main>
  );
}

function getRand() {
  return fetch(`https://bible-api.com/data/web/random/NT`)
    .then((response) => {
      if (response.ok) {
        return response.json(); // Parse the response data as JSON
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
        return response.json(); // Parse the response data as JSON
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

function BiblePage() {
  const [chapter, setChapter] = useState(1);
  const [book, setBook] = useState("Genesis");
  const [dat, setDat] = useState(null);
  const selectedBook = BIBLE_BOOKS.find((entry) => entry.name === book);
  const maxChapter = selectedBook?.chapters ?? 1;

  useEffect(() => {
    setChapter((currentChapter) => Math.min(currentChapter, maxChapter));
  }, [maxChapter]);

  function handleSubmit(e) {
    e.preventDefault(); // prevents page reload

    if (!book || !chapter) return;

    getChap(book, chapter).then(setDat);
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
              <button type="submit" className="btn btn-solid">
                Load Chapter
              </button>
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
        </article>
        <aside className="study-panel">
          <div className="panel-card">
            <h3>Study Companion</h3>
            <p>Theme: Jesus as eternal Word and source of life.</p>
          </div>
          <div className="panel-card">
            <h3>Reflection Prompt</h3>
            <p>How does this passage reshape your view of who Jesus is?</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ProfilePage() {
  return (
    <main>
      <section className="container profile-top">
        <p className="kicker">My profile</p>
        <h1>Manage your account and reading habits</h1>
      </section>
      <section className="container profile-grid">
        <article className="profile-card">
          <div className="avatar" aria-hidden="true">
            JS
          </div>
          <h2>John Smith.</h2>
          <p>Member since 2026</p>
          <div className="stat-row">
            <div>
              <strong>47</strong>
              <span>Sessions</span>
            </div>
            <div>
              <strong>129</strong>
              <span>Notes</span>
            </div>
            <div>
              <strong>14</strong>
              <span>Streak</span>
            </div>
          </div>
        </article>
        <form
          className="settings-card"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2>Profile details</h2>
          <label htmlFor="name">Name</label>
          <input id="name" defaultValue="John Smith." />
          <label htmlFor="email">Email</label>
          <input id="email" type="email" defaultValue="johnsmith@example.com" />
          <label htmlFor="goal">Daily reading goal</label>
          <select id="goal" defaultValue="1 chapter">
            <option>1 chapter</option>
            <option>2 chapters</option>
            <option>3 chapters</option>
          </select>
          <button type="submit" className="btn btn-solid">
            Save Changes
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
            <summary>How do I reset my password?</summary>
            <p>
              Open Account Settings and choose password reset to receive an
              email link.
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
      <div className="container footer-grid">
        <div>
          <h3>Scripture</h3>
          <p>Read deeply. Reflect daily.</p>
        </div>
        <div>
          <h4>Product</h4>
          <a href="/" onClick={(event) => onNavigate("/", event)}>
            Home
          </a>
          <a href="/bible" onClick={(event) => onNavigate("/bible", event)}>
            Bible
          </a>
          <a href="/profile" onClick={(event) => onNavigate("/profile", event)}>
            Profile
          </a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="#0">Help Center</a>
          <a href="#0">Contact</a>
          <a href="#0">Privacy</a>
        </div>
        <div>
          <h4>Community</h4>
          <a href="#0">Newsletter</a>
          <a href="#0">Prayer Board</a>
          <a href="#0">Updates</a>
        </div>
      </div>
    </footer>
  );
}

function App() {
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

  const activePage = useMemo(() => {
    if (pathname === "/bible") return "bible";
    if (pathname === "/profile") return "profile";
    return "home";
  }, [pathname]);

  return (
    <div className="app-shell">
      <TopNav
        pathname={activePage === "home" ? "/" : `/${activePage}`}
        onNavigate={handleNavigate}
      />
      {activePage === "home" && <HomePage onNavigate={handleNavigate} />}
      {activePage === "bible" && <BiblePage />}
      {activePage === "profile" && <ProfilePage />}
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
