const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  author: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  role: 0,
  description: "AI Image Editor",
  category: "image",
  guide: {
    en: "{pn} <prompt> (reply to an image)"
  },
  cooldowns: 10
};

module.exports.onStart = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  let inputPath = null;
  let outputPath = null;

  try {
    // ==========================================
    // 🔍 Find Image
    // ==========================================
    let imageUrl = null;

    // Image from replied message
    if (
      messageReply &&
      Array.isArray(messageReply.attachments) &&
      messageReply.attachments.length > 0
    ) {
      const attachment = messageReply.attachments.find(
        item =>
          item.type === "photo" ||
          item.type === "image"
      );

      if (attachment) {
        imageUrl =
          attachment.url ||
          attachment.image_data?.url ||
          attachment.largePreviewUrl ||
          attachment.previewUrl;
      }
    }

    // Image directly attached with command
    if (
      !imageUrl &&
      Array.isArray(event.attachments) &&
      event.attachments.length > 0
    ) {
      const attachment = event.attachments.find(
        item =>
          item.type === "photo" ||
          item.type === "image"
      );

      if (attachment) {
        imageUrl =
          attachment.url ||
          attachment.image_data?.url ||
          attachment.largePreviewUrl ||
          attachment.previewUrl;
      }
    }

    // ==========================================
    // ❌ No Image
    // ==========================================
    if (!imageUrl) {
      return api.sendMessage(
        "❌ | একটি ছবিতে reply করে command ব্যবহার করুন।\n\n" +
        "📌 Example:\n" +
        "!edit make the background beautiful",
        threadID,
        messageID
      );
    }

    // ==========================================
    // 📝 Prompt
    // ==========================================
    const prompt = args.join(" ").trim();

    if (!prompt) {
      return api.sendMessage(
        "❌ | Prompt দেওয়া হয়নি!\n\n" +
        "📌 Example:\n" +
        "!edit make the sky sunset",
        threadID,
        messageID
      );
    }

    // ==========================================
    // ⏳ Processing Message
    // ==========================================
    await api.sendMessage(
      "🪄 | আপনার ছবিটি AI দিয়ে edit করা হচ্ছে...\n\n" +
      "⏳ Please wait...",
      threadID,
      messageID
    );

    // ==========================================
    // 📁 Cache Folder
    // ==========================================
    const cacheDir = path.join(__dirname, "cache");

    await fs.ensureDir(cacheDir);

    const timestamp = Date.now();

    inputPath = path.join(
      cacheDir,
      `edit_input_${timestamp}.jpg`
    );

    outputPath = path.join(
      cacheDir,
      `edit_output_${timestamp}.jpg`
    );

    // ==========================================
    // ⬇️ Download Original Image
    // ==========================================
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (!imageResponse.data) {
      throw new Error("Original image download failed.");
    }

    await fs.writeFile(inputPath, imageResponse.data);

    // ==========================================
    // 📦 Create FormData
    // ==========================================
    const form = new FormData();

    form.append(
      "image",
      fs.createReadStream(inputPath),
      {
        filename: "image.jpg",
        contentType: "image/jpeg"
      }
    );

    form.append("prompt", prompt);
    form.append("resolution", "2K");
    form.append("ratio", "match_input_image");

    // ==========================================
    // 🤖 AI Image Edit API
    // ==========================================
    const response = await axios.post(
      "https://xrahat-image-edit.vercel.app/api/edit",
      form,
      {
        headers: {
          ...form.getHeaders()
        },
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const data = response.data || {};

    // ==========================================
    // ❌ API Error Check
    // ==========================================
    if (!data.success || !data.imageUrl) {
      throw new Error(
        data.error ||
        data.message ||
        "AI image generation failed."
      );
    }

    // ==========================================
    // ⬇️ Download Generated Image
    // ==========================================
    const generatedImage = await axios.get(
      data.imageUrl,
      {
        responseType: "arraybuffer",
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    if (!generatedImage.data) {
      throw new Error(
        "Generated image download failed."
      );
    }

    await fs.writeFile(
      outputPath,
      generatedImage.data
    );

    // ==========================================
    // 📤 Send Edited Image
    // ==========================================
    await api.sendMessage(
      {
        body:
          "✅ | Image Edit Complete!\n\n" +
          `📝 Prompt: ${prompt}\n` +
          "🤖 AI Editor: mehedi\n" +
          "✨ Quality: 2K",

        attachment: fs.createReadStream(outputPath)
      },
      threadID,
      messageID
    );

  } catch (error) {
    console.error(
      "[EDIT COMMAND ERROR]",
      error
    );

    // ==========================================
    // ❌ Error Message
    // ==========================================
    let errorMessage =
      "❌ | Image edit failed!";

    if (error.response) {
      const apiError =
        error.response.data?.error ||
        error.response.data?.message;

      if (apiError) {
        errorMessage +=
          `\n\n⚠️ API Error: ${apiError}`;
      } else {
        errorMessage +=
          `\n\n⚠️ Status: ${error.response.status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      errorMessage +=
        "\n\n⏱️ Request timeout. আবার চেষ্টা করুন।";
    } else if (
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED"
    ) {
      errorMessage +=
        "\n\n🌐 API server-এর সাথে connection করা যায়নি।";
    } else if (error.message) {
      errorMessage +=
        `\n\n⚠️ ${error.message}`;
    }

    return api.sendMessage(
      errorMessage,
      threadID,
      messageID
    );

  } finally {
    // ==========================================
    // 🧹 Cleanup Cache
    // ==========================================
    setTimeout(async () => {
      try {
        if (
          inputPath &&
          await fs.pathExists(inputPath)
        ) {
          await fs.remove(inputPath);
        }

        if (
          outputPath &&
          await fs.pathExists(outputPath)
        ) {
          await fs.remove(outputPath);
        }

      } catch (cleanupError) {
        console.error(
          "[EDIT CLEANUP ERROR]",
          cleanupError.message
        );
      }
    }, 10000);
  }
};
