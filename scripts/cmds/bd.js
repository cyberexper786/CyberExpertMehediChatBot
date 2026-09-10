module.exports = {
  config: {
    name: "bd",
    aliases: ["sexvideo", "bdvideo", "svideo"],
    version: "1.0.0",
    author: "Converted",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Random 18+ video"
    },
    longDescription: {
      en: "Sends a random adult video"
    },
    category: "nsfw",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    const links = [
      "https://drive.google.com/uc?id=11-DAJbuvp78KowPBEsP-nP_ukGZPRaZW",
      "https://drive.google.com/uc?id=1189uVGqh2LCKb2LHmoPJrJ-VrGthBydZ",
      "https://drive.google.com/uc?id=11BymhX0TNEbtvSoRK8u52hfzdqjdlkqL",
      "https://drive.google.com/uc?id=11GmsStGJ0V0E8URgjwluMfAkHnxfnjox",
      "https://drive.google.com/uc?id=11M1LlRBGCSjSLDJ9sijBLkfOMW6T2EGi",
      "https://drive.google.com/uc?id=11QgjVOd2MWUn7YhJX_fJjbeqh1U5ZH5J",
      "https://drive.google.com/uc?id=11QMSvLBFAP9Iylug6svIL700Oz6JJf0r",
      "https://drive.google.com/uc?id=11Fxw7KjqJMFSAUq-8tzNvUmw5WZq9ymK",
      "https://drive.google.com/uc?id=11KrFcrBF9tUnGIX2aTlbBzBcvouZzvRe",
      "https://drive.google.com/uc?id=11NXhy4Jkdncdv1ZVeCejMfCFyXzDU0V4",
      "https://drive.google.com/uc?id=11weSOMAQScyo7aHDkVDgxnNvDSovO_ZV",
      "https://drive.google.com/uc?id=11xjsJnQYr5grlHMboxSLR0BUoVdxrZ_u",
      "https://drive.google.com/uc?id=127Xq-12UxZrp8x0kLmZBfVb0TILhVnC2",
      "https://drive.google.com/uc?id=12DpD0YRdPS4VgXIJcWzERUqtZRjmaoVj",
      "https://drive.google.com/uc?id=12T3dbV_CRRQl3_gDd_GhchdvrFl7RNqq",
      "https://drive.google.com/uc?id=12U6m8CqhHBYhR7pw5lSc59V7Zihoq__X",
      "https://drive.google.com/uc?id=12bKBo4O8MQpdMAT-CqLko9lwDTzMDrNu",
      "https://drive.google.com/uc?id=12VjO4v-2BKUGtAJ0tXZmX1p-j2g2qYt0",
      "https://drive.google.com/uc?id=12eBzB5FYhXHZNX8ES_rENF3LjEhGtPte",
      "https://drive.google.com/uc?id=12hvEPYGzTWLjLAwcMCb7jD3NVS1wmGcS"
    ];

    const link = links[Math.floor(Math.random() * links.length)];
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, "bd.mp4");

    try {
      await fs.ensureDir(cacheDir);

      const response = await axios({
        url: link,
        method: "GET",
        responseType: "stream",
        timeout: 90000,
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
          body: "🔥 BD Video",
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
      console.error("bd error:", err.message || err);
      return api.sendMessage(
        "❌ ভিডিও লোড করতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};
