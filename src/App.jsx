import { useEffect, useMemo, useState } from 'react';
import './App.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/bible', label: 'Bible' },
  { href: '/profile', label: 'Profile' }
];

function normalizePath(pathname) {
  if (!pathname) return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
}

function TopNav({ pathname, onNavigate }) {
  return (
    <header className="top-nav-wrap">
      <nav className="top-nav container">
        <a href="/" className="brand" onClick={(event) => onNavigate('/', event)}>
          Scripture
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'is-active' : ''}
              onClick={(event) => onNavigate(link.href, event)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a
          href="/bible"
          className="btn btn-solid nav-cta"
          onClick={(event) => onNavigate('/bible', event)}
        >
          Start Reading
        </a>
      </nav>
    </header>
  );
}

function HomePage({ onNavigate }) {
  return (
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <p className="kicker">Scripture Wireframe</p>
          <h1>Read scripture like YOU mean it</h1>
          <p>
            Bible Aid helps you stay focused with clean reading, quick notes, and practical study
            prompts in one place.
          </p>
          <div className="hero-actions">
            <a href="/bible" className="btn btn-solid" onClick={(event) => onNavigate('/bible', event)}>
              Open Bible
            </a>
            <a
              href="/profile"
              className="btn btn-outline"
              onClick={(event) => onNavigate('/profile', event)}
            >
              View Profile
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h2>Daily Reading</h2>
          <p>John 15:5</p>
          <blockquote>
            I am the vine, you are the branches. Whoever abides in me and I in him, he it is that
            bears much fruit.
          </blockquote>
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
              Everything is organized so you can move from reading to reflection to action without
              bouncing between tools.
            </p>
          </div>
          <div className="mini-grid">
            <article>
              <h3>Verse Focus</h3>
              <p>Keep your eyes on one passage while context tools stay nearby.</p>
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
          <h2>Three powerful tools for deeper reading</h2>
        </div>
        <div className="card-grid">
          <article className="feature-card">
            <h3>Bible Reader</h3>
            <p>Navigate chapters quickly with a distraction-light reading layout.</p>
          </article>
          <article className="feature-card">
            <h3>Study Companion</h3>
            <p>Get key themes, context, and practical applications for each passage.</p>
          </article>
          <article className="feature-card">
            <h3>Reflection Notes</h3>
            <p>Track what stood out and revisit your notes whenever you return.</p>
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
            <p>Yes. Create a plan by selecting a book and setting a daily chapter target.</p>
          </details>
          <details>
            <summary>Does it sync notes across devices?</summary>
            <p>Yes. Notes stay synced so your progress is available on desktop and mobile.</p>
          </details>
          <details>
            <summary>How do I change translation?</summary>
            <p>Open reader settings and choose your preferred translation from the list.</p>
          </details>
        </div>
      </section>

      <section className="container contact-strip">
        <div className="contact-card">
          <h3>Contact us</h3>
          <p>Chicago, IL</p>
          <p>+1 (773) 555-0178</p>
          <p>hello@scriptureaid.app</p>
        </div>
        <div className="map-card" aria-label="Map preview">
          <span>Office Location</span>
        </div>
      </section>
    </main>
  );
}

function BiblePage() {
  return (
    <main>
      <section className="bible-hero">
        <div className="container bible-hero-inner">
          <p className="kicker">Bible</p>
          <h1>John 1</h1>
          <p className="hero-support">Read with context, notes, and focused verse highlights.</p>
        </div>
      </section>
      <section className="container bible-content">
        <article className="reading-card">
          <div className="reading-head">
            <strong>Chapter 1</strong>
            <span>ESV</span>
          </div>
          <p>
            <sup>1</sup> In the beginning was the Word, and the Word was with God, and the Word
            was God.
          </p>
          <p>
            <sup>2</sup> He was in the beginning with God. <sup>3</sup> All things were made
            through him, and without him was not any thing made that was made.
          </p>
          <p>
            <sup>4</sup> In him was life, and the life was the light of men. <sup>5</sup> The
            light shines in the darkness, and the darkness has not overcome it.
          </p>
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
          <div className="panel-card">
            <h3>Quick Notes</h3>
            <p>- The Word is active, personal, and divine.</p>
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
        <form className="settings-card" onSubmit={(event) => event.preventDefault()}>
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
            <p>Yes. Use the export action in the Notes tab to download a text file.</p>
          </details>
          <details>
            <summary>How do I reset my password?</summary>
            <p>Open Account Settings and choose password reset to receive an email link.</p>
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
          <a href="/" onClick={(event) => onNavigate('/', event)}>
            Home
          </a>
          <a href="/bible" onClick={(event) => onNavigate('/bible', event)}>
            Bible
          </a>
          <a href="/profile" onClick={(event) => onNavigate('/profile', event)}>
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
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (to, event) => {
    if (event) event.preventDefault();
    if (to === pathname) return;
    window.history.pushState({}, '', to);
    setPathname(to);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const activePage = useMemo(() => {
    if (pathname === '/bible') return 'bible';
    if (pathname === '/profile') return 'profile';
    return 'home';
  }, [pathname]);

  return (
    <div className="app-shell">
      <TopNav pathname={activePage === 'home' ? '/' : `/${activePage}`} onNavigate={handleNavigate} />
      {activePage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {activePage === 'bible' && <BiblePage />}
      {activePage === 'profile' && <ProfilePage />}
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
