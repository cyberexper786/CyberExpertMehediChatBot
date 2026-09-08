const fs = require("fs");
const path = require("path");
const https = require("https");

/*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        🕌 GOJOL COMMAND
           Goat Bot V2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*/

module.exports.config = {
  name: "gojol",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Mohammad 𝐀𝐊𝐀𝐒𝐇 x Saiful",
  description: "Random gojol পাঠাবে",
  commandCategory: "music",
  usages: "gojol",
  cooldowns: 5
};

// 🕌 Gojol Links
const gojolLinks = [
  "https://drive.google.com/uc?export=download&id=1l7tKijhgLBVGfD-ovopovrpQuQf_cExe",
  "https://drive.google.com/uc?export=download&id=1MWH-z11v1l7dF8WV0zb5Ff4A4BlxXOdU",
  "https://drive.google.com/uc?export=download&id=1rmiXxL22rx8sRESpGbrjAGYygmhGUWEB",
  "https://drive.google.com/uc?export=download&id=16I-3dKv5ZagXJ5uL1D_ulOu4fh-h2-3R",
  "https://drive.google.com/uc?export=download&id=1LQ7PI1Ef4tD8BGwM-c0VnEx-I7uyU2e-",
  "https://drive.google.com/uc?export=download&id=1sQFhLhvuhn5OmNjbllP808ELwtFAYL6D"
];

let lastPlayed = -1;

// 📥 Download Function
function downloadFile(url, filePath, redirects = 0) {
  return new Promise((resolve, reject) => {

    if (redirects > 5) {
      return reject(new Error("Too many redirects"));
    }

    https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      },
      response => {

        // 🔄 Redirect
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();

          return downloadFile(
            response.headers.location,
            filePath,
            redirects + 1
          )
            .then(resolve)
            .catch(reject);
        }

        // ❌ HTTP Error
        if (response.statusCode !== 200) {
          response.resume();

          return reject(
            new Error(
              `HTTP Error: ${response.statusCode}`
            )
          );
        }

        const file = fs.createWriteStream(filePath);

        response.pipe(file);

        file.on("finish", () => {
          file.close(() => {

            try {
              const size = fs.statSync(filePath).size;

              if (size < 1000) {
                return reject(
                  new Error("Invalid/empty audio file")
                );
              }

              resolve();

            } catch (error) {
              reject(error);
            }
          });
        });

        file.on("error", error => {

          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch {}

          reject(error);
        });

        response.on("error", reject);
      }
    ).on("error", reject);
  });
}

// 🚀 Command Run
module.exports.run = async function ({ api, event }) {

  const {
    threadID,
    messageID
  } = event;

  // ❌ No links
  if (!gojolLinks.length) {
    return api.sendMessage(
      "❌ কোনো গজল লিংক পাওয়া যায়নি!",
      threadID,
      messageID
    );
  }

  // 📁 Cache folder
  const cacheDir = path.join(
    __dirname,
    "cache"
  );

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, {
      recursive: true
    });
  }

  // ⏳ Reaction
  try {
    api.setMessageReaction(
      "⌛",
      messageID,
      () => {},
      true
    );
  } catch {}

  // 🎲 Random index
  let index;

  do {
    index = Math.floor(
      Math.random() * gojolLinks.length
    );
  } while (
    index === lastPlayed &&
    gojolLinks.length > 1
  );

  lastPlayed = index;

  const url = gojolLinks[index];

  // 📂 Unique file name
  const filePath = path.join(
    cacheDir,
    `gojol_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}.mp3`
  );

  try {

    // 📥 Download
    await downloadFile(
      url,
      filePath
    );

    // 🔍 Check file
    if (!fs.existsSync(filePath)) {
      throw new Error(
        "Audio file not found"
      );
    }

    const fileSize =
      fs.statSync(filePath).size;

    if (fileSize < 1000) {
      throw new Error(
        "Audio file is invalid"
      );
    }

    // 🎵 Send Gojol
    await api.sendMessage(
      {
        body:
          "🕌 ━━━━━━━━━━━━━━━ 🕌\n" +
          "       🎵 একটি গজল 🎵\n" +
          "🕌 ━━━━━━━━━━━━━━━ 🕌\n\n" +
          "🤲 আল্লাহ আমাদের সবাইকে হেদায়েত দান করুন।",
        attachment:
          fs.createReadStream(filePath)
      },
      threadID
    );

    // ✅ Success reaction
    try {
      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );
    } catch {}

  } catch (error) {

    console.error(
      "[GOJOL ERROR]",
      error
    );

    // ❌ Error reaction
    try {
      api.setMessageReaction(
        "❌",
        messageID,
        () => {},
        true
      );
    } catch {}

    api.sendMessage(
      "❌ গজল পাঠানো যায়নি!\n\n" +
      "🔹 Google Drive ফাইল Public আছে কিনা দেখুন।\n" +
      "🔹 Drive লিংক সঠিক আছে কিনা দেখুন।",
      threadID,
      messageID
    );

  } finally {

    // 🧹 Delete cache after 5 seconds
    setTimeout(() => {

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(
          "[GOJOL CACHE ERROR]",
          error
        );
      }

    }, 5000);
  }
};
