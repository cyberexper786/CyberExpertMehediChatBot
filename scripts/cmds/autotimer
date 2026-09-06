const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autotimer",
  version: "5.5",
  role: 0,
  author: "RiYaD",
  description: "⏰ প্রতি ঘণ্টায় ভিডিওসহ অটো মেসেজ পাঠাবে (Ultra Optimized)",
  category: "AutoTime",
  countDown: 4,
};

module.exports.onLoad = async function ({ api }) {
  // 🔒 Author lock check
  if (module.exports.config.author !== "RiYaD") {
    console.error("❌ Author name has been changed. The file will not run.");
    return process.exit(1);
  }

  const timerData = {
    "12:00 AM": { 
      text: "⌚┆এখন রাত ১২টা বাজে❥︎খাউয়া দাউয়া করে নেউ,🍽️🍛", 
      video: "https://files.catbox.moe/qwxaxf.mp4" 
    },
    "01:00 AM": { 
      text: "⌚┆এখন রাত ১টা বাজে❥︎সবাই শুয়ে পড়ো,🌌💤", 
      video: "https://files.catbox.moe/hllek9.mp4" 
    },
    "02:00 AM": { 
      text: "⌚┆এখন রাত ২টা বাজে❥︎প্রেম না কইরা যাইয়া ঘুমা বেক্কল,😾🌠", 
      video: "https://files.catbox.moe/f0f0ep.mp4" 
    },
    "03:00 AM": { 
      text: "⌚┆এখন রাত ৩টা বাজে❥︎যারা ছ্যাকা খাইছে তারা জেগে আছে,🫠🌃", 
      video: "https://files.catbox.moe/o6o4x1.mp4" 
    },
    "04:30 AM": {
      text: `╭━━━〔 🌅 𝐅𝐀𝐉𝐑 • ফজরের সময় 〕━━━╮

﴾ ﷽ ﴿

اَلصَّلَاةُ خَيْرٌ مِّنَ النَّوْمِ

🤲 আর কিছুক্ষণ পর ফজরের নামাজের সময় হবে।
🕌 সবাই অজু করে নামাজের জন্য প্রস্তুতি নিন।

اللَّهُمَّ اجْعَلْنَا مِنَ الْمُقِيمِينَ لِلصَّلَاةِ

╰━━━━━━━━━━━━━━━━━━━━╯`,
      video: "https://files.catbox.moe/ee9khu.mp4"
    },
    "06:00 AM": { 
      text: "⌚┆এখন সকাল ৬টা বাজে❥︎ঘুম থেকে উঠো সবাই,🌞☕", 
      video: "https://files.catbox.moe/ra38zm.mp4" 
    },
    "07:00 AM": { 
      text: "⌚┆এখন সকাল ৭টা বাজে❥︎ব্রেকফাস্ট করে নাও,🍞", 
      video: "https://files.catbox.moe/4uorbo.mp4" 
    },
    "08:00 AM": { 
      text: "⌚┆এখন সকাল ৮টা বাজে❥︎কাজ শুরু করো মন দিয়ে,🌤️✨", 
      video: "https://files.catbox.moe/sirbqe.mp4" 
    },
    "09:00 AM": { 
      text: "⌚┆এখন সকাল ৯টা বাজে❥︎চল কাজে মন দিই!🕘", 
      video: "https://files.catbox.moe/6k87h0.mp4" 
    },
    "10:00 AM": { 
      text: "⌚┆এখন সকাল ১০টা বাজে❥︎তোমাদের মিস করছি,🌞☀️", 
      video: "https://files.catbox.moe/cbfjmf.mp4" 
    },
    "11:00 AM": { 
      text: "⌚┆এখন সকাল ১১টা বাজে❥︎কাজ চালিয়ে যাও!😌", 
      video: "https://files.catbox.moe/7owx97.mp4" 
    },
    "12:00 PM": { 
      text: "⌚┆এখন দুপুর ১২টা বাজে❥︎ভালোবাসা জানাও সবাইকে,❤️", 
      video: "https://files.catbox.moe/jam83o.mp4" 
    },
    "01:00 PM": {
      text: `╭━━━〔 🕌 𝐙𝐔𝐇𝐑 • যোহরের সময় 〕━━━╮

﴾ ﷽ ﴿

حَيَّ عَلَى الصَّلَاةِ

🤲 আর কিছুক্ষণ পর যোহরের নামাজের সময় হবে।
🕌 সবাই নামাজের জন্য প্রস্তুতি নিন।

رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ

╰━━━━━━━━━━━━━━━━━━━━╯`,
      video: "https://files.catbox.moe/c5qbek.mp4"
    },
    "02:00 PM": { 
      text: "⌚┆এখন দুপুর ২টা বাজে❥︎দুপুরের খাবার খেয়েছো তো?🍛🌤️", 
      video: "https://files.catbox.moe/7k1abr.mp4" 
    },
    "03:00 PM": { 
      text: "⌚┆এখন বিকাল ৩টা বাজে❥︎কাজে ফোকাস করো,🧑‍🔧☀️", 
      video: "https://files.catbox.moe/ryh763.mp4" 
    },
    "04:30 PM": {
      text: `╭━━━〔 🕌 𝐀𝐒𝐑 • আসরের সময় 〕━━━╮

﴾ ﷽ ﴿

إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا

🤲 আর কিছুক্ষণ পর আসরের নামাজের সময় হবে।
🕌 সবাই নামাজের জন্য প্রস্তুতি নিন।

اللَّهُمَّ تَقَبَّلْ مِنَّا

╰━━━━━━━━━━━━━━━━━━━━╯`,
      video: "https://files.catbox.moe/vcgbxq.mp4"
    },
    "06:30 PM": {
      text: `╭━━━〔 🌇 𝐌𝐀𝐆𝐇𝐑𝐈𝐁 • মাগরিবের সময় 〕━━━╮

﴾ ﷽ ﴿

الله أكبر، الله أكبر

🤲 আর কিছুক্ষণ পর মাগরিবের নামাজের সময় হবে।
🕌 সবাই অজু করে নামাজের জন্য প্রস্তুতি নিন।

اللَّهُمَّ تَقَبَّلْ مِنَّا

╰━━━━━━━━━━━━━━━━━━━━╯`,
      video: "https://files.catbox.moe/y8pnz7.mp4"
    },
    "08:00 PM": {
      text: `╭━━━〔 🌙 𝐈𝐒𝐇𝐀 • এশার সময় 〕━━━╮

﴾ ﷽ ﴿

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

🤲 আর কিছুক্ষণ পর এশার নামাজের সময় হবে।
🕌 সবাই নামাজের জন্য প্রস্তুতি নিন।

آمِين يَا رَبَّ الْعَالَمِينَ

╰━━━━━━━━━━━━━━━━━━━━╯`,
      video: "https://files.catbox.moe/rpnut9.mp4"
    },
    "09:00 PM": { 
      text: "⌚┆এখন রাত ৯টা বাজে❥︎ঘুমের প্রস্তুতি নাও,😴🌙", 
      video: "https://files.catbox.moe/ndbhtu.mp4" 
    },
    "10:00 PM": { 
      text: "⌚┆এখন রাত ১০টা বাজে❥︎ঘুমাতে যাও, স্বপ্নে দেখা হবে,😴🙂↕️", 
      video: "https://files.catbox.moe/sxs5io.mp4" 
    },
    "11:00 PM": { 
      text: "⌚┆এখন রাত ১১টা বাজে❥︎ভালোবাসা রইলো,🥰🌌", 
      video: "https://files.catbox.moe/8btwbx.mp4" 
    }
  };

  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.ensureDirSync(cacheDir);
  }

  // Prevent double sending within the same minute
  if (!global.__sentMap) global.__sentMap = {};
  
  // Track thread configurations
  if (!global.autoTimerConfig) global.autoTimerConfig = {};

  const checkTimeAndSend = async () => {
    try {
      const now = moment().tz("Asia/Dhaka").format("hh:mm A");

      if (!timerData[now]) return;

      const todayDate = moment().tz("Asia/Dhaka").format("DD-MM-YYYY");
      const { text, video } = timerData[now];

      const videoName = now.replace(/[: ]/g, "_") + ".mp4";
      const videoPath = path.join(cacheDir, videoName);

      if (!fs.existsSync(videoPath)) {
        try {
          console.log(`[AUTOTIMER] Downloading video for ${now}...`);
          const res = await axios.get(video, { responseType: "arraybuffer" });
          fs.writeFileSync(videoPath, Buffer.from(res.data));
          console.log(`[AUTOTIMER] Cached video for ${now} successfully.`);
        } catch (err) {
          console.error(`[AUTOTIMER] Video download failed for ${now}:`, err.message);
          return;
        }
      }

      const msg = `◢◤━━━━━━━━━━━━━━━━◥◣
🕒>ᴛɪᴍᴇ: ${now}
${text}
◥◣━━━━━━━━━━━━━━━━◢◤
📅>ᴅᴀᴛᴇ: ${todayDate}
━━━━━━━━━━━━━━━━━━━━
𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁: ᴍᴀɪsʜᴀ
━━━━━━━━━━━━━━━━━━━━`;

      const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
      if (!allThreads || !Array.isArray(allThreads)) return;

      const groupThreads = allThreads.filter(thread => thread.isGroup && thread.isSubscribed);

      for (const thread of groupThreads) {
        const threadID = thread.threadID;
        const sentKey = `${threadID}_${now}_${todayDate}`;

        if (global.__sentMap[sentKey]) continue;

        // Default to true (ON) unless turned off using command
        const isEnabled = global.autoTimerConfig[threadID] !== undefined 
          ? global.autoTimerConfig[threadID] 
          : true;

        if (!isEnabled) continue;

        global.__sentMap[sentKey] = true;

        try {
          api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(videoPath)
          }, threadID, (err) => {
            if (err) {
              console.error(`[AUTOTIMER] Failed to send message to thread ${threadID}:`, err);
              delete global.__sentMap[sentKey];
            }
          });
        } catch (err) {
          console.error(`[AUTOTIMER] Error preparing stream for thread ${threadID}:`, err);
          delete global.__sentMap[sentKey];
        }
      }
    } catch (error) {
      console.error("[AUTOTIMER] Error inside checkTimeAndSend:", error);
    }
  };

  // Run the check loop every 30 seconds
  setInterval(checkTimeAndSend, 30 * 1000);
};

// Command handler to manage autotimer status per group chat
module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  
  if (!global.autoTimerConfig) global.autoTimerConfig = {};

  if (!args[0]) {
    const isCurrentlyEnabled = global.autoTimerConfig[threadID] !== undefined 
      ? global.autoTimerConfig[threadID] 
      : true;

    return api.sendMessage(
      `⏰ [AUTOTIMER STATUS]\n━━━━━━━━━━━━━━━━━━━━\n• Current state in this chat: ${isCurrentlyEnabled ? "🟢 ACTIVE (ON)" : "🔴 DISABLED (OFF)"}\n━━━━━━━━━━━━━━━━━━━━\n📝 To change status:\n👉 Use '/autotimer on' to enable.\n👉 Use '/autotimer off' to disable.`,
      threadID,
      messageID
    );
  }

  const option = args[0].toLowerCase();

  if (option === "on") {
    global.autoTimerConfig[threadID] = true;
    return api.sendMessage("⏰ [AUTOTIMER] Auto Time message is now turned ON for this group chat. The bot will send automated hourly updates!", threadID, messageID);
  } else if (option === "off") {
    global.autoTimerConfig[threadID] = false;
    return api.sendMessage("⏰ [AUTOTIMER] Auto Time message has been turned OFF for this group chat. Hourly messages are now disabled.", threadID, messageID);
  } else {
    return api.sendMessage("❌ Invalid command! Please use: '/autotimer on' or '/autotimer off'", threadID, messageID);
  }
};
                                             
