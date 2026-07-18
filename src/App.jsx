import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  Cookie,
  IdCard,
  Languages,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import BottomNav from "./components/BottomNav";
import CinematicMemoryBook from "./components/CinematicMemoryBook";
import GalleryGrid from "./components/GalleryGrid";
import HindiHelper from "./components/HindiHelper";
import HindiVoiceAgent from "./components/HindiVoiceAgent";
import PolicyPage from "./components/PolicyPage";
import ProfileDirectory from "./components/ProfileDirectory";
import SubmissionForm from "./components/SubmissionForm";
import VillageCircle from "./components/VillageCircle";
import { aboutKapoorpur, kapoorpurGuideSections, policyPages } from "./data/content";
import { categories } from "./data/sampleGallery";
import { fetchGalleryItems } from "./services/galleryService";

const AdminPanel = lazy(() => import("./components/AdminPanel"));

const safeViews = new Set(["home", "gallery", "memories", "circle", "profiles", "submit", "about", "admin"]);

function getHashView() {
  const value = window.location.hash.replace("#", "");
  if (safeViews.has(value)) return value;
  if (policyPages[value]) return value;
  return "home";
}

function containsText(item, text) {
  const haystack = [
    item.titleHi,
    item.titleEn,
    item.descriptionHi,
    item.descriptionEn,
    item.category,
    item.year,
    item.person,
    item.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(text.trim().toLowerCase());
}

function useCookieConsent() {
  const [accepted, setAccepted] = useState(() => localStorage.getItem("kapoorpurCookieConsent") === "yes");
  function accept() {
    localStorage.setItem("kapoorpurCookieConsent", "yes");
    setAccepted(true);
  }
  return [accepted, accept];
}

export default function App() {
  const [view, setViewState] = useState(getHashView);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [profileQuery, setProfileQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [lang, setLang] = useState(() => (localStorage.getItem("kapoorpurLang") === "en" ? "en" : "hi"));
  const [acceptedCookies, acceptCookies] = useCookieConsent();

  useEffect(() => {
    fetchGalleryItems().then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    const onHashChange = () => setViewState(getHashView());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi-IN" : "en";
    document.title = lang === "hi" ? "कपूरपुर गांव गैलरी" : "Village Gallery Kapoorpur";
  }, [lang]);

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId || !acceptedCookies || document.querySelector(`script[data-ga-id="${measurementId}"]`)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.dataset.gaId = measurementId;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }, [acceptedCookies]);

  function setView(nextView) {
    window.location.hash = nextView;
    setViewState(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function refreshItems() {
    fetchGalleryItems().then(setItems).catch(() => setItems([]));
  }

  function toggleLang() {
    const next = lang === "hi" ? "en" : "hi";
    localStorage.setItem("kapoorpurLang", next);
    setLang(next);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
  }

  function handleVoiceCommand(command) {
    const query = String(command?.query || "").trim();

    if (command.action === "submit") {
      setView("submit");
      return { message: "आपकी प्रोफाइल और personal memory जोड़ने वाला पेज खोल दिया।" };
    }

    if (command.action === "profiles") {
      setProfileQuery(query);
      setView("profiles");
      return { message: query ? `${query} ID खोज रहा हूं।` : "प्रोफाइल ID खोजने वाला पेज खोल दिया।" };
    }

    if (command.action === "circle") {
      setView("circle");
      return { message: "कपूरपुर सर्कल खोल दिया। यहां गांव की बातें और पोस्ट दिखेंगी।" };
    }

    if (command.action === "memories") {
      setSelectedCategory("memory");
      setView("memories");
      return { message: "यादों की किताब खोल दी। पन्ने पलटकर पुरानी यादें देखिए।" };
    }

    if (command.action === "gallery") {
      setSelectedCategory("all");
      setView("gallery");
      return { message: "गांव की गैलरी खोल दी।" };
    }

    if (command.action === "admin") {
      setView("admin");
      return { message: "एडमिन लॉगिन पेज खोल दिया।" };
    }

    if (command.action === "about") {
      setView("about");
      return { message: "गांव की जानकारी खोल दी।" };
    }

    const searchQuery = query || command.spokenText || "";
    setSearch(searchQuery);
    setSelectedCategory("all");
    setView("gallery");
    return { message: searchQuery ? `${searchQuery} खोज रहा हूं।` : "गैलरी में खोज खोल दी।" };
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryOk =
        selectedCategory === "all" ||
        item.category === selectedCategory ||
        (selectedCategory === "memory" && item.category === "memory");
      const searchOk = !search.trim() || containsText(item, search);
      return categoryOk && searchOk;
    });
  }, [items, search, selectedCategory]);

  const memoryItems = useMemo(() => items.filter((item) => item.category === "memory"), [items]);
  const featuredItems = useMemo(() => items.filter((item) => item.featured).slice(0, 6), [items]);
  const categoryCounts = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      count: items.filter((item) => item.category === category.id).length,
    }));
  }, [items]);

  const isPolicy = policyPages[view];

  return (
    <div className="app-shell">
      <header className="top-header">
        <button className="brand" type="button" onClick={() => setView("home")}>
          <img src={`${import.meta.env.BASE_URL}assets/icon-192.png`} alt="" />
          <span>{lang === "hi" ? "कपूरपुर गांव गैलरी" : "Village Gallery Kapoorpur"}</span>
        </button>
        <div className="header-actions">
          <button className="round-button language-button" onClick={toggleLang} type="button" aria-label="भाषा बदलें">
            <Languages size={19} />
            <span>{lang === "hi" ? "EN" : "हिंदी"}</span>
          </button>
          <button className="round-button" onClick={() => setView("admin")} type="button" aria-label="Admin">
            <ShieldCheck size={19} />
          </button>
        </div>
      </header>

      <main>
        {!isPolicy ? <HindiVoiceAgent onCommand={handleVoiceCommand} /> : null}

        {view === "home" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">{lang === "hi" ? "हिंदी मोबाइल ऐप" : "Hindi-first PWA"}</span>
                <h1>{lang === "hi" ? "कपूरपुर गांव गैलरी" : "Village Gallery Kapoorpur"}</h1>
                <p>
                  {lang === "hi"
                    ? "कपूरपुर की पुरानी यादें, त्योहार, लोग, खेत, स्कूल और खास जगहें एक आसान मोबाइल गैलरी में।"
                    : "A mobile-first gallery for Kapoorpur memories, festivals, people, farms, school, and places."}
                </p>
                <div className="hero-actions">
                  <button className="icon-button primary" type="button" onClick={() => setView("memories")}>
                    <Sparkles size={18} />
                    यादों की गैलरी
                  </button>
                  <button className="icon-button" type="button" onClick={() => setView("submit")}>
                    मेरी प्रोफाइल
                  </button>
                  <button className="icon-button" type="button" onClick={() => setView("circle")}>
                    {lang === "hi" ? "कपूरपुर सर्कल" : "Kapoorpur Circle"}
                  </button>
                  <button className="icon-button" type="button" onClick={() => setView("profiles")}>
                    <IdCard size={18} />
                    ID खोजें
                  </button>
                </div>
              </div>
              <div className="hero-photo">
                <img src={`${import.meta.env.BASE_URL}assets/hero-kapoorpur.png`} alt="Kapoorpur village memory collage" />
                <div className="hero-stat">
                  <strong>{items.length}</strong>
                  <span>{lang === "hi" ? "स्वीकृत यादें" : "approved memories"}</span>
                </div>
              </div>
            </section>

            <section className="stats-strip" aria-label="Site highlights">
              <div>
                <strong>हिंदी</strong>
                <span>मुख्य भाषा</span>
              </div>
              <div>
                <strong>एडमिन</strong>
                <span>Gallery upload</span>
              </div>
              <div>
                <strong>PWA</strong>
                <span>Android ready</span>
              </div>
              <div>
                <strong>सर्कल</strong>
                <span>गांव की बातें</span>
              </div>
            </section>

            <HindiHelper galleryItems={items} onSearch={(term) => { setSearch(term); setView("gallery"); }} />

            <CinematicMemoryBook memories={memoryItems} lang={lang} onSpeak={speak} />

            <section className="content-section">
              <div className="section-heading">
                <span className="eyebrow">Featured</span>
                <h2>आज की खास यादें</h2>
              </div>
              <GalleryGrid items={featuredItems} selectedItem={selectedItem} onSelect={setSelectedItem} onSpeak={speak} lang={lang} />
            </section>

            <section className="content-section category-section">
              <div className="section-heading">
                <span className="eyebrow">Explore</span>
                <h2>श्रेणी से देखें</h2>
              </div>
              <div className="category-grid">
                {categoryCounts.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setView(category.id === "memory" ? "memories" : "gallery");
                    }}
                  >
                    <span>{lang === "hi" ? category.hi : category.en}</span>
                    <strong>{category.count}</strong>
                  </button>
                ))}
              </div>
            </section>

            <section className="guide-section" aria-labelledby="guide-title">
              <div className="section-heading compact-heading">
                <span className="eyebrow">Kapoorpur Guide</span>
                <h2 id="guide-title">गांव की जानकारी</h2>
                <p>कपूरपुर की यादें, खेती, स्कूल, संस्कृति और मदद की बातें एक जगह।</p>
              </div>
              <div className="guide-grid">
                {kapoorpurGuideSections.slice(0, 4).map((section) => (
                  <article key={section.title} className="guide-card">
                    <h3>{section.title}</h3>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {view === "gallery" || view === "memories" ? (
          <section className="content-section gallery-page">
            <div className="section-heading">
              <span className="eyebrow">{view === "memories" ? "Memory Gallery" : "Public Gallery"}</span>
              <h1>{view === "memories" ? "यादों की गैलरी" : "गांव की गैलरी"}</h1>
              <p>नाम, जगह, साल या हिंदी शब्द से खोजें।</p>
            </div>
            {view === "memories" ? <CinematicMemoryBook memories={memoryItems} lang={lang} onSpeak={speak} /> : null}
            <div className="search-panel">
              <Search size={19} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="खोजें: होली, 1998, मंदिर, परिवार..."
              />
            </div>
            <div className="filter-row" role="tablist" aria-label="Gallery categories">
              <button className={selectedCategory === "all" ? "active" : ""} onClick={() => setSelectedCategory("all")} type="button">
                सभी
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={selectedCategory === category.id || (view === "memories" && category.id === "memory") ? "active" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                  type="button"
                >
                  {category.hi}
                </button>
              ))}
            </div>
            <GalleryGrid
              items={view === "memories" ? memoryItems.filter((item) => !search || containsText(item, search)) : filteredItems}
              selectedItem={selectedItem}
              onSelect={setSelectedItem}
              onSpeak={speak}
              lang={lang}
            />
          </section>
        ) : null}

        {view === "submit" ? <SubmissionForm /> : null}

        {view === "circle" ? (
          <VillageCircle
            items={items}
            memories={memoryItems}
            onOpenMemories={() => setView("memories")}
          />
        ) : null}

        {view === "profiles" ? (
          <ProfileDirectory
            key={profileQuery}
            items={items}
            initialQuery={profileQuery}
            onEditProfile={() => setView("submit")}
            onSearchGallery={(term) => {
              setSearch(term);
              setSelectedCategory("all");
              setView("gallery");
            }}
          />
        ) : null}

        {view === "about" ? (
          <section className="about-page">
            <div className="section-heading">
              <span className="eyebrow">About Kapoorpur</span>
              <h1>कपूरपुर के बारे में</h1>
            </div>
            <div className="about-grid">
              <div className="about-copy">
                {aboutKapoorpur.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="policy-links">
                {Object.entries(policyPages).map(([slug, page]) => (
                  <button key={slug} type="button" onClick={() => setView(slug)}>
                    {page.titleHi}
                    <span>{page.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="guide-grid about-guide-grid">
              {kapoorpurGuideSections.map((section) => (
                <article key={section.title} className="guide-card">
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {view === "admin" ? (
          <Suspense
            fallback={
              <section className="admin-shell">
                <div className="setup-card">
                  <h2>Admin dashboard loading...</h2>
                  <p>Admin tools खुल रहे हैं।</p>
                </div>
              </section>
            }
          >
            <AdminPanel onRefresh={refreshItems} />
          </Suspense>
        ) : null}

        {isPolicy ? <PolicyPage slug={view} /> : null}
      </main>

      {!acceptedCookies ? (
        <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
          <Cookie size={20} />
          <p>भाषा पसंद, saved posts और basic site सुधार के लिए cookies/local storage इस्तेमाल हो सकती है।</p>
          <button type="button" onClick={acceptCookies}>ठीक है</button>
        </div>
      ) : null}

      <BottomNav view={safeViews.has(view) ? view : "about"} setView={setView} />
    </div>
  );
}
