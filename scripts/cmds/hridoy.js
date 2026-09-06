const axios = require("axios");

const cooldowns = new Map();

const adminUID = ["61594324973630", "61583147223219"];

module.exports = {
  config: {
    name: "hridoy",
    version: "1.4.2",
    author: "Hridoy",
    role: 0,
    category: "Admin",
    shortDescription: "Auto profile reply with keyword + admin mention",
    countDown: 3
  },

  onStart: async function () {
    return;
  },

  onChat: async function ({ event, api }) {
    if (event.senderID === api.getCurrentUserID()) return;

    const msg = (event.body || "").toLowerCase();

  
    const isKeyword = msg.includes("mehedi");

    const isAdminMention =
      !!event.mentions &&
      adminUID.some((id) => Object.keys(event.mentions).includes(id));

    if (!isKeyword && !isAdminMention) return;

    const threadID = event.threadID;
    const now = Date.now();
    const cooldownMs = (module.exports.config.countDown || 3) * 1000;

    if (
      cooldowns.has(threadID) &&
      now - cooldowns.get(threadID) < cooldownMs
    ) {
      return;
    }

    cooldowns.set(threadID, now);

    const imageUrl = "https://i.imgur.com/uBE4UDM.jpeg";

    const body =
`✦━━━━━━〔 𝑷𝑹𝑶𝑭𝑰𝑳𝑬 〕━━━━━━✦
✨ NAME   ➤ ᴍᴇʜᴇᴅɪ ᴋʜᴀɴ
✨ AGE    ➤ 22+
✨ STATUS ➤ sɪɴɢʟᴇ
✨ LOC    ➤ ɢᴀᴢɪᴘᴜʀ ᴅʜᴀᴋᴀ

✦━━━━━━━〔 𝑺𝑶𝑪𝑰𝑨𝑳〕━━━━━━━✦
🌐 FB   ➤ fb.me/https://Mehedi.Choudhury31
📧 MAIL ➤ mehediprojectofficial@gmail.com
📱 WA   ➤ 01408320931

✦━━━━━━━━〔 𝑮𝑨𝑴𝑬〕━━━━━━━✦
🔫    ᴍᴀɪsʜᴀ

✦━━━━━━━━━━━━━━━━━━━━✦
⚡ SYSTEM STATUS : ᴍᴇʜᴇᴅɪ`;

    try {
      const img = await axios.get(imageUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      return api.sendMessage(
        {
          body,
          attachment: img.data
        },
        threadID,
        event.messageID
      );

    } catch (err) {
      return api.sendMessage(
        body + "\n\n❌ Image load failed!",
        threadID,
        event.messageID
      );
    }
  }
};
