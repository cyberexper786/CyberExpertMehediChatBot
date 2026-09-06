const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.3.3",
    author: "Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    role: 0,
    shortDescription: "Owner information with video",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText =
`╭─ 👑 Oᴡɴᴇʀ Iɴғᴏ 👑 ─╮
│ 👤 Nᴀᴍᴇ       : ᴍᴇʜᴇᴅɪ ᴋʜᴀɴ
│ 🧸 Nɪᴄᴋ       : ᴍᴀɪsʜᴀ
│ 🎂 Aɢᴇ        : 22+
│ 💘 Rᴇʟᴀᴛɪᴏɴ : 𝐒𝐢𝐧𝐠𝐥𝐞
│ 🎓 Pʀᴏғᴇssɪᴏɴ : 𝐒𝐭𝐮𝐝𝐞𝐧𝐭
│ 📚 Eᴅᴜᴄᴀᴛɪᴏɴ : 𝐈𝐧𝐭𝐞𝐫 2𝐧ᴅ 𝐘ᴇᴀʀ
│ 🏡 Lᴏᴄᴀᴛɪᴏɴ : 𝐃𝐡𝐚𝐤𝐚 - 𝐆𝐚𝐳𝐢𝐩𝐮𝐫
├─ 🔗 Cᴏɴᴛᴀᴄᴛ ─╮
│ 📘 Facebook  : 𝐰𝐰𝐰:/𝐌𝐞𝐡𝐞𝐝𝐢.𝐂𝐡𝐨𝐰𝐝𝐡𝐮𝐫𝐲
│ 💬 Messenger : 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤:/𝐌𝐞𝐡𝐞𝐝𝐢.𝐊𝐡𝐚𝐧
│ 📞 WhatsApp  : 𝐰𝐡𝐚𝐭:/01408528939
╰────────────────╯`;

    const videoLink = "https://files.catbox.moe/5a1a1n.mp4";

    try {
      const stream = await global.utils.getStreamFromURL(videoLink);

      api.sendMessage(
        {
          body: ownerText,
          attachment: stream
        },
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ ভিডিও লোড করা যায়নি। লিংক চেক করো।", event.threadID, event.messageID);
    }
  }
};
