const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "allah",
    version: "2.1.0",
    author: "Islamick Cyber Chat",
    countDown: 5,
    role: 0,
    shortDescription: "Allah GIF",
    longDescription: "Send an Islamic Allah-themed GIF.",
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const gifLinks = [
      "https://i.imgur.com/7zLmJch.gif",
      "https://i.imgur.com/U07Yd3U.gif",
      "https://i.imgur.com/DHoZ9A1.gif",
      "https://i.imgur.com/oV4VMvm.gif",
      "https://i.imgur.com/ScGCmKE.gif",
      "https://i.imgur.com/r0ZE7lx.gif",
      "https://i.imgur.com/C2a3Cj3.gif",
      "https://i.imgur.com/98PjVxg.gif",
      "https://i.imgur.com/LvUF38x.gif",
      "https://i.imgur.com/2eewmJm.gif"
    ];

    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(
      cacheDir,
      `allah-${Date.now()}.gif`
    );

    const text =
      "•┄┅════❁🌺❁════┅┄•\n\n" +
      "        🕌 𝗔𝗹𝗹𝗮𝗵 𝗚𝗜𝗙 🕌\n\n" +
      "      ✿┼─ 𝗔𝗹𝗹𝗮𝗵𝘂 𝗔𝗸𝗯𝗮𝗿 ─┼✿\n\n" +
      "•┄┅════❁🌺❁════┅┄•";

    try {
      await fs.ensureDir(cacheDir);

      let downloaded = false;

      for (const url of gifLinks) {
        try {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 20000,
            maxRedirects: 5,
            headers: {
              "User-Agent": "Mozilla/5.0"
            }
          });

          const type = String(
            response.headers["content-type"] || ""
          );

          if (
            !type.includes("gif") ||
            !response.data ||
            response.data.length < 1000
          ) {
            continue;
          }

          await fs.writeFile(filePath, response.data);
          downloaded = true;
          break;

        } catch (err) {
          console.error(
            "GIF download failed:",
            url,
            err.message
          );
        }
      }

      if (!downloaded) {
        return await message.reply(
          text +
          "\n\n🤲 𝗔𝗹𝗹𝗮𝗵 আমাদের সবাইকে হেদায়েত দান করুন।"
        );
      }

      await message.reply({
        body: text,
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("allah command error:", error);

      try {
        await message.reply(
          "🕌 𝗔𝗹𝗹𝗮𝗵𝘂 𝗔𝗸𝗯𝗮𝗿 🤲\n\n" +
          "আল্লাহ আমাদের সবাইকে ঈমান ও হেদায়েত দান করুন।"
        );
      } catch (replyError) {
        console.error(
          "Fallback reply error:",
          replyError
        );
      }

    } finally {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      } catch (cleanupError) {
        console.error(
          "Cache cleanup error:",
          cleanupError
        );
      }
    }
  }
};
