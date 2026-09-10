const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "welcome",
    version: "2.0.0",
    author: "Maria (rX Modded) + Updated by rX Abdullah",
    category: "events"
  },

  onStart: async ({ threadsData, usersData, message, event, api }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const added = logMessageData.addedParticipants?.[0];
    if (!added) return;

    const botID = api.getCurrentUserID();
    if (added.userFbId == botID) return; // don't run welcome card when the bot itself is added

    const threadData = await threadsData.get(threadID);
    if (threadData.settings && threadData.settings.sendWelcomeMessage === false) return;

    const userID = added.userFbId;
    const userName = added.fullName;
    const groupName = threadData.threadName || "our group";
    const memberCount = event.participantIDs ? event.participantIDs.length : threadData.participantIDs.length;

    const adderID = event.author;
    const adderName = await usersData.getName(adderID);

    // Random background selection
    const bgURLs = [
      "https://i.postimg.cc/904gjPHn/images-11.jpg",
      "https://i.postimg.cc/8k3nmYhQ/images-10.jpg",
      "https://i.postimg.cc/KjdqcKZv/images-9.jpg",
      "https://i.postimg.cc/28Z9cxwq/images-8.jpg"
    ];
    const bgURL = bgURLs[Math.floor(Math.random() * bgURLs.length)];

    const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const bgPath = path.join(cacheDir, `bg_${userID}_${Date.now()}.jpg`);
    const avatarPath = path.join(cacheDir, `avt_${userID}_${Date.now()}.png`);
    const outPath = path.join(cacheDir, `welcome_${userID}_${Date.now()}.png`);

    try {
      // Download random background
      const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer", timeout: 10000 })).data;
      fs.writeFileSync(bgPath, Buffer.from(bgImg));

      // Download avatar
      const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer", timeout: 10000 })).data;
      fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

      // Create canvas
      const canvas = createCanvas(800, 500);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(bgPath);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatarSize = 180;
      const avatarX = (canvas.width - avatarSize) / 2;
      const avatarY = 100;

      // White circular frame
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, false);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Load avatar
      const avatar = await loadImage(avatarPath);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Draw text lines
      ctx.textAlign = "center";

      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "#FFB6C1";
      ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#00FFFF";
      ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 90);

      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#FFFF00";
      ctx.fillText(`You are the ${memberCount}th member of this group`, canvas.width / 2, avatarY + avatarSize + 130);

      // Save final image
      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(outPath, finalBuffer);

      const timeString = new Date().toLocaleTimeString("en-US", { hour12: true, timeZone: "Asia/Dhaka" });
      const da teString = new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" });
      const dayString = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Dhaka" });

      const form = {
        body: `‎🌸 ʜᴇʟʟᴏ @${userName}
🎀 ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴏᴜʀ ɢʀᴏᴜᴘ — ${groupName}
📌 ʏᴏᴜ'ʀᴇ ᴛʜᴇ ${memberCount} ᴍᴇᴍʙᴇʀ ᴏɴ ᴛʜɪꜱ ɢʀᴏᴜᴘ!
💬 ғᴇᴇʟ ғʀᴇᴇ ᴛᴏ ᴄʜᴀᴛ, ᴄᴏɴɴᴇᴄᴛ ᴀɴᴅ ʜᴀᴠᴇ ꜰᴜɴ ʜᴇʀᴇ!
         ♡ᴍᴇʜᴇᴅɪ ᴋʜᴀɴ♡
       ━━━━━━━━━━━━━━━━
📅 ${timeString} - ${dateString} - ${dayString}`,
        mentions: [{ tag: userName, id: userID }],
        attachment: fs.createReadStream(outPath)
      };

      message.send(form);

      setTimeout(() => {
        try { fs.unlinkSync(bgPath); } catch (_) {}
        try { fs.unlinkSync(avatarPath); } catch (_) {}
        try { fs.unlinkSync(outPath); } catch (_) {}
      }, 5000);

    } catch (error) {
      console.error("Joinnoti error:", error);
      try { fs.unlinkSync(bgPath); } catch (_) {}
      try { fs.unlinkSync(avatarPath); } catch (_) {}
      message.send("𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐲𝐩𝐞 !𝐡𝐞𝐥𝐩 𝐟𝐨𝐫 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ⚙️");
    }
  }
};
    
