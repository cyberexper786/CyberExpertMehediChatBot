module.exports.config = {
  name: "jummah",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Islamick Cyber Chat",
  description: "Jummah Mubarak Auto Reply",
  commandCategory: "events",
  usages: ".jummah",
  cooldowns: 5
};

module.exports.run = async ({ api, event, Threads }) => {
  try {
    const threadID = event.threadID;

    const threadData = await Threads.getData(threadID);
    const data = threadData.data || {};

    data.jummah = data.jummah === true ? false : true;

    await Threads.setData(threadID, { data });

    global.data.threadData.set(threadID, data);

    return api.sendMessage(
      data.jummah
        ? "🕌 জুম্মাহ মুবারক Auto-Reply চালু হয়েছে ✅"
        : "🕌 জুম্মাহ মুবারক Auto-Reply বন্ধ হয়েছে ❌",
      threadID,
      event.messageID
    );

  } catch (error) {
    console.error("JUMMAH ERROR:", error);
    return api.sendMessage(
      "❌ সেটিং পরিবর্তন করা যায়নি!\n\n" +
      "Threads database error হয়েছে।",
      event.threadID,
      event.messageID
    );
  }
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  try {
    const text = String(event.body || "").trim();

    if (!text.startsWith("জুম্মাহ মুবারক")) return;

    const threadData = await Threads.getData(event.threadID);
    const data = threadData.data || {};

    // OFF থাকলে reply করবে না
    if (data.jummah !== true) return;

    return api.sendMessage(
      "🕌🌸 জুম্মাহ মুবারক 🌸🕌\n\n" +
      "আসসালামু আলাইকুম 🩷\n" +
      "আল্লাহ আমাদের সকলের দোয়া কবুল করুন। 🤲",
      event.threadID
    );

  } catch (error) {
    console.error("JUMMAH EVENT ERROR:", error);
  }
};
