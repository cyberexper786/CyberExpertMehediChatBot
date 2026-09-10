const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "randommix",
  version: "1.0.0",
  author: "Islamick Cyber Chat (fixed & converted by Claude)",
  countDown: 30,
  role: 0,
  description: "Random love story / mixed video",
  category: "video",
  guide: {
    en: "{pn} : send a random mixed video"
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const endpoints = [
    "status", "sad", "baby", "love", "ff", "shairi", "humaiyun",
    "islam", "anime", "short", "event", "prefix", "cpl", "time",
    "lofi", "happy"
  ];
  const base = "https://all-api-ius8.onrender.com/video/";
  const chosen = endpoints[Math.floor(Math.random() * endpoints.length)];
  const apiUrl = base + chosen;

  // Unique temp filename per request avoids collisions if two users
  // trigger the command at nearly the same time
  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, `randommix_${event.senderID}_${Date.now()}.mp4`);

  try {
    await fs.ensureDir(cacheDir);

    const apiRes = await axios.get(apiUrl, { timeout: 10000 });
    const videoUrl = apiRes.data && apiRes.data.data;
    const count = apiRes.data && apiRes.data.count;
    const caption = apiRes.data && apiRes.data.shaon;

    if (!videoUrl) {
      return api.sendMessage("দুঃখিত, এই মুহূর্তে ভিডিও পাওয়া যায়নি। একটু পর আবার চেষ্টা করো।", threadID, messageID);
    }

    // Download the video
    const videoRes = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
      timeout: 20000
    });

    const writer = fs.createWriteStream(filePath);
    videoRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await api.sendMessage(
      {
        body: `𝐒𝐏𝐀𝐘𝐒𝐇𝐄𝐀𝐋 𝐑𝐀𝐍𝐃𝐎𝐌 𝐌𝐈𝐗 𝐕𝐈𝐃𝐄𝐎...🎬\n\n${caption || ""}\n𝚃𝙾𝚃𝙰𝙻 𝚅𝙸𝙳𝙴𝙾: ${count || "N/A"}\n\n｢𝐈𝐒𝐋𝐀𝐌𝐈𝐂𝐊 𝐂𝐘𝐁𝐄𝐑 𝐂𝐇𝐀𝐓｣`,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      messageID
    );
  } catch (err) {
    console.error("[randommix.js] error:", err.message);
    api.sendMessage("দুঃখিত, ভিডিও লোড করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করো।", threadID, messageID);
  } finally {
    // Always clean up, even if sending failed
    fs.unlink(filePath, () => {});
  }
};
