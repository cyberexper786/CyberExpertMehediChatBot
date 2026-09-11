const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "theme",
    aliases: ["aitheme", "changetheme"],
    version: "3.0",
    author: "Siam Ahmed Saan",
    countDown: 5,
    role: 1,

    description: {
      en: "Create and apply AI themes for group chats",
      vi: "Create and apply AI themes for group chats"
    },

    category: "box chat",

    guide: {
      en:
        "{pn}\n" +
        "{pn} id\n" +
        "{pn} apply <ID>\n" +
        "{pn} <description>\n\n" +
        "Example:\n" +
        "{pn} blue ocean sunset purple\n" +
        "Then reply 1-5 to select a theme."
    }
  },

  langs: {
    en: {
      generating: "🎨 Generating AI themes...\nPlease wait...",
      noThemes: "❌ No AI themes were generated.",
      invalid: "❌ Please reply with a number from 1 to %1.",
      notAuthor: "❌ Only the person who created the request can select a theme.",
      applying: "🎨 Applying theme...",
      applied: "✅ Theme applied successfully!",
      error: "❌ Error:\n%1",
      missingId: "❌ Please enter a Theme ID.\n\nExample:\n{pn} apply 123456789",
      applyingId: "🎨 Applying Theme ID: %1...",
      appliedId: "✅ Theme ID %1 applied successfully!",
      current: "🎨 Current Theme\n\n📌 Theme ID: %1\n🎨 Color: %2"
    }
  },

  onStart: async function ({
    args,
    message,
    event,
    api,
    getLang,
    commandName
  }) {

    const command = args[0]?.toLowerCase();

    /*
    ==========================================
    SHOW CURRENT THEME ID
    ==========================================
    */

    if (command === "id") {
      try {
        const info = await api.getThreadInfo(event.threadID);

        const themeId =
          info?.threadTheme?.id ||
          info?.threadTheme?.theme_fbid ||
          info?.color ||
          "Default";

        return message.reply(
          `📌 Current Theme ID: ${themeId}`
        );

      } catch (e) {
        return message.reply(
          getLang("error", e.message || e)
        );
      }
    }

    /*
    ==========================================
    APPLY THEME BY ID
    ==========================================
    */

    if (
      command === "apply" ||
      command === "set"
    ) {

      const themeId = args[1];

      if (!themeId) {
        return message.reply(
          getLang("missingId")
        );
      }

      try {

        await message.reply(
          getLang("applyingId", themeId)
        );

        /*
        New FCA method
        */

        if (
          typeof api.setThreadThemeMqtt ===
          "function"
        ) {

          await api.setThreadThemeMqtt(
            event.threadID,
            themeId
          );

        }

        /*
        Old FCA fallback
        */

        else if (
          typeof api.changeThreadColor ===
          "function"
        ) {

          await api.changeThreadColor(
            themeId,
            event.threadID
          );

        }

        else {

          throw new Error(
            "Your FCA does not support theme changing."
          );
        }

        return message.reply(
          getLang(
            "appliedId",
            themeId
          )
        );

      } catch (e) {

        return message.reply(
          getLang(
            "error",
            e.message || e
          )
        );
      }
    }

    /*
    ==========================================
    GENERATE AI THEME
    ==========================================
    */

    const prompt =
      args.join(" ").trim();

    if (!prompt) {

      try {

        const info =
          await api.getThreadInfo(
            event.threadID
          );

        const theme =
          info?.threadTheme;

        const themeId =
          theme?.id ||
          theme?.theme_fbid ||
          info?.color ||
          "Default";

        const color =
          info?.color ||
          theme?.accessibility_label ||
          "Default";

        return message.reply(
          getLang(
            "current",
            themeId,
            color
          )
        );

      } catch (e) {

        return message.reply(
          getLang(
            "error",
            e.message || e
          )
        );
      }
    }

    try {

      await message.reply(
        getLang("generating")
      );

      /*
      Check AI Theme API
      */

      if (
        typeof api.createAITheme !==
        "function"
      ) {

        return message.reply(
          "❌ AI Theme API is not installed in your FCA.\n\n" +
          "Your theme command is working, but your current FCA does not have createAITheme().\n\n" +
          "You need a newer FCA/theme-supported API."
        );
      }

      /*
      Generate 5 themes
      */

      const themes =
        await api.createAITheme(
          prompt,
          5
        );

      if (
        !Array.isArray(themes) ||
        themes.length === 0
      ) {

        return message.reply(
          getLang("noThemes")
        );
      }

      let list = "";
      const attachments = [];

      /*
      URL extractor
      */

      const getUrl = (obj) => {

        if (!obj) return null;

        if (typeof obj === "string") {
          return obj;
        }

        return (
          obj.uri ||
          obj.url ||
          obj.image_url ||
          null
        );
      };

      /*
      Process themes
      */

      for (
        let i = 0;
        i < themes.length;
        i++
      ) {

        const theme = themes[i];

        const id =
          theme?.id ||
          theme?.theme_id ||
          theme?.theme_fbid ||
          "Unknown";

        let color =
          theme?.accessibility_label ||
          "AI Generated";

        if (
          Array.isArray(
            theme?.gradient_colors
          )
        ) {

          color =
            theme.gradient_colors.join(
              " → "
            );
        }

        list +=
          `${i + 1}. 📌 Theme ID: ${id}\n` +
          `   🎨 Color: ${color}\n` +
          `   ✨ AI Generated\n\n`;

        /*
        Preview images
        */

        const urls = [];

        if (
          theme?.preview_image_urls
        ) {

          const light =
            getUrl(
              theme.preview_image_urls
                .light_mode
            );

          const dark =
            getUrl(
              theme.preview_image_urls
                .dark_mode
            );

          if (light) {
            urls.push({
              url: light,
              name: `theme_${i + 1}_light.png`
            });
          }

          if (
            dark &&
            dark !== light
          ) {

            urls.push({
              url: dark,
              name: `theme_${i + 1}_dark.png`
            });
          }
        }

        /*
        Fallback image
        */

        if (
          urls.length === 0 &&
          theme?.background_asset?.image
        ) {

          const bg =
            getUrl(
              theme.background_asset.image
            );

          if (bg) {

            urls.push({
              url: bg,
              name: `theme_${i + 1}.png`
            });
          }
        }

        /*
        Download preview
        */

        for (const item of urls) {

          try {

            const stream =
              await getStreamFromURL(
                item.url,
                item.name
              );

            if (stream) {
              attachments.push(stream);
            }

          } catch (e) {

            console.error(
              "Theme image error:",
              e.message
            );
          }
        }
      }

      const body =
        `✨ Generated ${themes.length} AI Theme(s)!\n\n` +
        `📝 Prompt: ${prompt}\n\n` +
        list +
        `↩️ Reply with 1-${themes.length} to apply your favorite theme.`;

      /*
      Send preview
      */

      message.reply(
        {
          body,
          attachment:
            attachments.length
              ? attachments
              : undefined
        },
        (err, info) => {

          if (err) {

            return message.reply(
              body,
              (retryErr, retryInfo) => {

                if (retryErr) return;

                global.GoatBot.onReply.set(
                  retryInfo.messageID,
                  {
                    commandName,
                    messageID:
                      retryInfo.messageID,
                    author:
                      event.senderID,
                    themes
                  }
                );
              }
            );
          }

          global.GoatBot.onReply.set(
            info.messageID,
            {
              commandName,
              messageID:
                info.messageID,
              author:
                event.senderID,
              themes
            }
          );
        }
      );

    } catch (e) {

      console.error(
        "AI Theme Error:",
        e
      );

      return message.reply(
        getLang(
          "error",
          e.message || e
        )
      );
    }
  },

  /*
  ==========================================
  REPLY HANDLER
  ==========================================
  */

  onReply: async function ({
    message,
    Reply,
    event,
    api,
    getLang
  }) {

    const {
      author,
      themes,
      messageID
    } = Reply;

    if (
      event.senderID !== author
    ) {

      return message.reply(
        getLang("notAuthor")
      );
    }

    const selection =
      parseInt(
        event.body.trim()
      );

    if (
      isNaN(selection) ||
      selection < 1 ||
      selection > themes.length
    ) {

      return message.reply(
        getLang(
          "invalid",
          themes.length
        )
      );
    }

    const selected =
      themes[selection - 1];

    const themeId =
      selected?.id ||
      selected?.theme_id ||
      selected?.theme_fbid;

    if (!themeId) {

      return message.reply(
        "❌ Selected theme ID was not found."
      );
    }

    try {

      await message.reply(
        getLang("applying")
      );

      /*
      New theme API
      */

      if (
        typeof api.setThreadThemeMqtt ===
        "function"
      ) {

        await api.setThreadThemeMqtt(
          event.threadID,
          themeId
        );
      }

      /*
      Old API fallback
      */

      else if (
        typeof api.changeThreadColor ===
        "function"
      ) {

        await api.changeThreadColor(
          themeId,
          event.threadID
        );
      }

      else {

        throw new Error(
          "Your FCA does not support theme changing."
        );
      }

      await message.reply(
        `${getLang("applied")}\n\n` +
        `📌 Theme ID: ${themeId}`
      );

      /*
      Remove old preview
      */

      try {
        await api.unsendMessage(
          messageID
        );
      } catch {}

    } catch (e) {

      return message.reply(
        getLang(
          "error",
          e.message || e
        )
      );
    }
  }
};
