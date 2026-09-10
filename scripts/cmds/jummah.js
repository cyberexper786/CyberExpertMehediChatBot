const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "jummah",
    version: "2.1.0",
    author: "Islamick Cyber Chat",
    countDown: 5,
    role: 0,
    shortDescription: "জুম্মাহ মুবারক Auto Reply",
    longDescription: "জুম্মাহ মুবারক লিখলে ইসলামিক শুভেচ্ছা ও ভিডিও পাঠাবে।",
    category: "events",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, threadsData }) {
    const threadID = message.threadID;

    try {
      const current = await threadsData.get(
        threadID,
        "data.jummahEnabled"
      );

      const enabled = current !== false;
      const newStatus = !enabled;

      // Goat Bot V2 সঠিক format
      await threadsData.set(
        threadID,
        newStatus,
        "data.jummahEnabled"
      );

      await message.reply(
        newStatus
          ? "🕌 জুম্মাহ মুবারক Auto-Reply চালু হয়েছে ✅"
          : "🕌 জুম্মাহ মুবারক Auto-Reply বন্ধ হয়েছে ❌"
      );

    } catch (error) {
      console.error("Jummah Toggle Error:", error);
      await message.reply(
        "❌ সেটিং পরিবর্তন করা যায়নি!\n\n" +
        "কনসোলে Error দেখুন।"
      );
    }
  },

  onChat: async function ({ message, threadsData }) {
    const text = (message.body || "").trim();

    if (!text.startsWith("জুম্মাহ মুবারক")) return;

    try {
      const enabled = await threadsData.get(
        message.threadID,
        "data.jummahEnabled"
      );

      // বন্ধ থাকলে কিছু করবে না
      if (enabled === false) return;

      const messages = [
        `•┄┅════❁🌺❁════┅┄•

🫶💜🪽
𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂 𝗔𝗹𝗮𝗶𝗸𝘂𝗺 ♡
𝗝𝘂𝗺𝗺𝗮𝗵 𝗠𝘂𝗯𝗮𝗿𝗮𝗸 ♡🩷🕌

•┄┅════❁🌺❁════┅┄•`,

        `•┄┅════❁🌺❁════┅┄•

🫶💜🪽
𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂 𝗔𝗹𝗮𝗶𝗸𝘂𝗺 ♡
𝗝𝘂𝗺𝗺𝗮𝗵 𝗠𝘂𝗯𝗮𝗿𝗮𝗸 ♡🩷🕌

╰•┄┅════❁🌺❁════┅┄•╯`
      ];

      const body =
        messages[Math.floor(Math.random() * messages.length)];

      const videoUrl =
        "https://i.imgur.com/g0dpYGm.mp4";

      const cacheDir = path.join(__dirname, "cache");

      await fs.ensureDir(cacheDir);

      const filePath = path.join(
        cacheDir,
        `jummah-${Date.now()}.mp4`
      );

      try {
        const response = await axios.get(videoUrl, {
          responseType: "stream",
          timeout: 30000,
          maxRedirects: 5
        });

        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(filePath);

          response.data.pipe(writer);

          writer.on("finish", resolve);
          writer.on("error", reject);
          response.data.on("error", reject);
        });

        await message.reply({
          body,
          attachment: fs.createReadStream(filePath)
        });

        setTimeout(async () => {
          try {
            await fs.remove(filePath);
          } catch (err) {
            console.error("Jummah Cleanup Error:", err);
          }
        }, 10000);

      } catch (videoError) {
        console.error("Video Error:", videoError);

        // ভিডিও না এলে শুধু মেসেজ পাঠাবে
        await message.reply(body);
      }

    } catch (error) {
      console.error("Jummah Auto Reply Error:", error);
    }
  }
};
