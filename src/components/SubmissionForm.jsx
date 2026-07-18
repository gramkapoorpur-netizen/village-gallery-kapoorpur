import { useState } from "react";
import { Camera, ImagePlus, Save, Send, Trash2, Upload, UserRound, Video } from "lucide-react";
import { createSubmission } from "../services/galleryService";
import {
  deleteMyProfileMemory,
  getMyProfile,
  getMyProfileMemories,
  saveMyProfile,
  saveMyProfileMemory,
} from "../data/profiles";

const maxProfilePhotoSize = 2 * 1024 * 1024;
const maxMemoryFileSize = 4 * 1024 * 1024;

const emptyMemory = {
  titleHi: "",
  storyHi: "",
  year: "",
  location: "",
  sendForReview: false,
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(value) {
  if (!value) return "अभी";
  return new Intl.DateTimeFormat("hi-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function SubmissionForm() {
  const [profile, setProfile] = useState(getMyProfile);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(profile.photoUrl || "");
  const [memory, setMemory] = useState(emptyMemory);
  const [memoryFile, setMemoryFile] = useState(null);
  const [memoryPreview, setMemoryPreview] = useState("");
  const [memories, setMemories] = useState(getMyProfileMemories);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateMemory(field, value) {
    setMemory((current) => ({ ...current, [field]: value }));
  }

  async function chooseProfilePhoto(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Profile photo के लिए image file चुनें।");
      return;
    }
    if (file.size > maxProfilePhotoSize) {
      setStatus("Profile photo 2 MB से छोटी रखें।");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setProfilePhoto({ dataUrl, name: file.name, type: file.type });
    setProfilePreview(dataUrl);
  }

  async function chooseMemoryFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setStatus("Memory के लिए photo या छोटा video चुनें।");
      return;
    }
    if (file.size > maxMemoryFileSize) {
      setStatus("Profile memory file 4 MB से छोटी रखें। बड़े video admin को अलग से दें।");
      return;
    }
    setMemoryFile(file);
    setMemoryPreview(await fileToDataUrl(file));
  }

  function saveProfileForm(event) {
    event.preventDefault();
    try {
      const saved = saveMyProfile({
        ...profile,
        photoUrl: profilePhoto?.dataUrl || profile.photoUrl || "",
        photoName: profilePhoto?.name || profile.photoName || "",
      });
      setProfile(saved);
      setProfilePhoto(null);
      setStatus("आपकी profile save हो गई। अब लोग आपके trendy ID से खोज सकेंगे।");
    } catch {
      setStatus("Profile save नहीं हुई। छोटी photo चुनकर फिर कोशिश करें।");
    }
  }

  async function saveMemoryForm(event) {
    event.preventDefault();
    if (!memory.titleHi.trim() || !memory.storyHi.trim()) {
      setStatus("Memory title और कहानी लिखें।");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const media = memoryPreview
        ? {
            mediaUrl: memoryPreview,
            mediaType: memoryFile?.type || "",
            fileName: memoryFile?.name || "",
          }
        : {};
      const next = saveMyProfileMemory({
        ...memory,
        ...media,
        profileId: profile.trendId,
        authorName: profile.nameHi,
      });
      setMemories(next);

      if (memory.sendForReview) {
        await createSubmission(
          {
            titleHi: memory.titleHi,
            descriptionHi: memory.storyHi,
            category: "memory",
            year: memory.year,
            person: profile.nameHi,
            location: memory.location || profile.areaHi,
            contact: profile.contact,
          },
          memoryFile,
        );
      }

      setMemory(emptyMemory);
      setMemoryFile(null);
      setMemoryPreview("");
      setStatus(
        memory.sendForReview
          ? "Memory आपकी profile में save हो गई और admin review के लिए भी चली गई।"
          : "Memory आपकी profile में save हो गई।",
      );
    } catch (error) {
      setStatus(error.message || "Memory save नहीं हुई। छोटी file चुनकर फिर कोशिश करें।");
    } finally {
      setBusy(false);
    }
  }

  function removeMemory(memoryId) {
    setMemories(deleteMyProfileMemory(memoryId));
    setStatus("Memory आपकी profile से हट गई।");
  }

  return (
    <section className="profile-studio-page" aria-labelledby="submit-title">
      <div className="section-heading compact-heading">
        <span className="eyebrow">My Village Profile</span>
        <h2 id="submit-title">मेरी प्रोफाइल और यादें</h2>
        <p>
          गांव की मुख्य गैलरी में photo/video सिर्फ admin publish करेगा। गांववासी अपनी profile, profile photo और
          personal memories यहां बना सकते हैं।
        </p>
      </div>

      <div className="profile-studio-grid">
        <form className="stacked-form profile-editor" onSubmit={saveProfileForm}>
          <div className="profile-editor-head">
            <div className="profile-photo-preview">
              {profilePreview ? <img src={profilePreview} alt="" /> : <UserRound size={34} />}
            </div>
            <div>
              <span>Trendy ID</span>
              <strong>{profile.trendId}</strong>
            </div>
          </div>

          <label>
            आपका नाम
            <input value={profile.nameHi} onChange={(event) => updateProfile("nameHi", event.target.value)} required />
          </label>
          <div className="form-grid">
            <label>
              भूमिका
              <input value={profile.roleHi} onChange={(event) => updateProfile("roleHi", event.target.value)} />
            </label>
            <label>
              मोहल्ला / जगह
              <input value={profile.areaHi} onChange={(event) => updateProfile("areaHi", event.target.value)} />
            </label>
          </div>
          <label>
            अपने बारे में
            <textarea value={profile.aboutHi} onChange={(event) => updateProfile("aboutHi", event.target.value)} rows={4} />
          </label>
          <label>
            संपर्क जानकारी
            <input value={profile.contact || ""} onChange={(event) => updateProfile("contact", event.target.value)} placeholder="मोबाइल या Gmail" />
          </label>
          <label className="file-input">
            <Camera size={18} />
            Profile photo चुनें
            <input type="file" accept="image/*" onChange={(event) => chooseProfilePhoto(event.target.files?.[0])} />
          </label>
          <button className="icon-button primary" type="submit">
            <Save size={18} />
            Profile save करें
          </button>
        </form>

        <form className="stacked-form memory-editor" onSubmit={saveMemoryForm}>
          <div className="section-heading compact-heading">
            <span className="eyebrow">Personal Memory</span>
            <h3>नई याद जोड़ें</h3>
          </div>
          <label>
            Memory title
            <input value={memory.titleHi} onChange={(event) => updateMemory("titleHi", event.target.value)} required />
          </label>
          <label>
            कहानी
            <textarea value={memory.storyHi} onChange={(event) => updateMemory("storyHi", event.target.value)} rows={4} required />
          </label>
          <div className="form-grid">
            <label>
              साल / तारीख
              <input value={memory.year} onChange={(event) => updateMemory("year", event.target.value)} placeholder="जैसे 2005" />
            </label>
            <label>
              जगह
              <input value={memory.location} onChange={(event) => updateMemory("location", event.target.value)} />
            </label>
          </div>
          <label className="file-input">
            <Upload size={18} />
            Photo या छोटा video चुनें
            <input type="file" accept="image/*,video/*" onChange={(event) => chooseMemoryFile(event.target.files?.[0])} />
          </label>
          {memoryPreview ? (
            <div className="memory-preview">
              {memoryFile?.type.startsWith("video/") ? (
                <video src={memoryPreview} controls />
              ) : (
                <img src={memoryPreview} alt="" />
              )}
            </div>
          ) : null}
          <label className="toggle-row single-toggle">
            <input
              type="checkbox"
              checked={memory.sendForReview}
              onChange={(event) => updateMemory("sendForReview", event.target.checked)}
            />
            Admin review के लिए भी भेजें
          </label>
          <button className="icon-button primary" type="submit" disabled={busy}>
            <Send size={18} />
            {busy ? "Save हो रहा है..." : "Memory save करें"}
          </button>
          {status ? <p className="form-status">{status}</p> : null}
        </form>
      </div>

      <section className="personal-memories" aria-labelledby="my-memories-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Saved Memories</span>
            <h2 id="my-memories-title">मेरी saved यादें</h2>
          </div>
          <strong>{memories.length}</strong>
        </div>
        {memories.length ? (
          <div className="personal-memory-grid">
            {memories.map((item) => (
              <article className="personal-memory-card" key={item.id}>
                {item.mediaUrl ? (
                  item.mediaType?.startsWith("video/") ? (
                    <video src={item.mediaUrl} controls />
                  ) : (
                    <img src={item.mediaUrl} alt="" />
                  )
                ) : (
                  <div className="memory-placeholder">
                    {item.mediaType?.startsWith("video/") ? <Video size={24} /> : <ImagePlus size={24} />}
                  </div>
                )}
                <div>
                  <span>{formatDate(item.createdAt)}</span>
                  <h3>{item.titleHi}</h3>
                  <p>{item.storyHi}</p>
                  <div className="profile-actions">
                    <button type="button" onClick={() => removeMemory(item.id)}>
                      <Trash2 size={16} />
                      हटाएं
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>अभी कोई personal memory नहीं है</h3>
            <p>अपनी profile के साथ परिवार, स्कूल, खेत, त्योहार या पुरानी बात की याद save करें।</p>
          </div>
        )}
      </section>
    </section>
  );
}
