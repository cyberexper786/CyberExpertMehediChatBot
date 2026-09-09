const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "cricketsix",                    // ফাইল নাম cricket six → cricketsix.js
    version: "1.0.8",
    role: 2,
    author: "MEHEDI HASAN MIRAZ",
    description: "Cricket Six Hot Video Send - Special Collection",
    category: "18+",
    usages: "cricketsix",
    cooldowns: 5
  },

  onStart: async function ({ event, api }) {
    const videos = [
      "https://files.catbox.moe/k42qv8.mp4",
      "https://files.catbox.moe/dtccmo.mp4",
      "https://files.catbox.moe/bwut5r.mp4",
      "https://files.catbox.moe/qwcgpg.mp4",
      "https://files.catbox.moe/wkdy38.mp4",
      "https://files.catbox.moe/ipv2p5.mp4",
      "https://files.catbox.moe/k1x6j3.mp4",
      "https://files.catbox.moe/jmoqfv.mp4",
      "https://files.catbox.moe/u0y1yo.mp4",
      "https://files.catbox.moe/0e6sy9.mp4",
      "https://files.catbox.moe/buyysm.mp4",
      "https://files.catbox.moe/3icahd.mp4",
      "https://files.catbox.moe/e9kp0x.mp4",
      "https://files.catbox.moe/f3z37x.mp4",
      "https://files.catbox.moe/titfke.mp4",
      "https://files.catbox.moe/dh0rzo.mp4",
      "https://files.catbox.moe/omdk1n.mp4",
      "https://files.catbox.moe/cfbknh.mp4",
      "https://files.catbox.moe/uczh5b.mp4",
      "https://files.catbox.moe/ehrikv.mp4",
      "https://files.catbox.moe/ko5cuw.mp4",
      "https://files.catbox.moe/anlvq4.mp4"
    ];

    try {
      const randomIndex = Math.floor(Math.random() * videos.length);
      const randomVideo = videos[randomIndex];

      await api.sendMessage({
        body: `🌷__𝐇𝐚𝐳𝐚𝐫 𝐒𝐡𝐮𝐧𝐝𝐨𝐫 𝐌𝐚𝐧𝐮𝐬𝐡𝐞𝐫 𝐌𝐚𝐣𝐡𝐞 𝐀𝐩𝐧𝐢 𝐀𝐦𝐫 𝐎𝐧𝐧𝐨 𝐑𝐨𝐤𝐨𝐦 𝐎𝐧𝐮𝐯𝐮𝐭𝐢♡__🌷🙂`,
        attachment: await global.utils.getStreamFromURL(randomVideo)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error("ভিডিও পাঠাতে সমস্যা:", error);
      api.sendMessage("🍂🍓___প্লিজ ভিডিও টা দাও গো__🍂🍓", event.threadID, event.messageID);
    }
  }
};

