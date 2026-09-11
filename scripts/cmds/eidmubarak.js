const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const CACHE_DIR = path.join(__dirname, "cache", "eidmubarak");

module.exports = {
  config: {
    name: "eidmubarak",
    version: "10.0.0",
    author: "Shaon Ahmed • GoatBot V2",
    role: 0,
    description: "Beautiful Eid Mubarak pair card",
    category: "image",
    guide: {
      en: "{pn} @mention"
    }
  },

  onStart: async ({ event, message, usersData }) => {
    const { threadID, messageID, senderID } = event;

    try {
      const mentions = Object.keys(event.mentions || {});

      if (!mentions.length) {
        return message.send(
          "🕌✨ 𝗘𝗜𝗗 𝗠𝗨𝗕𝗔𝗥𝗔𝗞 ✨🕌\n\n" +
          "🤍 একজনকে mention করুন।\n\n" +
          "📌 Example:\n" +
          ".eidmubarak @Friend"
        );
      }

      const targetID = mentions[0];

      await fs.ensureDir(CACHE_DIR);

      try {
        await message.reaction("⏳", messageID);
      } catch (e) {}

      await message.send(
        "🕌✨ 𝗘𝗜𝗗 𝗠𝗨𝗕𝗔𝗥𝗔𝗞 ✨🕌\n\n" +
        "🎨 আপনার Eid Card তৈরি হচ্ছে...\n" +
        "⏳ একটু অপেক্ষা করুন..."
      );

      // ─────────────────────────
      // Get names
      // ─────────────────────────
      let senderName = "You";
      let targetName = "Friend";

      try {
        senderName = await usersData.getName(senderID);
      } catch (e) {}

      try {
        targetName = await usersData.getName(targetID);
      } catch (e) {}

      // ─────────────────────────
      // Get profile pictures
      // ─────────────────────────
      let avatarOneURL;
      let avatarTwoURL;

      try {
        avatarOneURL = await usersData.getAvatarUrl(senderID);
      } catch (e) {
        throw new Error("আপনার profile picture পাওয়া যায়নি।");
      }

      try {
        avatarTwoURL = await usersData.getAvatarUrl(targetID);
      } catch (e) {
        throw new Error("Mention করা ব্যক্তির profile picture পাওয়া যায়নি।");
      }

      // ─────────────────────────
      // Download profile pictures
      // ─────────────────────────
      const [avatarOneRes, avatarTwoRes] = await Promise.all([
        axios.get(avatarOneURL, {
          responseType: "arraybuffer",
          timeout: 30000
        }),
        axios.get(avatarTwoURL, {
          responseType: "arraybuffer",
          timeout: 30000
        })
      ]);

      const avatarOne = await loadImage(
        Buffer.from(avatarOneRes.data)
      );

      const avatarTwo = await loadImage(
        Buffer.from(avatarTwoRes.data)
      );

      // ─────────────────────────
      // Canvas
      // ─────────────────────────
      const width = 1080;
      const height = 1350;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        width,
        height
      );

      gradient.addColorStop(0, "#071A2B");
      gradient.addColorStop(0.5, "#123C4A");
      gradient.addColorStop(1, "#06121F");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // ─────────────────────────
      // Decorative moon
      // ─────────────────────────
      ctx.beginPath();
      ctx.arc(540, 245, 115, 0, Math.PI * 2);
      ctx.fillStyle = "#F8E7A5";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(590, 205, 105, 0, Math.PI * 2);
      ctx.fillStyle = "#071A2B";
      ctx.fill();

      // Stars
      const stars = [
        [120, 160],
        [230, 270],
        [870, 150],
        [950, 300],
        [150, 430],
        [900, 450],
        [780, 90],
        [300, 100]
      ];

      stars.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#F8E7A5";
        ctx.fill();
      });

      // ─────────────────────────
      // Header
      // ─────────────────────────
      ctx.textAlign = "center";

      ctx.font = "bold 72px Sans";
      ctx.fillStyle = "#F8E7A5";
      ctx.fillText("EID MUBARAK", 540, 520);

      ctx.font = "34px Sans";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("May Allah bless you with happiness", 540, 575);

      // ─────────────────────────
      // Card
      // ─────────────────────────
      const cardX = 80;
      const cardY = 625;
      const cardW = 920;
      const cardH = 500;

      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 45);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#F8E7A5";
      ctx.stroke();

      // ─────────────────────────
      // Avatar function
      // ─────────────────────────
      function drawAvatar(img, x, y, size) {
        ctx.save();

        ctx.beginPath();
        ctx.arc(
          x + size / 2,
          y + size / 2,
          size / 2 + 10,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = "#F8E7A5";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
          x + size / 2,
          y + size / 2,
          size / 2,
          0,
          Math.PI * 2
        );

        ctx.clip();

        ctx.drawImage(img, x, y, size, size);

        ctx.restore();
      }

      // Avatars
      drawAvatar(avatarOne, 210, 685, 250);
      drawAvatar(avatarTwo, 620, 685, 250);

      // ─────────────────────────
      // Names
      // ─────────────────────────
      ctx.textAlign = "center";

      ctx.font = "bold 30px Sans";
      ctx.fillStyle = "#FFFFFF";

      ctx.fillText(
        senderName.length > 18
          ? senderName.substring(0, 18) + "..."
          : senderName,
        335,
        1000
      );

      ctx.fillText(
        targetName.length > 18
          ? targetName.substring(0, 18) + "..."
          : targetName,
        745,
        1000
      );

      // Heart
      ctx.font = "50px Sans";
      ctx.fillStyle = "#F8E7A5";
      ctx.fillText("♡", 540, 820);

      // ─────────────────────────
      // Bottom text
      // ─────────────────────────
      ctx.font = "bold 32px Sans";
      ctx.fillStyle = "#F8E7A5";
      ctx.fillText("🌙 ঈদ মোবারক 🌙", 540, 1075);

      ctx.font = "24px Sans";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(
        "May your Eid be filled with peace & blessings",
        540,
        1115
      );

      // ─────────────────────────
      // Footer decoration
      // ─────────────────────────
      ctx.font = "28px Sans";
      ctx.fillStyle = "#F8E7A5";

      ctx.fillText(
        "✦ ━━━━━━━━━━━━━ ✦",
        540,
        1200
      );

      ctx.font = "22px Sans";
      ctx.fillStyle = "#FFFFFF";

      ctx.fillText(
        "With love & duas 🤍",
        540,
        1245
      );

      // ─────────────────────────
      // Save
      // ─────────────────────────
      const outputPath = path.join(
        CACHE_DIR,
        `eid_${senderID}_${targetID}_${Date.now()}.png`
      );

      await fs.writeFile(
        outputPath,
        canvas.toBuffer("image/png")
      );

      // ─────────────────────────
      // Send
      // ─────────────────────────
      await message.send({
        body:
          "🕌✨ 𝗘𝗜𝗗 𝗠𝗨𝗕𝗔𝗥𝗔𝗞 ✨🕌\n\n" +
          `🤍 ${senderName} × ${targetName}\n\n` +
          "🌙 ঈদ মোবারক!\n" +
          "🤲 আল্লাহ আপনাদের জীবন সুখ ও শান্তিতে ভরিয়ে দিন।",

        attachment: fs.createReadStream(outputPath)
      });

      try {
        await message.reaction("❤️", messageID);
      } catch (e) {}

      // Cleanup
      setTimeout(async () => {
        try {
          await fs.remove(outputPath);
        } catch (e) {}
      }, 20000);

    } catch (error) {
      console.error("[EIDMUBARAK ERROR]", error);

      try {
        await message.reaction("❌", messageID);
      } catch (e) {}

      return message.send(
        "❌ | Eid Mubarak Card তৈরি করা যায়নি!\n\n" +
        "⚠️ Error: " +
        (error.message || "Unknown error")
      );
    }
  }
};
