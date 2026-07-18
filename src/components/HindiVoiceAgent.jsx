import { useMemo, useState } from "react";
import { Bot, Mic, MicOff, Send, Volume2 } from "lucide-react";

const examples = [
  "फोटो डालनी है",
  "गैलरी खोलो",
  "आईडी खोजो @kp-yuva",
  "मंदिर खोजो",
  "कपूरपुर सर्कल खोलो",
];

function speakHindi(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hi-IN";
  utterance.rate = 0.96;
  window.speechSynthesis.speak(utterance);
}

function cleanCommand(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[।.?!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAfter(text, markers) {
  for (const marker of markers) {
    const index = text.indexOf(marker);
    if (index >= 0) {
      return text.slice(index + marker.length).trim();
    }
  }
  return "";
}

export default function HindiVoiceAgent({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [commandText, setCommandText] = useState("");
  const [response, setResponse] = useState("नमस्ते! बोलिए: फोटो डालनी है, गैलरी खोलो, या आईडी खोजो @kp-yuva.");

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  function handleCommand(rawText) {
    const text = cleanCommand(rawText);
    if (!text) return;
    setCommandText(rawText);

    let result;
    if (text.includes("फोटो") || text.includes("photo") || text.includes("अपलोड") || text.includes("upload") || text.includes("डाल")) {
      result = onCommand({ action: "submit", spokenText: rawText });
    } else if (text.includes("आईडी") || text.includes("id") || text.includes("@kp") || text.includes("प्रोफाइल") || text.includes("profile")) {
      const idQuery = extractAfter(text, ["आईडी खोजो", "id search", "id", "आईडी", "प्रोफाइल", "profile"]) || text;
      result = onCommand({ action: "profiles", query: idQuery.replace("खोजो", "").trim(), spokenText: rawText });
    } else if (text.includes("सर्कल") || text.includes("circle") || text.includes("पोस्ट") || text.includes("गांव बात")) {
      result = onCommand({ action: "circle", spokenText: rawText });
    } else if (text.includes("याद") || text.includes("किताब") || text.includes("memory") || text.includes("book")) {
      result = onCommand({ action: "memories", spokenText: rawText });
    } else if (text.includes("गैलरी") || text.includes("gallery") || text.includes("फोटो दिख")) {
      result = onCommand({ action: "gallery", spokenText: rawText });
    } else if (text.includes("एडमिन") || text.includes("admin") || text.includes("login") || text.includes("लॉगिन")) {
      result = onCommand({ action: "admin", spokenText: rawText });
    } else if (text.includes("गांव") || text.includes("जानकारी") || text.includes("about")) {
      result = onCommand({ action: "about", spokenText: rawText });
    } else if (text.includes("खोज") || text.includes("search")) {
      const searchQuery = extractAfter(text, ["खोजो", "खोज", "search"]) || text.replace("खोजो", "").replace("खोज", "").trim();
      result = onCommand({ action: "search", query: searchQuery, spokenText: rawText });
    } else {
      result = onCommand({ action: "search", query: text, spokenText: rawText });
    }

    const reply = result?.message || "मैंने आपकी बात समझ ली।";
    setResponse(reply);
    speakHindi(reply);
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const fallback = "इस मोबाइल में voice command support नहीं है। आप नीचे लिखकर command भेज सकते हैं।";
      setResponse(fallback);
      speakHindi(fallback);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setResponse("आवाज साफ नहीं आई। फिर से बोलकर देखें।");
    };
    recognition.onresult = (event) => {
      handleCommand(event.results[0][0].transcript);
    };
    recognition.start();
  }

  return (
    <section className="voice-agent" aria-label="Hindi voice agent">
      <div className="voice-agent-head">
        <Bot size={20} />
        <div>
          <strong>हिंदी Voice Agent</strong>
          <span>{speechSupported ? "बोलकर app चलाएं" : "लिखकर command भेजें"}</span>
        </div>
      </div>
      <p>{response}</p>
      {commandText ? <span className="voice-last">आपने कहा: {commandText}</span> : null}
      <div className="voice-controls">
        <button className="icon-button primary" type="button" onClick={startListening}>
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
          {listening ? "सुन रहा हूं..." : "बोलें"}
        </button>
        <button className="icon-button" type="button" onClick={() => speakHindi(response)}>
          <Volume2 size={18} />
          सुनें
        </button>
      </div>
      <form
        className="voice-type-row"
        onSubmit={(event) => {
          event.preventDefault();
          handleCommand(commandText);
        }}
      >
        <input
          value={commandText}
          onChange={(event) => setCommandText(event.target.value)}
          placeholder="जैसे: फोटो डालनी है"
        />
        <button type="submit" aria-label="Command bhejein">
          <Send size={18} />
        </button>
      </form>
      <div className="voice-examples">
        {examples.map((example) => (
          <button key={example} type="button" onClick={() => handleCommand(example)}>
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
