module.exports = {
  config: {
    name: "rule",
    version: "2.0.0",
    author: "Shaon Ahmed",
    countDown: 5,
    role: 0,
    shortDescription: "Group rules",
    category: "utility"
  },

  onStart: async function ({ api, event, args }) {
    const fs = require("fs-extra");
    const path = require("path");

    const file = path.join(__dirname, "cache", "rule.json");

    if (!fs.existsSync(path.dirname(file))) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
    }

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "[]");
    }

    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    let group = data.find(x => x.threadID == event.threadID);

    if (!group) {
      group = {
        threadID: event.threadID,
        listRule: []
      };
      data.push(group);
    }

    const cmd = (args[0] || "").toLowerCase();
    const text = args.slice(1).join(" ").trim();

    if (cmd === "add") {
      if (!text) {
        return api.sendMessage(
          "❌ নিয়ম লিখুন!\nExample: rule add সবাইকে সম্মান করতে হবে।",
          event.threadID,
          event.messageID
        );
      }

      group.listRule.push(text);

      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return api.sendMessage(
        "✅ নিয়ম সফলভাবে যোগ হয়েছে!",
        event.threadID,
        event.messageID
      );
    }

    if (cmd === "list" || cmd === "all") {
      if (!group.listRule.length) {
        return api.sendMessage(
          "📜 এই গ্রুপে কোনো নিয়ম নেই।",
          event.threadID,
          event.messageID
        );
      }

      let msg = "📜 GROUP RULES\n\n";

      group.listRule.forEach((rule, i) => {
        msg += `${i + 1}. ${rule}\n`;
      });

      return api.sendMessage(
        msg,
        event.threadID,
        event.messageID
      );
    }

    if (cmd === "remove" || cmd === "rm" || cmd === "delete") {
      if (!text) {
        return api.sendMessage(
          "❌ নিয়মের নম্বর দিন!\nExample: rule remove 1",
          event.threadID,
          event.messageID
        );
      }

      if (text.toLowerCase() === "all") {
        group.listRule = [];

        fs.writeFileSync(file, JSON.stringify(data, null, 2));

        return api.sendMessage(
          "✅ সব নিয়ম মুছে ফেলা হয়েছে!",
          event.threadID,
          event.messageID
        );
      }

      const num = parseInt(text);

      if (isNaN(num) || num < 1 || num > group.listRule.length) {
        return api.sendMessage(
          "❌ ভুল নিয়ম নম্বর!",
          event.threadID,
          event.messageID
        );
      }

      group.listRule.splice(num - 1, 1);

      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return api.sendMessage(
        "✅ নিয়ম মুছে ফেলা হয়েছে!",
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      "📖 Rule Command\n\n" +
      "➤ rule add <নিয়ম>\n" +
      "➤ rule list\n" +
      "➤ rule remove <নম্বর>\n" +
      "➤ rule remove all",
      event.threadID,
      event.messageID
    );
  }
};
