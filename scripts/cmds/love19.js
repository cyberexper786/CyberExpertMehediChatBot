/**
 * LOVE19 PREMIUM
 * GoatBot V2 Love Match Command
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "love19",
    aliases: ["love", "pair", "lovematch"],
    version: "9.0.0",
    author: "nazrul",
    role: 0,
    shortDescription: "Premium Love Match",
    longDescription: "Create a beautiful Love Match card with profile pictures.",
    category: "fun",
    guide: {
      en: "{pn} @mention [@mention]"
    },

    dependencies: {
      axios: "",
      "fs-extra": "",
      jimp: "0.22.12"
    }
  },

  onStart: async function ({ api, event }) {

    const mentions = Object.keys(event.mentions || {});

    let user1 = event.senderID;
    let user2;

    // দুইজন mention
    if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    }

    // একজন mention
    else if (mentions.length === 1) {
      user2 = mentions[0];
    }

    // mention না করলে
    else {
      return api.sendMessage(
        "💗 LOVE19 PREMIUM 💗\n\n" +
        "একজনকে mention করে লিখুন:\n" +
        "love19 @mention\n\n" +
        "অথবা দুইজনকে mention করুন:\n" +
        "love19 @mention @mention",
        event.threadID,
        event.messageID
      );
    }

    if (user1 === user2) {
      return api.sendMessage(
        "😂 একই ব্যক্তিকে নিজের সাথে pair করা যাবে না!\n\n" +
        "অন্য একজনকে mention করুন।",
        event.threadID,
        event.messageID
      );
    }

    const cache = path.join(__dirname, "cache");

    await fs.ensureDir(cache);

    const filePath = path.join(
      cache,
      `love19_${Date.now()}.png`
    );

    try {

      // =========================
      // USER INFORMATION
      // =========================

      const userInfo = await getUserInfo(
        api,
        [user1, user2]
      );

      const name1 =
        userInfo[user1]?.name ||
        "User 1";

      const name2 =
        userInfo[user2]?.name ||
        "User 2";


      // =========================
      // PROFILE PICTURE
      // =========================

      const avatar1 = await getAvatar(
        api,
        user1,
        userInfo
      );

      const avatar2 = await getAvatar(
        api,
        user2,
        userInfo
      );


      // =========================
      // LOVE %
      // =========================

      const percentage =
        Math.floor(Math.random() * 51) + 50;


      // =========================
      // MATCH STATUS
      // =========================

      let status;
      let emoji;

      if (percentage >= 95) {
        status = "Soulmate Forever";
        emoji = "💍";
      }

      else if (percentage >= 85) {
        status = "Perfect Couple";
        emoji = "💖";
      }

      else if (percentage >= 75) {
        status = "Great Couple";
        emoji = "🥰";
      }

      else if (percentage >= 65) {
        status = "Good Match";
        emoji = "💕";
      }

      else {
        status = "Cute Match";
        emoji = "💗";
      }


      // =========================
      // CREATE IMAGE
      // =========================

      await createLoveImage(
        avatar1,
        avatar2,
        name1,
        name2,
        percentage,
        status,
        emoji,
        filePath
      );


      // =========================
      // SEND IMAGE
      // =========================

      const message =
`╭───────〔 💕 LOVE MATCH 💕 〕───────╮

👑 ${name1}
❤️ ${name2}

💘 Love Percentage : ${percentage}%
${emoji} Match : ${status}

✨ এই জুটির জন্য রইল অনেক শুভকামনা! ✨

╰────────────────────────────────╯`;

      await api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        async () => {

          try {
            await fs.remove(filePath);
          } catch (e) {}

        },
        event.messageID
      );

    }

    catch (error) {

      console.error(
        "LOVE19 ERROR:",
        error
      );

      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      } catch (e) {}

      return api.sendMessage(
        "❌ Love Match তৈরি করতে সমস্যা হয়েছে!\n\n" +
        "আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};


// ========================================
// GET USER INFO
// ========================================

function getUserInfo(api, ids) {

  return new Promise(
    (resolve, reject) => {

      api.getUserInfo(
        ids,
        (err, data) => {

          if (err) {
            reject(err);
          }

          else {
            resolve(data || {});
          }
        }
      );

    }
  );
}


// ========================================
// GET REAL PROFILE PICTURE
// ========================================

async function getAvatar(
  api,
  uid,
  userInfo
) {

  let urls = [];

  const user = userInfo[uid] || {};


  // GoatBot profile picture
  if (user.thumbSrc) {
    urls.push(user.thumbSrc);
  }

  if (user.avatarUrl) {
    urls.push(user.avatarUrl);
  }

  if (user.imageUrl) {
    urls.push(user.imageUrl);
  }


  // Facebook picture
  urls.push(
    `https://graph.facebook.com/${uid}/picture?width=1000&height=1000`
  );


  for (const url of urls) {

    try {

      const response =
        await axios.get(
          url,
          {
            responseType:
              "arraybuffer",

            timeout:
              20000,

            maxRedirects:
              10,

            headers: {
              "User-Agent":
                "Mozilla/5.0"
            }
          }
        );

      if (
        response.data &&
        response.data.length > 100
      ) {

        const image =
          await Jimp.read(
            Buffer.from(
              response.data
            )
          );

        if (
          image.bitmap.width > 0 &&
          image.bitmap.height > 0
        ) {
          return image;
        }
      }

    }

    catch (error) {
      console.log(
        "Avatar failed:",
        url
      );
    }
  }


  // Fallback
  const fallback =
    new Jimp(
      500,
      500,
      0xffeeeeee
    );

  return fallback;
}


// ========================================
// CIRCLE AVATAR
// ========================================

function makeCircle(
  image,
  size
) {

  image.cover(
    size,
    size
  );

  const center =
    size / 2;

  const radius =
    size / 2;

  image.scan(
    0,
    0,
    size,
    size,
    function (x, y, idx) {

      const dx =
        x - center;

      const dy =
        y - center;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (
        distance > radius
      ) {

        this.bitmap.data[
          idx + 3
        ] = 0;
      }
    }
  );

  return image;
}


// ========================================
// CREATE PREMIUM LOVE IMAGE
// ========================================

async function createLoveImage(
  avatar1,
  avatar2,
  name1,
  name2,
  percentage,
  status,
  emoji,
  output
) {

  const WIDTH = 1200;
  const HEIGHT = 1200;


  // ======================================
  // BACKGROUND
  // ======================================

  const image =
    new Jimp(
      WIDTH,
      HEIGHT,
      0xff120817
    );


  // Top purple panel
  const top =
    new Jimp(
      WIDTH,
      500,
      0xff3b123f
    );

  image.composite(
    top,
    0,
    0
  );


  // Middle pink panel
  const middle =
    new Jimp(
      WIDTH,
      360,
      0xff65143f
    );

  image.composite(
    middle,
    0,
    400
  );


  // Bottom dark panel
  const bottom =
    new Jimp(
      WIDTH,
      440,
      0xff18091b
    );

  image.composite(
    bottom,
    0,
    760
  );


  // ======================================
  // FONTS
  // ======================================

  const fontBig =
    await Jimp.loadFont(
      Jimp.FONT_SANS_64_WHITE
    );

  const fontMedium =
    await Jimp.loadFont(
      Jimp.FONT_SANS_32_WHITE
    );

  const fontSmall =
    await Jimp.loadFont(
      Jimp.FONT_SANS_16_WHITE
    );


  // ======================================
  // TITLE
  // ======================================

  image.print(
    fontBig,
    0,
    55,
    {
      text:
        "LOVE MATCH",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    WIDTH,
    80
  );


  image.print(
    fontMedium,
    0,
    135,
    {
      text:
        "♥ Perfect Together ♥",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    WIDTH,
    50
  );


  // ======================================
  // AVATAR SIZE
  // ======================================

  const avatarSize = 300;


  const pic1 =
    makeCircle(
      avatar1.clone(),
      avatarSize
    );

  const pic2 =
    makeCircle(
      avatar2.clone(),
      avatarSize
    );


  // ======================================
  // AVATAR BACKGROUND CIRCLE
  // ======================================

  const circle1 =
    new Jimp(
      340,
      340,
      0xffff2f91
    );

  const circle2 =
    new Jimp(
      340,
      340,
      0xffff2f91
    );


  image.composite(
    circle1,
    150,
    220
  );

  image.composite(
    circle2,
    710,
    220
  );


  image.composite(
    pic1,
    170,
    240
  );

  image.composite(
    pic2,
    730,
    240
  );


  // ======================================
  // HEART AREA
  // ======================================

  const heartBox =
    new Jimp(
      240,
      180,
      0xffed1975
    );

  image.composite(
    heartBox,
    480,
    330
  );


  image.print(
    fontBig,
    480,
    355,
    {
      text:
        `${percentage}%`,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    240,
    80
  );


  // ======================================
  // NAMES
  // ======================================

  image.print(
    fontMedium,
    90,
    555,
    {
      text:
        name1,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    420,
    55
  );


  image.print(
    fontMedium,
    690,
    555,
    {
      text:
        name2,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    420,
    55
  );


  // ======================================
  // HEART TEXT
  // ======================================

  image.print(
    fontMedium,
    0,
    625,
    {
      text:
        "💕  LOVE CONNECTS TWO HEARTS  💕",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    WIDTH,
    60
  );


  // ======================================
  // INFO BOX
  // ======================================

  const info =
    new Jimp(
      1000,
      300,
      0xff08050bdd
    );

  image.composite(
    info,
    100,
    730
  );


  image.print(
    fontMedium,
    145,
    770,
    {
      text:
        `💘 LOVE PERCENTAGE : ${percentage}%`
    },
    900,
    55
  );


  image.print(
    fontMedium,
    145,
    845,
    {
      text:
        `${emoji} MATCH LEVEL : ${status}`
    },
    900,
    60
  );


  image.print(
    fontMedium,
    0,
    925,
    {
      text:
        "Different people ♥ Same feelings ♥",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    WIDTH,
    50
  );


  // ======================================
  // FOOTER
  // ======================================

  image.print(
    fontSmall,
    0,
    1035,
    {
      text:
        "✨ Made with Love • LOVE19 PREMIUM ✨",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    WIDTH,
    35
  );


  image.print(
    fontSmall,
    0,
    1080,
    {
      text:
        "Powered by GoatBot V2",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    WIDTH,
    35
  );


  // ======================================
  // SAVE
  // ======================================

  await image.writeAsync(
    output
  );
}
