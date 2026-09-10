module.exports = {
  config: {
    name: "Shortvideo",
    aliases: ["shortvideo", "islamicvideo", "iv", "shortv"],
    version: "1.0.0",
    author: "Converted",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Random short/islamic video"
    },
    longDescription: {
      en: "Sends a short or islamic status video"
    },
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    // Currently only 1 working link remaining from the original pack
    const links = [
      "https://drive.google.com/uc?id=18FcBD5KB_4jLkvU191q-_2S3n33zdGxJ"
    ];

    const link = links[Math.floor(Math.random() * links.length)];
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, "Shortvideo.mp4");

    try {
      await fs.ensureDir(cacheDir);

      const response = await axios({
        url: link,
        method: "GET",
        responseType: "stream",
        timeout: 60000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: "🎬 Short / Islamic Video",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {}
        }
      );
    } catch (err) {
      console.error("Shortvideo error:", err.message || err);
      return api.sendMessage(
        "❌ ভিডিও লোড করতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};
