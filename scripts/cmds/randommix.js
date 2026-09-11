const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "randommix",
    version: "2.0",
    author: "Islamick Cyber Chat",
    category: "video",
    role: 0,
    description: "Random mixed video",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async ({ api, event, message }) => {
    const threadID = event.threadID;
    const messageID = event.messageID;

    const endpoints = [
      "status",
      "sad",
      "baby",
      "love",
      "ff",
      "shairi",
      "humaiyun",
      "islam",
      "anime",
      "short",
      "event",
      "prefix",
      "cpl",
      "time",
      "lofi",
      "happy"
    ];

    const baseURL =
      "https://all-api-ius8.onrender.com/video/";

    let filePath = null;

    try {
      // Random category
      const chosen =
        endpoints[Math.floor(Math.random() * endpoints.length)];

      const apiURL = baseURL + chosen;

      await message.send(
        "🎬 | Random Mix Video খোঁজা হচ্ছে...\n⏳ Please wait..."
      );

      // API থেকে video information
      const apiResponse = await axios.get(apiURL, {
        timeout: 30000
      });

      const result = apiResponse.data || {};

      const videoURL = result.data;
      const totalVideo = result.count || "N/A";
      const caption = result.shaon || "";

      if (!videoURL) {
        return message.send(
          "❌ | এই মুহূর্তে কোনো ভিডিও পাওয়া যায়নি।\n\n" +
          "🔄 একটু পরে আবার চেষ্টা করুন।"
        );
      }

      // Cache directory
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      // Unique filename
      filePath = path.join(
        cacheDir,
        `randommix_${Date.now()}_${event.senderID}.mp4`
      );

      // Video download
      const videoResponse = await axios.get(videoURL, {
        responseType: "stream",
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const writer = fs.createWriteStream(filePath);

      videoResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);

        videoResponse.data.on("error", reject);
      });

      // File exists check
      if (!(await fs.pathExists(filePath))) {
        throw new Error("Video file তৈরি করা যায়নি।");
      }

      // Send video
      await message.send({
        body:
          "🎬 𝗥𝗔𝗡𝗗𝗢𝗠 𝗠𝗜𝗫 𝗩𝗜𝗗𝗘𝗢\n\n" +
          (caption ? caption + "\n\n" : "") +
          `🎞️ Total Video: ${totalVideo}\n` +
          `📂 Category: ${chosen}\n\n` +
          "╭──────────────╮\n" +
          "   𝐈𝐒𝐋𝐀𝐌𝐈𝐂𝐊 𝐂𝐘𝐁𝐄𝐑 𝐂𝐇𝐀𝐓\n" +
          "╰──────────────╯",

        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error(
        "[RANDOMMIX ERROR]",
        error
      );

      let errorText =
        "❌ | Video load করতে সমস্যা হয়েছে।";

      if (error.code === "ECONNABORTED") {
        errorText +=
          "\n\n⏱️ API response পেতে অনেক সময় লাগছে।";
      } else if (error.response) {
        errorText +=
          `\n\n⚠️ API Status: ${error.response.status}`;
      } else if (error.message) {
        errorText +=
          `\n\n⚠️ ${error.message}`;
      }

      return api.sendMessage(
        errorText,
        threadID,
        messageID
      );

    } finally {
      // কিছু সময় পরে cache delete
      if (filePath) {
        setTimeout(async () => {
          try {
            if (await fs.pathExists(filePath)) {
              await fs.remove(filePath);
            }
          } catch (cleanupError) {
            console.error(
              "[RANDOMMIX CLEANUP ERROR]",
              cleanupError.message
            );
          }
        }, 15000);
      }
    }
  }
};
