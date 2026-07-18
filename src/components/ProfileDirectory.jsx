import { useEffect, useMemo, useState } from "react";
import { Copy, IdCard, Search, UserRoundSearch } from "lucide-react";
import { buildProfiles, getMyProfile } from "../data/profiles";

function normalize(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, "");
}

export default function ProfileDirectory({ items, initialQuery = "", onSearchGallery }) {
  const profiles = useMemo(() => buildProfiles(items), [items]);
  const [query, setQuery] = useState(initialQuery);
  const [myProfile] = useState(getMyProfile);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const allProfiles = useMemo(() => {
    const exists = profiles.some((profile) => profile.trendId === myProfile.trendId);
    return exists ? profiles : [myProfile, ...profiles];
  }, [myProfile, profiles]);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return allProfiles;
    return allProfiles.filter((profile) => {
      return [profile.trendId, profile.nameHi, profile.nameEn, profile.roleHi, profile.areaHi, ...(profile.tags || [])]
        .some((value) => normalize(value).includes(needle));
    });
  }, [allProfiles, query]);

  async function copyId(trendId) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trendId);
        setCopyStatus(`${trendId} copy हो गया।`);
        return;
      }
    } catch {
      // Fall through to readable status.
    }
    setCopyStatus(`ID: ${trendId}`);
  }

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-hero">
        <div>
          <span className="eyebrow">Trendy Village IDs</span>
          <h1 id="profile-title">प्रोफाइल ID खोजें</h1>
          <p>हर profile को एक आसान trendy ID मिला है। ID बोलकर, लिखकर या copy करके लोग सीधे profile खोज सकते हैं।</p>
        </div>
        <div className="my-id-card">
          <span>मेरा ID</span>
          <strong>{myProfile.trendId}</strong>
          <button type="button" className="icon-button primary" onClick={() => copyId(myProfile.trendId)}>
            <Copy size={18} />
            Copy
          </button>
        </div>
      </div>

      <div className="profile-search-panel">
        <Search size={19} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ID खोजें: @kp-yuva, @kp-mandir, @kp-manoj2704..."
        />
      </div>
      {copyStatus ? <p className="profile-copy-status">{copyStatus}</p> : null}

      <div className="profile-grid">
        {filtered.map((profile) => (
          <article className="profile-card" key={profile.trendId}>
            <div className="profile-avatar" aria-hidden="true">
              <IdCard size={24} />
            </div>
            <div>
              <span className="profile-id">{profile.trendId}</span>
              <h3>{profile.nameHi}</h3>
              <p>{profile.aboutHi}</p>
              <div className="profile-meta">
                <span>{profile.roleHi}</span>
                <span>{profile.areaHi}</span>
                <span>{profile.sourceCount || 0} यादें</span>
              </div>
              <div className="profile-actions">
                <button type="button" onClick={() => copyId(profile.trendId)}>
                  <Copy size={16} />
                  ID copy
                </button>
                <button type="button" onClick={() => onSearchGallery(profile.nameHi)}>
                  <UserRoundSearch size={16} />
                  यादें देखें
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
