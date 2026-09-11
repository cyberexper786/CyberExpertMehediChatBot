const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "xxxx",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Shaon Ahmed | Fixed",
  description: "Random Video",
  commandCategory: "Media",
  usages: "xxxx",
  cooldowns: 5,
  dependencies: {
    axios: "",
    "fs-extra": ""
  }
};

module.exports.onStart = async function ({ api, event }) {
  const cacheDir = path.join(__dirname, "cache");

  const videos = [
    "https://i.imgur.com/pUOPuKf.mp4",
    "https://i.imgur.com/pRNyjYD.mp4",
    "https://i.imgur.com/XNQw8cn.mp4",
    "https://i.imgur.com/2KsDdU4.mp4",
    "https://i.imgur.com/ennaKUA.mp4",
    "https://i.imgur.com/8vPmqUR.mp4",
    "https://i.imgur.com/GNK65ri.mp4",
    "https://i.imgur.com/ClrTRJw.mp4",
    "https://i.imgur.com/xqsVEeN.mp4",
    "https://i.imgur.com/IBhrNeD.mp4",
    "https://i.imgur.com/bAWVhqp.mp4",
    "https://i.imgur.com/gdItVd7.mp4",
    "https://i.imgur.com/7bBtthV.mp4",
    "https://i.imgur.com/onk8KSx.mp4",
    "https://i.imgur.com/fYkr2Hs.mp4",
    "https://i.imgur.com/u7j9AQ8.mp4",
    "https://i.imgur.com/JWSpzMC.mp4",
    "https://i.imgur.com/Ir75YbV.mp4",
    "https://i.imgur.com/y3kNkLi.mp4",
    "https://i.imgur.com/OC6q2MG.mp4",
    "https://i.imgur.com/3Ed9bF2.mp4",
    "https://i.imgur.com/HKRCx2A.mp4",
    "https://i.imgur.com/onUb64n.mp4"
  ];

  const url = videos[Math.floor(Math.random() * videos.length)];

  const filePath = path.join(
    cacheDir,
    `xxxx_${Date.now()}.mp4`
  );

  try {
    await fs.ensureDir(cacheDir);

    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 90000,
      maxRedirects: 10,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", resolve);
      writer.on("error", reject);
      response.data.on("error", reject);
    });

    if (!(await fs.pathExists(filePath))) {
      throw new Error("Video download failed");
    }

    const stats = await fs.stat(filePath);

    if (stats.size < 10000) {
      throw new Error("Invalid video file");
    }

    await api.sendMessage(
      {
        body: "🎀 ━━━ VIDEO ━━━ 🎀\n\n✨ Enjoy the video 💗",
        attachment: fs.createReadStream(filePath)
      },
      event.threadID
    );

    setTimeout(async () => {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      } catch (e) {
        console.log("Cache delete error:", e.message);
      }
    }, 10000);

  } catch (error) {
    console.error("XXXX ERROR:", error.message);

    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    } catch (e) {}

    return api.sendMessage(
      "❌ ভিডিও পাঠানো যায়নি!\n🔄 আবার `.xxxx` দিয়ে চেষ্টা করো।",
      event.threadID
    );
  }
};
