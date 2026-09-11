module.exports = {
  config: {
    name: "video",
    version: "4.0.0",
    author: "Maisha Project Official",
    countDown: 10,
    role: 0,

    shortDescription: {
      en: "Download requested YouTube song"
    },

    longDescription: {
      en: "Search and download only the requested YouTube song"
    },

    category: "media",

    guide: {
      en: "{pn} <song name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");
    const { exec } = require("child_process");
    const fs = require("fs");
    const path = require("path");

    if (!args || args.length === 0) {
      return api.sendMessage(
        "❌ | গানের নাম লিখুন\n\n" +
        "📌 Example:\n" +
        "video Bolona Kothay Tumi\n" +
        "video Believer\n" +
        "video Arijit Singh",
        event.threadID,
        event.messageID
      );
    }

    const query = args.join(" ").trim();

    try {
      await api.sendMessage(
        `🔎 | "${query}" খোঁজা হচ্ছে...`,
        event.threadID,
        event.messageID
      );

      // YouTube search
      const searchResponse = await axios.post(
        "https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
        {
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20240926.01.00"
            }
          },
          query: query
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
          },
          timeout: 20000
        }
      );

      const results = [];

      function findVideo(obj) {
        if (!obj || results.length >= 1) return;

        if (Array.isArray(obj)) {
          for (const item of obj) {
            findVideo(item);
            if (results.length >= 1) return;
          }
          return;
        }

        if (typeof obj !== "object") return;

        if (obj.videoRenderer) {
          const video = obj.videoRenderer;

          const id = video.videoId;

          let title = "";

          if (video.title?.runs) {
            title = video.title.runs
              .map(x => x.text || "")
              .join("");
          }

          if (!title && video.title?.simpleText) {
            title = video.title.simpleText;
          }

          if (id && title) {
            results.push({
              id,
              title
            });
            return;
          }
        }

        for (const key of Object.keys(obj)) {
          findVideo(obj[key]);
          if (results.length >= 1) return;
        }
      }

      findVideo(searchResponse.data);

      if (!results.length) {
        return api.sendMessage(
          `❌ | "${query}" এর কোনো ভিডিও পাওয়া যায়নি।`,
          event.threadID,
          event.messageID
        );
      }

      const video = results[0];

      const videoUrl =
        `https://www.youtube.com/watch?v=${video.id}`;

      await api.sendMessage(
        `🎵 | ${video.title}\n\n` +
        `⬇️ | ভিডিও ডাউনলোড হচ্ছে...`,
        event.threadID,
        event.messageID
      );

      /*
       * yt-dlp দিয়ে শুধু প্রথম search result download করা হবে।
       * Reply 1-6 থাকবে না।
       */

      const downloadDir = path.join(
        __dirname,
        "cache"
      );

      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, {
          recursive: true
        });
      }

      const outputFile = path.join(
        downloadDir,
        `${event.senderID}_${Date.now()}.mp4`
      );

      const command =
        `yt-dlp ` +
        `--no-playlist ` +
        `--max-filesize 50M ` +
        `-f "18/best[ext=mp4]/best" ` +
        `-o "${outputFile}" ` +
        `"${videoUrl}"`;

      exec(
        command,
        {
          timeout: 120000
        },
        async (error, stdout, stderr) => {
          if (error) {
            console.error(
              "YT-DLP ERROR:",
              stderr || error.message
            );

            return api.sendMessage(
              "❌ | ভিডিও ডাউনলোড করা যায়নি।\n\n" +
              "🔗 ভিডিও লিংক:\n" +
              videoUrl,
              event.threadID,
              event.messageID
            );
          }

          if (!fs.existsSync(outputFile)) {
            return api.sendMessage(
              "❌ | ভিডিও ফাইল পাওয়া যায়নি।\n\n" +
              "🔗 " + videoUrl,
              event.threadID,
              event.messageID
            );
          }

          try {
            await api.sendMessage(
              {
                body:
                  `🎵 ${video.title}\n\n` +
                  "✅ | আপনার চাওয়া ভিডিওটি এখানে।",
                attachment: fs.createReadStream(
                  outputFile
                )
              },
              event.threadID,
              event.messageID
            );
          } catch (sendError) {
            console.error(
              "SEND VIDEO ERROR:",
              sendError
            );

            await api.sendMessage(
              `🎵 ${video.title}\n\n${videoUrl}`,
              event.threadID,
              event.messageID
            );
          }

          // Downloaded file delete
          setTimeout(() => {
            try {
              if (fs.existsSync(outputFile)) {
                fs.unlinkSync(outputFile);
              }
            } catch (e) {}
          }, 5000);
        }
      );

    } catch (error) {
      console.error(
        "VIDEO COMMAND ERROR:",
        error.response?.data ||
        error.message ||
        error
      );

      return api.sendMessage(
        "❌ | ভিডিও খুঁজতে বা ডাউনলোড করতে সমস্যা হয়েছে।",
        event.threadID,
        event.messageID
      );
    }
  }
};
