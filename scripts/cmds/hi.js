module.exports.config = {
  name: "hi",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "MrTomXxX (fixed & converted by Claude)",
  description: "Auto reply when someone greets in the thread",
  commandCategory: "noprefix",
  usages: "hi/on/off",
  cooldowns: 0,
  dependencies: {}
};

module.exports.langs = {
  vi: {
    on: "Bật",
    off: "Tắt",
    successText: "chế độ chào hỏi %1 thành công"
  },
  en: {
    on: "on",
    off: "off",
    successText: "greeting mode turned %1 successfully"
  }
};

// Toggle command: user types the prefix command to turn this on/off per thread
module.exports.run = async function ({ api, event, Threads, getLang }) {
  const { threadID, messageID } = event;
  const threadData = await Threads.getData(threadID);
  const data = threadData.data || {};

  data["hi"] = !(data["hi"] === undefined ? true : data["hi"]);

  await Threads.setData(threadID, { data });

  const state = data["hi"] === false ? getLang("off") : getLang("on");
  return api.sendMessage(getLang("successText", state), threadID, messageID);
};

// Passive listener: fires on every message, checks for a greeting
module.exports.handleEvent = async ({ event, api, Users, Threads }) => {
  try {
    const { threadID, messageID, body, senderID } = event;
    if (!body || typeof body !== "string") return;
    if (senderID == api.getCurrentUserID()) return;

    const threadData = await Threads.getData(threadID);
    const data = threadData.data || {};
    if (data["hi"] === false) return; // feature turned off in this thread

    const greetings = ["hi", "hello", "low", "hey", "loe", "hii", "hai", "yow", "yo", "hi po", "hoy", "uy"];
    const normalized = body.trim().toLowerCase();
    if (!greetings.includes(normalized)) return;

    const name = await Users.getNameUser(senderID);

    let attachment;
    try {
      const axios = global.nodemodule["axios"];
      const res = await axios.get("https://apilucy.khoahoang3.repl.co", { timeout: 5000 });
      const imageUrl = res && res.data && res.data.data;
      if (imageUrl) {
        const imgRes = await axios({ url: imageUrl, method: "GET", responseType: "stream", timeout: 8000 });
        attachment = imgRes.data;
      }
    } catch (apiErr) {
      // API is down or slow — fall back to a text-only reply instead of crashing
      attachment = undefined;
    }

    const msg = {
      body: `Hi ${name}, have a nice day`,
      ...(attachment ? { attachment } : {})
    };

    api.sendMessage(msg, threadID, (err) => {
      if (!err) {
        api.setMessageReaction("❤️", messageID, () => {}, true);
      }
    }, messageID);
  } catch (err) {
    console.error("[hi.js] handleEvent error:", err.message);
  }
};
