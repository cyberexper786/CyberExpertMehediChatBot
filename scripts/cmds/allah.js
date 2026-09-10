const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "allah",
    version: "2.0.0",
    author: "Islamick Cyber Chat",
    countDown: 5,
    role: 0,
    shortDescription: "Allah GIF",
    longDescription: "Send a random Allah-themed GIF.",
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
    const filePath = path.join(cacheDir, "allah.gif");

    try {
      await fs.ensureDir(cacheDir);

      const randomLink =
        gifLinks[Math.floor(Math.random() * gifLinks.length)];

      const response = await axios({
        method: "GET",
        url: randomLink,
        responseType: "arraybuffer",
        timeout: 30000
      });

      await fs.writeFile(filePath, response.data);

      await message.reply({
        body:
          "•—»✨ [ 𝗔𝗹𝗹𝗮𝗵 𝗚𝗜𝗙 ] ✨«—•\n" +
          "•┄┅════❁🌺❁════┅┄•\n\n" +
          "✿┼─আল্লাহু আকবর┼─✿\n\n" +
          "•┄┅════❁🌺❁════┅┄•",
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("allah command error:", error);
      await message.reply(
        "❌ GIF পাঠানো সম্ভব হয়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
      );

    } finally {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      } catch (cleanupError) {
        console.error("allah cleanup error:", cleanupError);
      }
    }
  }
};
