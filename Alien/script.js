// ========== DATABASE ==========
let sessions = {};
let currentSessionId = null;

// ========== DICTIONARY ALIEN ==========
const alienDictionary = {
  a: "∀",
  b: "⨁",
  c: "∲",
  d: "⋒",
  e: "∃",
  f: "∇",
  g: "Ɣ",
  h: "Ħ",
  i: "I",
  j: "ɉ",
  k: "⫰",
  l: "˥",
  m: "Ɱ",
  n: "И",
  o: "Ø",
  p: "Ꭾ",
  q: "Ϙ",
  r: "Я",
  s: "Ƨ",
  t: "⊥",
  u: "∩",
  v: "Ʌ",
  w: "Ш",
  x: "Ж",
  y: "¥",
  z: "Ƹ",
};

const alienUpperCase = {
  A: "⚡",
  B: "₿",
  C: "⌘",
  D: "♢",
  E: "ℇ",
  F: "₣",
  G: "₲",
  H: "ℋ",
  I: "ℑ",
  J: "Ј",
  K: "Ҝ",
  L: "Ⱡ",
  M: "ℳ",
  N: "₦",
  O: "Ø",
  P: "℗",
  Q: "ℚ",
  R: "®",
  S: "Š",
  T: "Ţ",
  U: "Ü",
  V: "℣",
  W: "₩",
  X: "✗",
  Y: "Ý",
  Z: "Ž",
};

const alienNumbers = {
  0: "⚀",
  1: "➊",
  2: "➋",
  3: "➌",
  4: "➍",
  5: "➎",
  6: "➏",
  7: "➐",
  8: "➑",
  9: "➒",
};

const reverseAlienDict = {};
for (let key in alienDictionary) reverseAlienDict[alienDictionary[key]] = key;
for (let key in alienUpperCase) reverseAlienDict[alienUpperCase[key]] = key;
for (let key in alienNumbers) reverseAlienDict[alienNumbers[key]] = key;

// ========== FUNGSI UTAMA ==========

function translate(text, fromTo) {
  let result = "";
  if (fromTo === "humanToAlien") {
    for (let char of text) {
      const lowerChar = char.toLowerCase();
      if (/[a-z]/.test(char)) {
        result += alienDictionary[lowerChar] || char;
      } else if (char.toUpperCase() !== char.toLowerCase()) {
        result += alienUpperCase[char] || char;
      } else if (/[0-9]/.test(char)) {
        result += alienNumbers[char] || char;
      } else {
        result += char;
      }
    }
  } else {
    for (let char of text) {
      result += reverseAlienDict[char] || char;
    }
  }
  return result;
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");
  const mode = document.getElementById("translateMode").value;

  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");

  setTimeout(() => {
    const translated = translate(userText, mode);
    addMessage(translated, "bot");
    saveSessions();
  }, 600);

  input.value = "";
}

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;

  sessions[currentSessionId].messages.push({ sender, text });
}

// ========== SESSION HANDLING ==========

function createNewSession() {
  const id = "sesi-" + Date.now();
  sessions[id] = { name: `Sesi Baru`, messages: [] };
  currentSessionId = id;
  renderSessionList();
  clearChatbox();
}

function switchSession(sessionId) {
  if (currentSessionId && sessions[currentSessionId]) {
    saveSessions(); // Simpan sebelum ganti
  }
  currentSessionId = sessionId;
  loadSessionToChatbox();
}

function renameSession(id, newName) {
  if (sessions[id]) {
    sessions[id].name = newName;
    saveSessions();
    renderSessionList();
  }
}

function deleteSession(id) {
  if (confirm("Yakin ingin menghapus sesi ini?")) {
    delete sessions[id];
    if (currentSessionId === id) {
      currentSessionId = Object.keys(sessions)[0] || null;
      clearChatbox();
    }
    saveSessions();
    renderSessionList();
    if (currentSessionId) {
      loadSessionToChatbox();
    }
  }
}

function loadSessionToChatbox() {
  const chatbox = document.getElementById("chatbox");
  chatbox.innerHTML = "";
  const session = sessions[currentSessionId];
  if (session && session.messages) {
    session.messages.forEach((msg) => {
      addMessage(msg.text, msg.sender);
    });
  }
}

function renderSessionList() {
  const container = document.getElementById("sessionList");
  container.innerHTML = "";

  for (let id in sessions) {
    const div = document.createElement("div");
    div.className = `session-item ${id === currentSessionId ? "active" : ""}`;
    div.onclick = () => {
      switchSession(id);
      renderSessionList();
    };

    const input = document.createElement("input");
    input.type = "text";
    input.value = sessions[id].name;
    input.onclick = (e) => e.stopPropagation();
    input.onchange = (e) => renameSession(id, e.target.value);

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "🗑️";
    btnDelete.title = "Hapus sesi";
    btnDelete.style.marginLeft = "5px";
    btnDelete.style.fontSize = "12px";
    btnDelete.style.padding = "2px 5px";
    btnDelete.style.backgroundColor = "#ff4d4d";
    btnDelete.style.border = "none";
    btnDelete.style.color = "white";
    btnDelete.style.borderRadius = "4px";
    btnDelete.onclick = (e) => {
      e.stopPropagation();
      deleteSession(id);
    };

    div.appendChild(input);
    div.appendChild(btnDelete);
    container.appendChild(div);
  }
}

function saveSessions() {
  localStorage.setItem("chatbot_sessions", JSON.stringify(sessions));
}

function loadSessionsFromStorage() {
  const stored = localStorage.getItem("chatbot_sessions");
  if (stored) {
    sessions = JSON.parse(stored);
    if (Object.keys(sessions).length === 0) {
      createNewSession();
    } else {
      currentSessionId = Object.keys(sessions)[0];
    }
  } else {
    sessions = {};
    createNewSession();
  }
  renderSessionList();
  loadSessionToChatbox();
}

// ========== EXPORT & IMPORT SESI ==========

function exportCurrentSession() {
  const session = sessions[currentSessionId];
  const dataStr = JSON.stringify(session, null, 2);
  downloadFile(
    dataStr,
    `${session.name || "sesi"}-alien-chat.json`,
    "application/json"
  );
}

function exportAllSessions() {
  const dataStr = JSON.stringify(sessions, null, 2);
  downloadFile(dataStr, "semua-sesi-alien-chat.json", "application/json");
}

function importSessions(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedSessions = JSON.parse(e.target.result);

      // Validasi format JSON
      const isValidFormat = Object.values(importedSessions).every(
        (session) =>
          session.hasOwnProperty("name") && session.hasOwnProperty("messages")
      );

      if (!isValidFormat) {
        alert("⚠️ Format file tidak valid. Harus berupa sesi chatbot.");
        return;
      }

      // Timpa semua sesi yang ada dengan yang diimpor
      sessions = importedSessions;
      currentSessionId = Object.keys(sessions)[0];

      saveSessions();
      renderSessionList();
      loadSessionToChatbox();

      alert("✅ Berhasil mengimpor semua sesi!");
    } catch (err) {
      alert(
        "❌ Gagal membaca file. Pastikan ini adalah file export chatbot yang benar."
      );
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function downloadFile(text, filename, type) {
  const a = document.createElement("a");
  const file = new Blob([text], { type });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ========== THEME HANDLING ==========

const themes = [
  "default",
  "lightBlue",
  "dark",
  "neon",
  "pastel",
  "cyberpunk",
  "sunset",
  "forest",
  "ocean",
  "violet",
  "coral",
  "gold",
  "mint",
  "cherry",
  "midnight",
  "retro",
  "tropical",
  "lavender",
  "coffee",
  "space",
];

window.addEventListener("DOMContentLoaded", () => {
  loadSessionsFromStorage();

  const savedTheme = localStorage.getItem("chatbotTheme") || "default";
  document.getElementById("themeSelector").value = savedTheme;
  applyTheme(savedTheme);
});

function applyTheme(themeName) {
  themes.forEach((t) => document.body.classList.remove(`theme-${t}`));
  document.body.classList.add(`theme-${themeName}`);
  localStorage.setItem("chatbotTheme", themeName);
}

document
  .getElementById("themeSelector")
  .addEventListener("change", function () {
    applyTheme(this.value);
  });

// ========== UTILITIES ==========

function clearChatbox() {
  document.getElementById("chatbox").innerHTML = "";
}
