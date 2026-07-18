const profileSeed = [
  {
    trendId: "@kp-manoj2704",
    nameHi: "मनोज सिंह",
    nameEn: "Manoj Singh",
    roleHi: "मुख्य एडमिन",
    areaHi: "कपूरपुर डिजिटल गैलरी",
    aboutHi: "गैलरी, यादों और गांव की डिजिटल जानकारी को संभालने वाला admin profile.",
    tags: ["admin", "gallery", "kapoorpur"],
  },
  {
    trendId: "@kp-memory",
    nameHi: "Kapoorpur Memory Team",
    nameEn: "Kapoorpur Memory Team",
    roleHi: "यादों की टीम",
    areaHi: "Memory Gallery",
    aboutHi: "पुरानी फोटो, कहानी, परिवार और गांव की यादों को संभालने वाली profile.",
    tags: ["memory", "photos", "stories"],
  },
  {
    trendId: "@kp-yuva",
    nameHi: "युवा मंडल",
    nameEn: "Youth Group",
    roleHi: "युवा समूह",
    areaHi: "चौपाल और कार्यक्रम",
    aboutHi: "गांव के कार्यक्रम, सेवा, खेल और digital कामों से जुड़ी profile.",
    tags: ["youth", "events", "service"],
  },
  {
    trendId: "@kp-kisan",
    nameHi: "किसान परिवार",
    nameEn: "Farming Families",
    roleHi: "खेती और फसल",
    areaHi: "कपूरपुर खेत",
    aboutHi: "खेती, फसल, बरसात और गांव की मेहनत से जुड़ी यादों की profile.",
    tags: ["farming", "harvest", "fields"],
  },
  {
    trendId: "@kp-school",
    nameHi: "विद्यालय परिवार",
    nameEn: "School Community",
    roleHi: "स्कूल और बच्चे",
    areaHi: "प्राथमिक विद्यालय",
    aboutHi: "स्कूल, पढ़ाई, खेल, बच्चों की उपलब्धियों और पुरानी school memories के लिए.",
    tags: ["school", "children", "education"],
  },
  {
    trendId: "@kp-mandir",
    nameHi: "मंदिर समिति",
    nameEn: "Temple Committee",
    roleHi: "मंदिर और संस्कृति",
    areaHi: "मुख्य मंदिर",
    aboutHi: "मंदिर, पूजा, मेला, त्योहार और गांव की संस्कृति से जुड़ी profile.",
    tags: ["temple", "festival", "culture"],
  },
  {
    trendId: "@kp-mahila",
    nameHi: "महिला समूह",
    nameEn: "Women's Group",
    roleHi: "महिला समूह",
    areaHi: "आंगनवाड़ी के पास",
    aboutHi: "बचत, शिक्षा, परिवार और गांव की मदद से जुड़ी महिलाओं की profile.",
    tags: ["women", "family", "help"],
  },
  {
    trendId: "@kp-buzurg",
    nameHi: "गांव के बुजुर्ग",
    nameEn: "Village Elders",
    roleHi: "बुजुर्ग और पुरानी बातें",
    areaHi: "चौपाल",
    aboutHi: "पुरानी कहानियां, सलाह, परिवार की यादें और गांव का इतिहास बताने वाली profile.",
    tags: ["elders", "history", "stories"],
  },
];

const knownIds = {
  "गांव के बुजुर्ग": "@kp-buzurg",
  "कपूरपुर परिवार": "@kp-parivar",
  "मंदिर समिति": "@kp-mandir",
  "गांव के बच्चे": "@kp-bachche",
  "किसान परिवार": "@kp-kisan",
  "पुरानी पीढ़ी": "@kp-puranipeedhi",
  "महिला समूह": "@kp-mahila",
  "गांववासी": "@kp-gaonwasi",
  "युवा मंडल": "@kp-yuva",
  "मोहल्ला परिवार": "@kp-mohalla",
  "किसान भाई": "@kp-kisanbhai",
  "विद्यालय परिवार": "@kp-school",
  "मेला समिति": "@kp-mela",
  "परिवार": "@kp-parivar",
  "पुराने किसान": "@kp-puranekisan",
  "पूर्व छात्र": "@kp-alumni",
  "सेवा समिति": "@kp-seva",
};

function fallbackTrendId(name, index) {
  return `@kp-profile-${String(index + 1).padStart(3, "0")}`;
}

export function getMyProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("kapoorpurMyProfile") || "null");
    if (saved?.trendId) return saved;
  } catch {
    // Ignore broken local data and create a new local profile.
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  const profile = {
    trendId: `@kp-${suffix}`,
    nameHi: "आपका प्रोफाइल",
    nameEn: "Your Profile",
    roleHi: "गांव सदस्य",
    areaHi: "कपूरपुर",
    aboutHi: "यह आपका local profile ID है। Firebase profile system जोड़ने पर इसे account से जोड़ा जा सकता है।",
    tags: ["local", "member"],
  };
  localStorage.setItem("kapoorpurMyProfile", JSON.stringify(profile));
  return profile;
}

export function buildProfiles(items) {
  const map = new Map();

  profileSeed.forEach((profile) => {
    map.set(profile.trendId, { ...profile, sourceCount: 0 });
  });

  items.forEach((item, index) => {
    if (!item.person) return;
    const trendId = knownIds[item.person] || fallbackTrendId(item.person, index);
    const existing = map.get(trendId);
    if (existing) {
      map.set(trendId, {
        ...existing,
        sourceCount: (existing.sourceCount || 0) + 1,
      });
      return;
    }

    map.set(trendId, {
      trendId,
      nameHi: item.person,
      nameEn: item.person,
      roleHi: "गांव profile",
      areaHi: item.location || "कपूरपुर",
      aboutHi: `${item.person} से जुड़ी यादें, फोटो और गांव की जानकारी यहां मिल सकती है।`,
      tags: [item.category, item.year, item.location].filter(Boolean),
      sourceCount: 1,
    });
  });

  return [...map.values()].sort((a, b) => a.trendId.localeCompare(b.trendId));
}
