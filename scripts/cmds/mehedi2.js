const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "mehedi2",
    version: "3.0",
    role: 0,
    author: "MEHEDI HASAN MIRAZ × Modified",
    description: "18+ Random Hot Video",
    category: "18+",
    usages: "hot",
    cooldowns: 5
  },

  onStart: async function ({ event, api }) {
    const videos = [
      "https://files.catbox.moe/2yr7tt.mp4",
      "https://files.catbox.moe/83ipdo.mp4",
      "https://files.catbox.moe/wo30ui.mp4",
      "https://files.catbox.moe/h9wg9k.mp4",
      "https://files.catbox.moe/m3gd3l.mp4",
      "https://files.catbox.moe/ke7v7i.mp4",
      "https://files.catbox.moe/d585sn.mp4",
      "https://files.catbox.moe/h7nevt.mp4",
      "https://files.catbox.moe/e5ovjo.mp4",
      "https://files.catbox.moe/c3dygo.mp4",
      "https://files.catbox.moe/21uywy.mp4",
      "https://files.catbox.moe/v6miwy.mp4",
      "https://files.catbox.moe/7fntxs.mp4",
      "https://files.catbox.moe/6b2u6t.mp4",
      "https://files.catbox.moe/7pbsoz.mp4",
      "https://files.catbox.moe/l43hd9.mp4",
      "https://files.catbox.moe/1hb473.mp4",
      "https://files.catbox.moe/5d1elo.mp4",
      "https://files.catbox.moe/dm08f7.mp4",
      "https://files.catbox.moe/kmepba.mp4",
      "https://files.catbox.moe/atihux.mp4",
      "https://files.catbox.moe/zwlvks.mp4",
      "https://files.catbox.moe/cpmgx2.mp4",
      "https://files.catbox.moe/x0edhn.mp4",
      "https://files.catbox.moe/cllkp1.mp4",
      "https://files.catbox.moe/xvrzfc.mp4",
      "https://files.catbox.moe/i8u4kd.mp4",
      "https://files.catbox.moe/94vtoq.mp4",
      "https://files.catbox.moe/q6i2rm.mp4",
      "https://files.catbox.moe/xz0klw.mp4",
      "https://files.catbox.moe/ptce1i.mp4"
    ];

    const randomLink = videos[Math.floor(Math.random() * videos.length)];
    const path = __dirname + "/cache/mehedi.mp4";  // নতুন ফাইলের নাম

    try {
      const response = await axios({
        url: randomLink,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: "💫__𝗧𝘂𝗺𝗶 𝗮𝗺𝗮𝗸𝗲 𝘁𝘂𝗺𝗮𝗿 𝗯𝗲𝗸𝘁𝗶𝗴𝗼𝘁𝗼 𝗳𝘂𝗹𝗹 𝗯𝗮𝗻𝗮𝘂 𝗮𝗺𝗶 𝘀𝗮𝗿𝗮 𝗷𝗶𝗯𝗼𝗻 𝘁𝘂𝗺𝗮𝗸𝗲𝗶 𝘀𝘂𝗯𝗮𝘀𝗵 𝗱𝗶𝗯𝗼__⚡",
            attachment: fs.createReadStream(path)
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      });

      writer.on("error", (err) => {
        api.sendMessage("🍂🍓__মাইশা আপু 😔 প্লিজ ভিডিও টা দাও গো__🍂🍓", event.threadID);
        console.error(err);
      });

    } catch (error) {
      api.sendMessage("Error হয়েছে, আবার চেষ্টা কর ভাই!", event.threadID);
      console.error(error);
    }
  }
};
