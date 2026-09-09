const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    version: "2.5.3",
    author: "ST | Sheikh Tamim",
    role: 2,
    countDown: 20,
    shortDescription: {
      en: "Owner & bot information"
    },
    longDescription: {
      en: "Show detailed information about the bot, owner, uptime and socials"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const ownerName = "ᴍᴀɪsʜᴀ";
    const ownerAge = "𝟐𝟐";
    const ownerFB = "আ্ঁসো্ঁ ক্ঁট্ঁ খা্ঁই্ঁ🥵⎯⃝💦⎯⃝🤧⎯⃝🤭 ধ্ঁরা্ঁ প্ঁড়্ঁলে্ঁ-)সোনা 🤌(-𝙅𝙖𝙢𝙖𝙞•|•𝘽𝙤𝙬⎯͢⎯⃝🩵☺️🐰";
    const ownerNumber = "𝟎𝟏𝟒𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟑𝟏";
    const status = "𝐒𝐢𝐥𝐞𝐧𝐜𝐞 𝐢𝐬 𝐌𝐲 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞";

    const botName = "ᴍᴇʜᴇᴅɪ ᴋʜᴀɴ";
    const prefix = ".";

    const totalCommands = global.GoatBot?.commands?.size || 0;

    const image = "https://files.catbox.moe/jrd0er.mp4";

    const now = moment().tz("Asia/Dhaka");
    const date = now.format("MMMM Do YYYY");
    const time = now.format("h:mm:ss A");

    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    return message.reply({
      body: `
╔═《 ✨ 𝗢𝗪𝗡𝗘𝗥 & 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ✨ 》═╗

⭓ 🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲   : 『 ${botName} 』
⭓ ☄️ 𝗣𝗿𝗲𝗳𝗶𝘅      : 『 ${prefix} 』
⭓ 🧠 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀    : 『 ${totalCommands} 』
⭓ ⚡ 𝗨𝗽𝘁𝗶𝗺𝗲      : 『 ${uptimeString} 』
⭓ 🗓️ 𝗗𝗮𝘁𝗲        : 『 ${date} 』
⭓ ⏰ 𝗧𝗶𝗺𝗲        : 『 ${time} 』

⭓ 👑 𝗢𝘄𝗻𝗲𝗿      : 『 ${ownerName} 』
⭓ 🎂 𝗔𝗴𝗲        : 『 ${ownerAge} 』
⭓ ❤️ 𝗦𝘁𝗮𝘁𝘂𝘀     : 『 ${status} 』
⭓ 📱 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽  : 『 ${ownerNumber} 』
⭓ 🌐 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸  : 『 ${ownerFB} 』

╚══════════════════════════╝
`,
      attachment: await global.utils.getStreamFromURL(image)
    });
  }
};
