import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, LogIn, LogOut, Save, ShieldCheck, Trash2, Upload, WandSparkles } from "lucide-react";
import { adminEmail, auth, firebaseReady, isAdminUser, signInWithGoogle, signOutAdmin } from "../firebase";
import { categories } from "../data/sampleGallery";
import { createGalleryItem, deleteGalleryItem, fetchGalleryItems, updateGalleryItem } from "../services/galleryService";

const emptyForm = {
  titleHi: "",
  titleEn: "",
  descriptionHi: "",
  descriptionEn: "",
  category: "memory",
  year: "",
  person: "",
  location: "",
  image: "",
  featured: false,
  approved: true,
  type: "image",
};

function suggestDescription(form) {
  const category = categories.find((item) => item.id === form.category)?.hi || "याद";
  const year = form.year ? `${form.year} की ` : "";
  const place = form.location ? `${form.location} से जुड़ी ` : "";
  const person = form.person ? `${form.person} की ` : "";
  return `${year}${place}${person}${category} की यह याद कपूरपुर गांव के इतिहास और अपनापन को संजोती है।`;
}

export default function AdminPanel({ onRefresh }) {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = useMemo(() => isAdminUser(user), [user]);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchGalleryItems({ includePending: true }).then(setItems).catch(() => setItems([]));
    }
  }, [isAdmin]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function login() {
    setStatus("");
    try {
      const result = await signInWithGoogle();
      if (!isAdminUser(result.user)) {
        setStatus(`यह Gmail admin नहीं है। Admin Gmail: ${adminEmail}`);
      }
    } catch (error) {
      setStatus(error.message || "Login failed.");
    }
  }

  function editItem(item) {
    setEditingId(item.id);
    setForm({
      titleHi: item.titleHi || "",
      titleEn: item.titleEn || "",
      descriptionHi: item.descriptionHi || "",
      descriptionEn: item.descriptionEn || "",
      category: item.category || "memory",
      year: item.year || "",
      person: item.person || "",
      location: item.location || "",
      image: item.image || "",
      featured: Boolean(item.featured),
      approved: item.approved !== false,
      type: item.type || "image",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      if (editingId) {
        await updateGalleryItem(editingId, form, file);
        setStatus("Memory update हो गई।");
      } else {
        await createGalleryItem(form, file);
        setStatus("नई memory publish हो गई।");
      }
      setForm(emptyForm);
      setEditingId("");
      setFile(null);
      formElement.reset();
      const updated = await fetchGalleryItems({ includePending: true });
      setItems(updated);
      onRefresh();
    } catch (error) {
      setStatus(error.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("इस item को delete करना है?")) return;
    setBusy(true);
    try {
      await deleteGalleryItem(id);
      setItems((current) => current.filter((item) => item.id !== id));
      onRefresh();
    } catch (error) {
      setStatus(error.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!firebaseReady) {
    return (
      <section className="admin-shell">
        <div className="setup-card">
          <ShieldCheck size={34} />
          <h2>Admin setup ready है</h2>
          <p>
            Firebase keys और admin Gmail जोड़ने के बाद Google login, upload, approve, edit और delete live हो जाएंगे.
          </p>
          <div className="setup-list">
            <span>1. Firebase project बनाएं</span>
            <span>2. Google Authentication enable करें</span>
            <span>3. Firestore और Storage enable करें</span>
            <span>4. .env में VITE_ADMIN_EMAIL और Firebase keys भरें</span>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="admin-shell">
        <div className="setup-card">
          <ShieldCheck size={34} />
          <h2>Admin Gmail Login</h2>
          <p>सिर्फ यह Gmail admin dashboard खोल सकता है: {adminEmail}</p>
          <button className="icon-button primary" onClick={login} type="button">
            <LogIn size={18} />
            Google से login करें
          </button>
          {status ? <p className="form-status">{status}</p> : null}
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="admin-shell">
        <div className="setup-card warning">
          <ShieldCheck size={34} />
          <h2>Access denied</h2>
          <p>{user.email} admin Gmail नहीं है। Admin Gmail: {adminEmail}</p>
          <button className="icon-button" onClick={signOutAdmin} type="button">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-shell">
      <div className="admin-topbar">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h2>Public gallery upload करें</h2>
          <p>मुख्य गांव gallery में photo/video publish करने का अधिकार सिर्फ admin को है। Logged in: {user.email}</p>
        </div>
        <button className="icon-button" onClick={signOutAdmin} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <form className="admin-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            हिंदी शीर्षक
            <input value={form.titleHi} onChange={(event) => update("titleHi", event.target.value)} required />
          </label>
          <label>
            English title
            <input value={form.titleEn} onChange={(event) => update("titleEn", event.target.value)} />
          </label>
        </div>
        <label>
          हिंदी विवरण
          <textarea value={form.descriptionHi} onChange={(event) => update("descriptionHi", event.target.value)} rows={4} required />
        </label>
        <div className="helper-inline">
          <button type="button" className="icon-button" onClick={() => update("descriptionHi", suggestDescription(form))}>
            <WandSparkles size={18} />
            Hindi description suggest करें
          </button>
        </div>
        <label>
          English description
          <textarea value={form.descriptionEn} onChange={(event) => update("descriptionEn", event.target.value)} rows={3} />
        </label>
        <div className="form-grid">
          <label>
            श्रेणी
            <select value={form.category} onChange={(event) => update("category", event.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.hi}
                </option>
              ))}
            </select>
          </label>
          <label>
            साल / तारीख
            <input value={form.year} onChange={(event) => update("year", event.target.value)} />
          </label>
          <label>
            व्यक्ति / परिवार
            <input value={form.person} onChange={(event) => update("person", event.target.value)} />
          </label>
          <label>
            जगह
            <input value={form.location} onChange={(event) => update("location", event.target.value)} />
          </label>
        </div>
        <label className="file-input">
          <Upload size={18} />
          नई फोटो/वीडियो upload करें
          <input type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </label>
        <div className="toggle-row">
          <label>
            <input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} />
            Featured memory
          </label>
          <label>
            <input type="checkbox" checked={form.approved} onChange={(event) => update("approved", event.target.checked)} />
            Public approved
          </label>
        </div>
        <button className="icon-button primary" type="submit" disabled={busy}>
          <Save size={18} />
          {busy ? "Saving..." : editingId ? "Update करें" : "Publish करें"}
        </button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>

      <div className="admin-list">
        <h3>Published items</h3>
        {items.map((item) => (
          <article key={item.id} className="admin-row">
            <div>
              <strong>{item.titleHi}</strong>
              <span>
                {item.year} · {item.location} · {item.approved === false ? "Pending" : "Live"}
              </span>
            </div>
            <div className="row-actions">
              <button type="button" onClick={() => editItem(item)}>
                <CheckCircle2 size={17} />
                Edit
              </button>
              <button type="button" onClick={() => remove(item.id)} disabled={busy}>
                <Trash2 size={17} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
