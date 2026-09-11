const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

let lastPlayed = -1;

module.exports = {
  config: {
    name: "gojol",
    version: "2.0.0",
    author: "Mohammad 𝐀𝐊𝐀𝐒𝐇 x Saiful",
    role: 0,
    description: "Random gojol play",
    category: "music",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async ({ event, message }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;

    const gojolLinks = [
      "https://drive.google.com/uc?export=download&id=1l7tKijhgLBVGfD-ovopovrpQuQf_cExe",
      "https://drive.google.com/uc?export=download&id=1MWH-z11v1l7dF8WV0zb5Ff4A4BlxXOdU",
      "https://drive.google.com/uc?export=download&id=1rmiXxL22rx8sRESpGbrjAGYygmhGUWEB",
      "https://drive.google.com/uc?export=download&id=16I-3dKv5ZagXJ5uL1D_ulOu4fh-h2-3R",
      "https://drive.google.com/uc?export=download&id=1LQ7PI1Ef4tD8BGwM-c0VnEx-I7uyU2e-",
      "https://drive.google.com/uc?export=download&id=1sQFhLhvuhn5OmNjbllP808ELwtFAYL6D"
    ];

    let filePath = null;

    try {
      if (!gojolLinks.length) {
        return message.send("❌ কোনো গজল পাওয়া যায়নি!");
      }

      // একই গজল পরপর না দেওয়ার চেষ্টা
      let index;

      do {
        index = Math.floor(Math.random() * gojolLinks.length);
      } while (
        index === lastPlayed &&
        gojolLinks.length > 1
      );

      lastPlayed = index;

      const url = gojolLinks[index];

      // Processing reaction
      try {
        await message.reaction("⌛", messageID);
      } catch (e) {}

      await message.send(
        "🕌 | 𝗚𝗢𝗝𝗢𝗟 𝗟𝗢𝗔𝗗𝗜𝗡𝗚...\n" +
        "⏳ একটু অপেক্ষা করুন..."
      );

      // Cache folder তৈরি
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      filePath = path.join(
        cacheDir,
        `gojol_${Date.now()}_${index}.mp3`
      );

      // Google Drive থেকে download
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (!response.data) {
        throw new Error("Audio data পাওয়া যায়নি");
      }

      await fs.writeFile(filePath, response.data);

      // File আছে কিনা check
      const exists = await fs.pathExists(filePath);

      if (!exists) {
        throw new Error("Audio file তৈরি করা যায়নি");
      }

      const stat = await fs.stat(filePath);

      if (stat.size < 1000) {
        throw new Error(
          "Google Drive থেকে সঠিক audio file পাওয়া যায়নি"
        );
      }

      // Audio পাঠানো
      await message.send({
        body:
          "🕌✨ 𝗚𝗢𝗝𝗢𝗟 𝗙𝗢𝗥 𝗬𝗢𝗨 ✨🕌\n\n" +
          "🎵 একটি সুন্দর গজল আপনার জন্য 🤍\n\n" +
          "╭──────────────╮\n" +
          "   𝐈𝐒𝐋𝐀𝐌𝐈𝐂𝐊 𝐂𝐘𝐁𝐄𝐑 𝐂𝐇𝐀𝐓\n" +
          "╰──────────────╯",

        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("[GOJOL ERROR]", error);

      return message.send(
        "❌ | গজল পাঠানো যায়নি!\n\n" +
        "⚠️ " + (error.message || "Unknown error")
      );

    } finally {
      // কিছুক্ষণ পর cache file delete
      if (filePath) {
        setTimeout(async () => {
          try {
            if (await fs.pathExists(filePath)) {
              await fs.remove(filePath);
            }
          } catch (err) {
            console.error(
              "[GOJOL CLEANUP ERROR]",
              err.message
            );
          }
        }, 15000);
      }
    }
  }
};
