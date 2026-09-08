const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "love19",
    aliases: ["love", "lovematch", "pair"],
    version: "9.0.0",
    author: "nazrul",
    role: 0,
    shortDescription: "Love Match",
    longDescription: "Create a Love Match image between two users.",
    category: "fun",
    guide: {
      en: "{pn} @mention"
    },
    cooldowns: 5,
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

    // 2 জন mention
    if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    }

    // 1 জন mention
    else if (mentions.length === 1) {
      user2 = mentions[0];
    }

    // Mention না করলে
    else {
      return api.sendMessage(
        "💗 একজনকে mention করুন!\n\nExample:\n.love19 @mention",
        event.threadID,
        event.messageID
      );
    }

    // নিজের সাথে pair
    if (user1 === user2) {
      return api.sendMessage(
        "😂 নিজের সাথে Love Match করা যাবে না!\nঅন্য একজনকে mention করুন।",
        event.threadID,
        event.messageID
      );
    }

    const cache = path.join(__dirname, "cache");
    await fs.ensureDir(cache);

    const file = path.join(
      cache,
      `love19_${Date.now()}_${Math.floor(Math.random() * 99999)}.jpg`
    );

    try {

      // =========================
      // GET USER INFORMATION
      // =========================

      const info = await getUserInfo(api, [user1, user2]);

      const name1 =
        info[user1]?.name ||
        "User 1";

      const name2 =
        info[user2]?.name ||
        "User 2";

      // =========================
      // LOVE %
      // =========================

      const percent =
        Math.floor(Math.random() * 51) + 50;

      let status;

      if (percent >= 95) {
        status = "💍 SOULMATE";
      } else if (percent >= 85) {
        status = "💖 PERFECT MATCH";
      } else if (percent >= 70) {
        status = "🥰 GREAT COUPLE";
      } else if (percent >= 55) {
        status = "💕 CUTE MATCH";
      } else {
        status = "😅 TRY AGAIN";
      }

      // =========================
      // GET AVATARS
      // =========================

      const avatar1 =
        await getAvatar(api, user1, info[user1]);

      const avatar2 =
        await getAvatar(api, user2, info[user2]);

      // =========================
      // CREATE IMAGE
      // =========================

      await createLoveImage(
        avatar1,
        avatar2,
        name1,
        name2,
        percent,
        status,
        file
      );

      // =========================
      // SEND IMAGE
      // =========================

      await api.sendMessage(
        {
          body:
`╭──────────────╮
     💕 LOVE MATCH 💕
╰──────────────╯

👤 ${name1}
❤️
👤 ${name2}

💘 Love: ${percent}%
💞 ${status}

✨ Best wishes for this pair!`,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        async () => {
          try {
            await fs.remove(file);
          } catch (e) {}
        },
        event.messageID
      );

    } catch (error) {

      console.error(
        "\n========== LOVE19 ERROR =========="
      );

      console.error(error);

      console.error(
        "==================================\n"
      );

      try {
        await fs.remove(file);
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


// ==================================================
// GET USER INFO
// ==================================================

function getUserInfo(api, ids) {

  return new Promise((resolve, reject) => {

    api.getUserInfo(ids, (error, data) => {

      if (error) {
        return reject(error);
      }

      resolve(data || {});
    });

  });

}


// ==================================================
// GET AVATAR
// ==================================================

async function getAvatar(api, uid, user) {

  // -----------------------------------------------
  // Method 1: thumbSrc
  // -----------------------------------------------

  const possibleUrls = [];

  if (user) {

    if (user.thumbSrc)
      possibleUrls.push(user.thumbSrc);

    if (user.profileUrl)
      possibleUrls.push(user.profileUrl);

    if (user.avatar)
      possibleUrls.push(user.avatar);

    if (user.avatarUrl)
      possibleUrls.push(user.avatarUrl);

    if (user.imageUrl)
      possibleUrls.push(user.imageUrl);

    if (user.photoUrl)
      possibleUrls.push(user.photoUrl);
  }

  // -----------------------------------------------
  // Method 2: Facebook Graph
  // -----------------------------------------------

  possibleUrls.push(
    `https://graph.facebook.com/${uid}/picture?width=720&height=720`
  );

  // -----------------------------------------------
  // Try every URL
  // -----------------------------------------------

  for (const url of possibleUrls) {

    try {

      if (!url || typeof url !== "string")
        continue;

      const response = await axios.get(
        url,
        {
          responseType: "arraybuffer",
          timeout: 15000,
          maxRedirects: 5,
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
            Buffer.from(response.data)
          );

        if (image.bitmap.width > 10) {
          return image;
        }
      }

    } catch (error) {
      console.log(
        `Avatar failed for ${uid}`
      );
    }
  }

  // -----------------------------------------------
  // Final fallback
  // -----------------------------------------------

  return createFallbackAvatar();
}


// ==================================================
// FALLBACK AVATAR
// ==================================================

function createFallbackAvatar() {

  const img =
    new Jimp(
      600,
      600,
      0xffd8d8d8
    );

  // Simple head
  img.scan(
    0,
    0,
    600,
    600,
    function (x, y, idx) {

      const cx = 300;
      const cy = 235;

      const dx = x - cx;
      const dy = y - cy;

      if (
        dx * dx +
        dy * dy <
        105 * 105
      ) {

        this.bitmap.data[idx] = 110;
        this.bitmap.data[idx + 1] = 110;
        this.bitmap.data[idx + 2] = 110;
        this.bitmap.data[idx + 3] = 255;
      }

    }
  );

  // Body
  img.scan(
    0,
    300,
    600,
    300,
    function (x, y, idx) {

      const cx = 300;
      const cy = 570;

      const dx = x - cx;
      const dy = y - cy;

      if (
        (dx * dx) / (210 * 210) +
        (dy * dy) / (230 * 230) <
        1
      ) {

        this.bitmap.data[idx] = 110;
        this.bitmap.data[idx + 1] = 110;
        this.bitmap.data[idx + 2] = 110;
        this.bitmap.data[idx + 3] = 255;
      }

    }
  );

  return img;
}


// ==================================================
// CIRCLE AVATAR
// ==================================================

function makeCircle(image, size) {

  image = image.clone();

  image.cover(size, size);

  const center = size / 2;
  const radius = center;

  image.scan(
    0,
    0,
    size,
    size,
    function (x, y, idx) {

      const dx = x - center;
      const dy = y - center;

      if (
        dx * dx +
        dy * dy >
        radius * radius
      ) {

        this.bitmap.data[idx + 3] = 0;
      }

    }
  );

  return image;
}


// ==================================================
// CREATE LOVE IMAGE
// ==================================================

async function createLoveImage(
  avatar1,
  avatar2,
  name1,
  name2,
  percent,
  status,
  output
) {

  const W = 1200;
  const H = 1200;

  // Background
  const bg =
    new Jimp(
      W,
      H,
      0xff120719
    );

  // Main panel
  const panel =
    new Jimp(
      1100,
      1100,
      0xff24102d
    );

  bg.composite(
    panel,
    50,
    50
  );

  // Glow
  const glow1 =
    new Jimp(
      500,
      500,
      0xff7a164c
    );

  const glow2 =
    new Jimp(
      500,
      500,
      0xff321878
    );

  bg.composite(
    glow1,
    -100,
    250
  );

  bg.composite(
    glow2,
    800,
    250
  );

  // Fonts
  const font64 =
    await Jimp.loadFont(
      Jimp.FONT_SANS_64_WHITE
    );

  const font32 =
    await Jimp.loadFont(
      Jimp.FONT_SANS_32_WHITE
    );

  // ================================================
  // TITLE
  // ================================================

  bg.print(
    font64,
    0,
    90,
    {
      text: "LOVE MATCH",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    W,
    80
  );

  bg.print(
    font32,
    0,
    175,
    {
      text:
        "♥ PERFECT TOGETHER ♥",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    W,
    50
  );

  // ================================================
  // AVATARS
  // ================================================

  const size = 330;

  const left =
    makeCircle(
      avatar1,
      size
    );

  const right =
    makeCircle(
      avatar2,
      size
    );

  // Rings
  const ring1 =
    createRing(size + 24);

  const ring2 =
    createRing(size + 24);

  bg.composite(
    ring1,
    143,
    270
  );

  bg.composite(
    ring2,
    693,
    270
  );

  bg.composite(
    left,
    155,
    282
  );

  bg.composite(
    right,
    705,
    282
  );

  // ================================================
  // HEART
  // ================================================

  const heart =
    new Jimp(
      300,
      200,
      0x00000000
    );

  heart.scan(
    0,
    0,
    300,
    200,
    function (x, y, idx) {

      const nx =
        (x - 150) / 105;

      const ny =
        (y - 100) / 85;

      const value =
        Math.pow(
          nx * nx +
          ny * ny -
          1,
          3
        ) -
        nx * nx *
        Math.pow(ny, 3);

      if (value <= 0) {

        this.bitmap.data[idx] = 255;
        this.bitmap.data[idx + 1] = 45;
        this.bitmap.data[idx + 2] = 130;
        this.bitmap.data[idx + 3] = 255;
      }

    }
  );

  bg.composite(
    heart,
    450,
    445
  );

  // Percentage
  bg.print(
    font64,
    450,
    505,
    {
      text: `${percent}%`,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    300,
    80
  );

  // ================================================
  // NAMES
  // ================================================

  bg.print(
    font32,
    100,
    640,
    {
      text: name1,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    450,
    70
  );

  bg.print(
    font32,
    650,
    640,
    {
      text: name2,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    450,
    70
  );

  // ================================================
  // INFORMATION BOX
  // ================================================

  const box =
    new Jimp(
      980,
      300,
      0xff0c0711
    );

  bg.composite(
    box,
    110,
    750
  );

  bg.print(
    font32,
    145,
    790,
    {
      text:
        `♥ LOVE PERCENTAGE : ${percent}%`
    },
    900,
    55
  );

  bg.print(
    font32,
    145,
    865,
    {
      text:
        `♥ MATCH LEVEL : ${status}`
    },
    900,
    70
  );

  bg.print(
    font32,
    0,
    1080,
    {
      text:
        "Powered by GoatBot V2 • LOVE19",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    W,
    55
  );

  // ================================================
  // SAVE
  // ================================================

  await bg.quality(95).writeAsync(output);
}


// ==================================================
// CREATE RING
// ==================================================

function createRing(size) {

  const img =
    new Jimp(
      size,
      size,
      0x00000000
    );

  const center =
    size / 2;

  const outer =
    center * center;

  const inner =
    (center - 10) *
    (center - 10);

  img.scan(
    0,
    0,
    size,
    size,
    function (x, y, idx) {

      const dx =
        x - center;

      const dy =
        y - center;

      const d =
        dx * dx +
        dy * dy;

      if (
        d >= inner &&
        d <= outer
      ) {

        this.bitmap.data[idx] = 255;
        this.bitmap.data[idx + 1] = 50;
        this.bitmap.data[idx + 2] = 145;
        this.bitmap.data[idx + 3] = 255;

      } else {

        this.bitmap.data[idx + 3] = 0;

      }
    }
  );

  return img;
                        }
