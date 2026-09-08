const axios = require("axios");

const toru = (
  process.env.HRIDoy_API_URL ||
  process.env.TORU_API_URL ||
  "https://hridoy-api.onrender.com"
).replace(/\/+$/, "");

const TORU_SECRET = process.env.TORU_BOT_SECRET || "";
const MATCH_THRESHOLD = 0.7;

// ---- Admin-only access for sensitive commands ----
const ADMIN_IDS = ["61594324973630"];
const isAdmin = (senderID) => ADMIN_IDS.includes(String(senderID));
const NOT_ADMIN_MSG = "❌ Etoh command shudhu admin er jonno.";

const typingWhile = async (api, threadID, workPromise) => {
  try {
    if (typeof api.sendTypingIndicator === "function") {
      Promise.resolve(api.sendTypingIndicator(threadID, true)).catch(() => {});
    }
  } catch {}

  const result = await workPromise;

  try {
    if (typeof api.sendTypingIndicator === "function") {
      Promise.resolve(api.sendTypingIndicator(threadID, false)).catch(() => {});
    }
  } catch {}

  return result;
};

const flashTyping = (api, threadID) => {
  try {
    if (typeof api.sendTypingIndicator === "function") {
      api.sendTypingIndicator(threadID, true);
      setTimeout(() => {
        try { api.sendTypingIndicator(threadID, false); } catch {}
      }, 500);
    }
  } catch {}
};

const spamMap = new Map();
const SPAM_LIMIT = 7;
const SPAM_WINDOW = 10000;
const SPAM_MUTE = 10000;
const SPAM_ENTRY_TTL = 5 * 60 * 1000;

let selfCooldownUntil = 0;
const SELF_COOLDOWN_MS = 6000;

const selfTriggerAllowed = () => Date.now() >= selfCooldownUntil;
const markSelfTrigger = () => { selfCooldownUntil = Date.now() + SELF_COOLDOWN_MS; };

const isSpamming = (senderID) => {
  const now = Date.now();

  if (spamMap.size > 500) {
    for (const [id, e] of spamMap) {
      const lastHit = e.hits.length ? e.hits[e.hits.length - 1] : 0;
      if (e.mutedUntil < now && now - lastHit > SPAM_ENTRY_TTL) {
        spamMap.delete(id);
      }
    }
  }

  const entry = spamMap.get(senderID) || { hits: [], mutedUntil: 0 };

  if (entry.mutedUntil > now) return true;

  entry.hits = entry.hits.filter(t => now - t < SPAM_WINDOW);
  entry.hits.push(now);

  if (entry.hits.length >= SPAM_LIMIT) {
    entry.mutedUntil = now + SPAM_MUTE;
    entry.hits = [];
    spamMap.set(senderID, entry);
    return true;
  }

  spamMap.set(senderID, entry);
  return false;
};

function isUsable(text, prefix) {
  if (!text || typeof text !== "string") return false;

  const trimmed = text.trim();

  if (!trimmed) return false;
  if (prefix && trimmed.startsWith(prefix)) return false;
  if (trimmed.length > 500) return false;

  return true;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

function similarity(a, b) {
  const x = (a || "").toLowerCase().trim();
  const y = (b || "").toLowerCase().trim();

  if (!x.length && !y.length) return 1;

  const maxLen = Math.max(x.length, y.length);
  if (maxLen === 0) return 1;

  return 1 - levenshtein(x, y) / maxLen;
}

async function findBestMatch(query) {
  try {
    const res = await axios.get(
      `${toru}/api/qa`,
      { params: { search: query }, timeout: 12000 }
    );

    const items = Array.isArray(res.data)
      ? res.data
      : (res.data?.data || []);

    let best = null;
    let bestScore = 0;

    for (const it of items) {
      const score = similarity(query, it.question);
      if (score > bestScore) {
        bestScore = score;
        best = it;
      }
    }

    return best ? { item: best, score: bestScore } : null;
  } catch {
    return null;
  }
}

async function autoLearnFromReply(question, answer) {
  try {
    await axios.post(
      `${toru}/api/learn`,
      { question, answer, secret: TORU_SECRET },
      { timeout: 12000, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(
      "Baby auto-learn gateway error:",
      err.response?.data?.error || err.response?.data?.message || err.message
    );
  }
}

let autoTeachCache = { enabled: true, ts: 0 };
const AUTOTEACH_CACHE_TTL = 5 * 60 * 1000;

async function isAutoTeachEnabled() {
  const now = Date.now();
  if (now - autoTeachCache.ts < AUTOTEACH_CACHE_TTL) {
    return autoTeachCache.enabled;
  }

  try {
    const res = await axios.get(`${toru}/api/status`, { timeout: 8000 });
    const enabled = !!res.data?.autoTeach;
    autoTeachCache = { enabled, ts: now };
    return enabled;
  } catch {
    return autoTeachCache.enabled;
  }
}

async function getSmartReply(query, threadID) {
  const match = await findBestMatch(query);

  if (match && match.score >= MATCH_THRESHOLD) {
    return match.item.answer;
  }

  try {
    const res = await axios.post(
      `${toru}/api/chat`,
      { message: query, sessionId: `fb-${threadID}` },
      { timeout: 20000 }
    );

    return res.data?.reply || "Hmm, bujhi nai baby 😅";
  } catch (err) {
    console.error(
      "Baby chat gateway error:",
      err.response?.data?.error || err.response?.data?.message || err.message
    );
    return "❌ Ekhon connect korte parchi na, ektu pore try koro baby 😔";
  }
}

const PREFIX_TRIGGERS = [ "toru","bby","toruchan","tori","bot","তরু","বট","jan","জান","বেবি","baby"
];

function matchPrefix(raw) {
  for (const p of PREFIX_TRIGGERS) {
    if (raw === p) return p;
    if (raw.startsWith(p + " ")) return p + " ";
  }
  return null;
}

const FUNNY_REPLIES = [
  "𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮 𝐰𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ♥",
  "── চুনা ও চুনা আমার বস মেহেদি র এর হবু বউ মাইশা কে দেকছো তাকে খুজে পাচ্ছি না...!!🥹❤️‍🩹🌷",
  "── 𝐁𝐨𝐥𝐨 𝐣𝐚𝐧 𝐤𝐢 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐫𝐢 𝐭𝐨𝐦𝐫 𝐣𝐨𝐧𝐧𝐨 🐸",
  "── Bolo Babu তুমি কি আমার বস মেহেদি কে ভালোবাসো...!!🙈💋",
  "── oii-🥺🥹-এক🥄 চামুচ ভালোবাসা দিবা-🤏🏻🙂",
  "ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম...?😦🙂🌻",
  "── 𝐋𝐞𝐦𝐨𝐧 𝐭𝐮𝐬 🍋",
  "── বস মেহেদি 𝕭𝖔𝖙 হাজির-))😎🌷🫶",
  "𝐚𝐦𝐤𝐞 𝐬𝐞𝐫𝐞 𝐝𝐞𝐰 𝐚𝐦𝐢 𝐚𝐦𝐦𝐮𝐫 𝐤𝐚𝐬𝐞 𝐣𝐚𝐛𝐨!!🥺...😗",
  "── অন্যকে নই, নিজেকে ভালোবাসতে শিখো প্রিয় 😌",
  "একা বাঁচতে শিখো দেখবে পৃথিবী অনেক সুন্দর...!✨",
  "──‎ 𝐇𝐮𝐌...!! 👉👈",
  "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🐸",
  "── কি হলো, মিস টিস করচ্ছো নাকি 🤣",
  "𝐓𝐫𝐮𝐬𝐭 𝐦𝐞 𝐢𝐚𝐦 𝐭𝐨𝐫𝐮 𝐟𝐫𝐨𝐦 ᴍ𝐄ʜ𝐄ᴅ𝐈🧃",
  "── তাহলে আমার কথা মনে হলো তোর ))🥺🙆‍♀️",
  "𝐓𝐨𝐫 𝐣𝐧𝐧𝐨 𝐛𝐬𝐢 𝐚𝐜𝐡𝐢, 𝐣𝐥𝐝𝐢 𝐛𝐨𝐥 𝐤𝐢 𝐝𝐫𝐤𝐚𝐫 ✨",
  "── একাকিত্ব মানুষকে ধীরে ধীরে শেষ করে ফেলে🥀",
  "চা খাবেন ,ঢেলে দেবো...?😙🤏",
  "── আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না___🙄"
];

module.exports = {
  config: {
    name: "babyai",
    version: "2.6.0",
    author: "Hridoy",
    countDown: 0,
    role: 0,
    shortDescription: "Toru Chan AI — HR ID OY Gateway",
    longDescription:
      "Teachable TORU AI with fuzzy-match replies, noprefix chat, and admin-only manage commands.",
    category: "System",
    dependencies: {
      axios: ""
    },
    aliases: [
      "babyteach",
      "babyautoteach",
      "babylist",
      "babyreply",
      "babymsg"
    ],
    guide: {
      en:
        "{p}baby [message]\n" +
        "{p}babyteach [q] - [a]\n" +
        "{p}babyautoteach on/off  (admin only)\n" +
        "{p}babylist\n" +
        "{p}babylist [text]  (numbered search results)\n" +
        "{p}babyreply [text]  (searches inside all replies)\n" +
        "{p}babymsg [trigger]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();
    const isSelf = senderID === botID;

    if (isSelf) {
      if (!selfTriggerAllowed()) return;
      markSelfTrigger();
    }

    if (isSpamming(senderID)) return;

    const threadID = event.threadID;

    const prefix =
      (global.GoatBot && global.GoatBot.config && global.GoatBot.config.prefix) || "";

    let bodyText = (event.body || "").trim();
    if (prefix && bodyText.toLowerCase().startsWith(prefix.toLowerCase())) {
      bodyText = bodyText.slice(prefix.length).trim();
    }
    const lowerBody = bodyText.toLowerCase();

    const stripKeyword = (kw) => {
      if (lowerBody === kw) return "";
      if (lowerBody.startsWith(kw + " ")) return bodyText.slice(kw.length).trim();
      return null;
    };

    const KEYWORD_ORDER = [
      ["autoteach", "babyautoteach"],
      ["teach", "babyteach"],
      ["list", "babylist"],
      ["reply", "babyreply"],
      ["msg", "babymsg"]
    ];

    let sub = null;
    let rawArgs = "";

    for (const [name, kw] of KEYWORD_ORDER) {
      const r = stripKeyword(kw);
      if (r !== null) {
        sub = name;
        rawArgs = r;
        break;
      }
    }

    if (sub === null) {
      const r = stripKeyword("baby");
      rawArgs = r !== null ? r : (args.join(" ").trim() || bodyText);
    }

    try {
      if (!sub && !rawArgs) {
        flashTyping(api, threadID);

        return message.reply(
          FUNNY_REPLIES[Math.floor(Math.random() * FUNNY_REPLIES.length)]
        );
      }

      if (sub === "autoteach") {
        if (!isAdmin(senderID)) {
          return message.reply(NOT_ADMIN_MSG);
        }

        const mode = (rawArgs.split(/\s+/)[0] || "").toLowerCase();

        if (!["on", "off"].includes(mode)) {
          return message.reply("Use: babyautoteach on/off");
        }

        const status = mode === "on";

        const res = await axios.post(
          `${toru}/api/setting`,
          { autoTeach: status, secret: TORU_SECRET },
          { timeout: 12000 }
        );

        if (!res.data?.success) {
          return message.reply(
            res.data?.error || res.data?.message || "❌ Change kora jayni."
          );
        }

        autoTeachCache = { enabled: status, ts: Date.now() };

        return message.reply(`✅ Auto Teach ekhon ${status ? "ON 🟢" : "OFF 🔴"}`);
      }

      if (sub === "list") {
        const query = rawArgs.trim();

        if (!query) {
          const res = await axios.get(`${toru}/api/status`, { timeout: 12000 });
          const d = res.data || {};

          return message.reply(
`╭─╼🌟 𝐓𝐨𝐫𝐮 𝐀𝐈 𝐒𝐭𝐚𝐭𝐮𝐬
├ 📝 𝐓𝐞𝐚𝐜𝐡𝐞𝐝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬: ${d.teachedQuestions || 0}
├ 📦 𝐒𝐭𝐨𝐫𝐞𝐝 𝐑𝐞𝐩𝐥𝐢𝐞𝐬: ${d.storedReplies || 0}
├ 🔁 𝐀𝐮𝐭𝐨 𝐓𝐞𝐚𝐜𝐡: ${d.autoTeach ? "ON 🟢" : "OFF 🔴"}
╰─╼👤 𝐃𝐞𝐯: ${d.developer || "Toru"}`
          );
        }

        const res = await axios.get(
          `${toru}/api/qa`,
          { params: { search: query }, timeout: 12000 }
        );

        const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        if (!items.length) {
          return message.reply("❌ Ei text er kono answer paoa jayni.");
        }

        const limited = items.slice(0, 15);
        const formatted = limited
          .map((it, i) => `➤ ${i + 1}. [${it.question}] → ${it.answer}`)
          .join("\n");

        const listText =
`📌 𝗦𝗲𝗮𝗿𝗰𝗵: ${query}
📋 𝗧𝗼𝘁𝗮𝗹: ${items.length}
━━━━━━━━━━━━━━
${formatted}`;

        return message.reply(listText);
      }

      if (sub === "reply") {
        const query = rawArgs.trim();

        if (!query) {
          return message.reply("Use: babyreply [text]");
        }

        const res = await axios.get(
          `${toru}/api/qa`,
          { params: { search: "" }, timeout: 12000 }
        );

        const allItems = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const q = query.toLowerCase();
        const items = allItems.filter(it =>
          String(it.answer || "").toLowerCase().includes(q)
        );

        if (!items.length) {
          return message.reply("❌ Ei text shoho kono reply paoa jayni.");
        }

        const limited = items.slice(0, 15);
        const formatted = limited
          .map((it, i) => `➤ ${i + 1}. [${it.question}] → ${it.answer}`)
          .join("\n");

        const replyText =
`📌 𝗥𝗲𝗽𝗹𝘆 𝗦𝗲𝗮𝗿𝗰𝗵: ${query}
📋 𝗧𝗼𝘁𝗮𝗹: ${items.length}
━━━━━━━━━━━━━━
${formatted}`;

        return message.reply(replyText);
      }

      if (sub === "msg") {
        const trigger = rawArgs.trim();

        if (!trigger) {
          return message.reply("Use: babymsg [trigger]");
        }

        const res = await axios.get(
          `${toru}/api/qa`,
          { params: { search: trigger }, timeout: 12000 }
        );

        const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);

        if (!items.length) {
          return message.reply("❌ Ei trigger-er kono answer paoa jayni.");
        }

        const formatted = items
          .slice(0, 15)
          .map((it, i) => `➤ ${i + 1}. [${it.question}] → ${it.answer}`)
          .join("\n");

        return message.reply(
`📌 𝗧𝗿𝗶𝗴𝗴𝗲𝗿: ${trigger}
📋 𝗧𝗼𝘁𝗮𝗹: ${items.length}
━━━━━━━━━━━━━━
${formatted}`
        );
      }

      if (sub === "teach") {
        const parts = rawArgs.split(" - ");

        if (parts.length < 2) {
          return message.reply("Use: babyteach question - answer");
        }

        const [ask, ans] = parts.map(s => s.trim());

        const res = await axios.post(
          `${toru}/api/teach`,
          { question: ask, answer: ans, secret: TORU_SECRET },
          { timeout: 12000 }
        );

        return message.reply(
          res.data?.success
            ? "✅ Shekhano hoyeche!"
            : (res.data?.error || res.data?.message || "❌ Vul hoyeche.")
        );
      }

      const reply = await typingWhile(api, threadID, getSmartReply(rawArgs, threadID));
      return message.reply(reply);

    } catch (err) {
      console.error(
        "baby command error:",
        err.response?.data?.error || err.response?.data?.message || err.message
      );

      return message.reply(
        "❌ Error: " + (err.response?.data?.error || err.response?.data?.message || err.message)
      );
    }
  },

  onChat: async function ({ api, event, message }) {
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();
    const isSelf = senderID === botID;

    if (isSpamming(senderID)) return;

    const prefix =
      (global.GoatBot && global.GoatBot.config && global.GoatBot.config.prefix) || "";

    const raw = event.body ? event.body.toLowerCase().trim() : "";
    const threadID = event.threadID;

    try {
      const repliedToBot =
        event.messageReply && event.messageReply.senderID === botID;

      if (!isSelf && event.messageReply && !repliedToBot) {
        const question = event.messageReply.body;
        const answer = event.body;

        if (
          isUsable(question, prefix) &&
          isUsable(answer, prefix) &&
          (await isAutoTeachEnabled())
        ) {
          await autoLearnFromReply(question.trim(), answer.trim());
        }
      }

      if (!isSelf && repliedToBot && isUsable(event.body, prefix)) {
        const reply = await typingWhile(api, threadID, getSmartReply(event.body.trim(), threadID));
        return message.reply(reply);
      }

      if (!raw) return;

      const foundPrefix = matchPrefix(raw);

      if (foundPrefix) {
        if (isSelf) {
          if (!selfTriggerAllowed()) return;
          markSelfTrigger();
        }

        const q = event.body.slice(foundPrefix.length).trim();

        if (!q) {
          flashTyping(api, threadID);
          return message.reply(
            FUNNY_REPLIES[Math.floor(Math.random() * FUNNY_REPLIES.length)]
          );
        }

        const reply = await typingWhile(api, threadID, getSmartReply(q, threadID));
        return message.reply(reply);
      }
    } catch (err) {
      console.error(
        "baby onChat error:",
        err.response?.data?.error || err.response?.data?.message || err.message
      );
    }
  }
};
