const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const cacheDir = path.join(__dirname, "cache", "hey");
fs.ensureDirSync(cacheDir);

const imageLinks = [
 "https://i.imgur.com/22jvZAY.jpeg",
 "https://i.imgur.com/RRfliha.jpeg",
 "https://i.imgur.com/22jvZAY.jpeg",
 "https://i.imgur.com/CJSfSzw.jpeg"
];

async function ensureCached() {
 for (let i = 0; i < imageLinks.length; i++) {
  const filePath = path.join(cacheDir, img${i}.jpeg);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) continue;
  try {
   const response = await axios({
    url: imageLinks[i],
    method: "GET",
    responseType: "arraybuffer",
    headers: {
     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
     "Referer": "https://imgur.com/",
     "Accept": "image/*"
    }
   });
   fs.writeFileSync(filePath, response.data);
  } catch (err) {
   console.error("hey.js failed to cache image:", imageLinks[i], "|", err.message);
  }
 }
}
ensureCached();

module.exports = {
 config: {
  name: "hey",
  version: "1.1",
  author: "EryXenX",
  countDown: 0,
  role: 0,
  category: "System",
  shortDescription: "Reply when only prefix is sent",
  longDescription: "Sends a welcome message with image when a user sends only the prefix",
  guide: {
   en: "{pn}"
  }
 },

 onStart: async function () {},

 onChat: async function ({ api, event }) {
  const { GoatBot } = global;
  const { config } = GoatBot;
  const { threadID, messageID, body } = event;

  if (!body) return;

  const prefix = config.prefix;
  if (body.trim() !== prefix) return;

  const msg = {
   body:
    "🌸 Assalamualaikum 🌸\n" +
    "🌺 Thanks you so much for using my bot your group ❤️‍🩹\n" +
    "😻 I will you are members enjoy!🤗\n\n" +
    "☢️ To view any command 📌\n" +
    ${prefix}Help\n +
    ${prefix}Bot\n +
    ${prefix}Info\n\n +
    "Bot Owner➢Mehedi Hassan"
  };

  const cachedFiles = fs.readdirSync(cacheDir).filter(f => fs.statSync(path.join(cacheDir, f)).size > 0);
  if (cachedFiles.length) {
   const chosen = cachedFiles[Math.floor(Math.random() * cachedFiles.length)];
   msg.attachment = fs.createReadStream(path.join(cacheDir, chosen));
  } else {
   ensureCached();
  }

  return api.sendMessage(msg, threadID, messageID);
 }
};
