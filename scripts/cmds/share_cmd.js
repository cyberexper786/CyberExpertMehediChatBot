const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "share_cmd",
    aliases: ["s", "sc"],
    version: "2.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 3,
    role: 0,
    shortDescription: "Share bot files",
    longDescription: "Share accessible bot files directly as attachments.",
    category: "tool",
    guide: {
      en: "/s <filename> or /sc <filename>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;

    /* =========================================
       ADMIN ONLY
    ========================================= */

    const adminList = global.GoatBot?.config?.adminBot;

    if (!Array.isArray(adminList)) {
      return;
    }

    const isAdmin = adminList.some(
      id => String(id) === String(senderID)
    );

    if (!isAdmin) {
      return;
    }

    /* =========================================
       FILE NAME
    ========================================= */

    if (!Array.isArray(args) || args.length === 0) {
      return;
    }

    const requestedName = args.join(" ").trim();

    if (!requestedName) {
      return;
    }

    /* =========================================
       PATH SECURITY
    ========================================= */

    if (
      requestedName.includes("\0") ||
      requestedName.includes("..") ||
      requestedName.includes("/") ||
      requestedName.includes("\\") ||
      path.isAbsolute(requestedName)
    ) {
      return;
    }

    const root = path.resolve(process.cwd());

    /* =========================================
       SEARCH LOCATIONS
    ========================================= */

    const searchLocations = [
      root,
      path.join(root, "scripts", "cmds"),
      path.join(root, "scripts", "events"),
      path.join(root, "config"),
      __dirname
    ];

    let filePath = null;

    /* =========================================
       FIND FILE
    ========================================= */

    for (const directory of searchLocations) {
      try {
        const baseDirectory = path.resolve(directory);

        const candidate = path.resolve(
          baseDirectory,
          requestedName
        );

        const relative = path.relative(
          baseDirectory,
          candidate
        );

        if (
          relative.startsWith("..") ||
          path.isAbsolute(relative)
        ) {
          continue;
        }

        if (!(await fs.pathExists(candidate))) {
          continue;
        }

        const stat = await fs.stat(candidate);

        if (!stat.isFile()) {
          continue;
        }

        /* =====================================
           SYMLINK PROTECTION
        ===================================== */

        const realFile = await fs.realpath(candidate);

        const realDirectory = await fs.realpath(
          baseDirectory
        );

        const realRelative = path.relative(
          realDirectory,
          realFile
        );

        if (
          realRelative.startsWith("..") ||
          path.isAbsolute(realRelative)
        ) {
          continue;
        }

        filePath = realFile;
        break;

      } catch (_) {
        continue;
      }
    }

    /* =========================================
       FILE NOT FOUND
    ========================================= */

    if (!filePath) {
      return;
    }

    /* =========================================
       DETECT /sc
    ========================================= */

    const messageText = String(
      event.body || ""
    ).trim();

    const firstWord = messageText
      .split(/\s+/)[0]
      .toLowerCase();

    const isTextMode =
      firstWord === "/sc" ||
      firstWord === "sc";

    /* =========================================
       LOADING REACTION
    ========================================= */

    try {
      api.setMessageReaction(
        "🔰",
        messageID,
        () => {},
        true
      );
    } catch (_) {}

    /* =========================================
       DIRECT CODE TEXT
       
       /sc filename.js
    ========================================= */

    if (isTextMode) {
      try {
        const code = await fs.readFile(
          filePath,
          "utf8"
        );

        return api.sendMessage(
          code,
          threadID,
          () => {
            try {
              api.setMessageReaction(
                "🪽",
                messageID,
                () => {},
                true
              );
            } catch (_) {}
          },
          messageID
        );

      } catch (error) {
        console.error(
          "[SHARE_CMD TEXT ERROR]",
          error?.message || error
        );

        try {
          api.setMessageReaction(
            "❌",
            messageID,
            () => {},
            true
          );
        } catch (_) {}

        return;
      }
    }

    /* =========================================
       NORMAL FILE MODE
       
       /s filename.js
       /share_cmd filename.js
    ========================================= */

    try {
      const stream =
        fs.createReadStream(filePath);

      let finished = false;

      stream.on("error", () => {
        if (finished) {
          return;
        }

        try {
          api.setMessageReaction(
            "❌",
            messageID,
            () => {},
            true
          );
        } catch (_) {}
      });

      return api.sendMessage(
        {
          attachment: stream
        },
        threadID,
        () => {
          finished = true;

          try {
            api.setMessageReaction(
              "🪽",
              messageID,
              () => {},
              true
            );
          } catch (_) {}
        },
        messageID
      );

    } catch (error) {
      console.error(
        "[SHARE_CMD ERROR]",
        error?.message || error
      );

      try {
        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );
      } catch (_) {}

      return;
    }
  }
};
