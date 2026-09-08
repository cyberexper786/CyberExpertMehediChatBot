/**
 * LOVE19 - GoatBot V2
 * Pair two mentioned users and generate a Love Match image.
 *
 * Usage:
 * love19 @mention
 * love19 @mention @mention
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "love19",
    aliases: ["love", "lovematch", "pair"],
    version: "8.0.0",
    author: "nazrul",
    role: 0,
    shortDescription: "Create a Love Match card from mentions",
    longDescription: "Pair two users and generate a colorful Love Match image.",
    category: "fun",
    guide: {
      en: "{pn} @mention [@mention]"
    }
  },

  onStart: async function ({ api, event }) {
    const mentions = Object.keys(event.mentions || {});

    // একজন mention করলে sender + mention pair হবে
    let id1 = event.senderID;
    let id2;

    // দুইজন mention করলে তাদের pair করা হবে
    if (mentions.length >= 2) {
      id1 = mentions[0];
      id2 = mentions[1];
    } else if (mentions.length === 1) {
      id2 = mentions[0];
    } else {
      return api.sendMessage(
        "💗 একজনকে mention করে লিখুন:\n\nlove19 @mention\n\nঅথবা দুইজনকে mention করুন:\nlove19 @mention @mention",
        event.threadID,
        event.messageID
      );
    }

    if (id1 === id2) {
      return api.sendMessage(
        "😂 একই মানুষকে নিজের সাথে pair করা যাবে না!\nঅন্য একজনকে mention করুন।",
        event.threadID,
        event.messageID
      );
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    try {
      const info = await new Promise((resolve, reject) => {
        api.getUserInfo([id1, id2], (err, data) => {
          if (err) reject(err);
          else resolve(data || {});
        });
      });

      const name1 = info[id1]?.name || "User 1";
      const name2 = info[id2]?.name || "User 2";

      // 50% - 100%
      const percent = Math.floor(Math.random() * 51) + 50;

      let level;

      if (percent >= 95) {
        level = "💍 Soulmate!";
      } else if (percent >= 85) {
        level = "💖 Perfect Match!";
      } else if (percent >= 70) {
        level = "🥰 Great Couple!";
      } else if (percent >= 55) {
        level = "💕 Cute Match!";
      } else {
        level = "😅 Maybe Next Time!";
      }

      const avatar1 = await getAvatar(api, id1);
      const avatar2 = await getAvatar(api, id2);

      const output = path.join(
        cacheDir,
        `love19_${Date.now()}.png`
      );

      await createLoveCard(
        avatar1,
        avatar2,
        name1,
        name2,
        percent,
        level,
        output
      );

      const stream = fs.createReadStream(output);

      await api.sendMessage(
        {
          body:
`╭───〔 💕 LOVE MATCH 💕 〕───╮
│
│ 👑 ${name1}
│ ❤️ ${name2}
│
│ 💘 Love: ${percent}%
│ 💞 ${level}
│
╰──────────────────────────╯

✨ এই জুটির জন্য রইল অনেক শুভকামনা!`,
          attachment: stream
        },
        event.threadID,
        async () => {
          try {
            await fs.remove(output);
          } catch (_) {}
        },
        event.messageID
      );

    } catch (error) {
      console.error("LOVE19 ERROR:", error);

      return api.sendMessage(
        "❌ Love Match ছবি তৈরি করা যায়নি।\nকিছুক্ষণ পর আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};


// =============================
// GET PROFILE PICTURE
// =============================

async function getAvatar(api, uid) {
  try {
    const url =
      `https://graph.facebook.com/${uid}/picture?width=720&height=720`;

    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      maxRedirects: 5
    });

    return await Jimp.read(
      Buffer.from(res.data)
    );

  } catch (e) {

    // Fallback
    try {
      const data = await new Promise((resolve, reject) => {
        api.getUserInfo([uid], (err, result) => {
          if (err) reject(err);
          else resolve(result || {});
        });
      });

      const thumb = data[uid]?.thumbSrc;

      if (thumb) {
        const res = await axios.get(thumb, {
          responseType: "arraybuffer",
          timeout: 15000
        });

        return await Jimp.read(
          Buffer.from(res.data)
        );
      }

    } catch (_) {}

    // Last fallback
    return new Jimp(
      720,
      720,
      0xffe8f3ff
    );
  }
}


// =============================
// CIRCLE IMAGE
// =============================

function cropCircle(img, size) {

  img.cover(size, size);

  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  img.scan(
    0,
    0,
    size,
    size,
    function (x, y, idx) {

      const dx = x - cx;
      const dy = y - cy;

      if (
        dx * dx + dy * dy >
        radius * radius
      ) {
        this.bitmap.data[idx + 3] = 0;
      }
    }
  );

  return img;
}


// =============================
// CREATE LOVE CARD
// =============================

async function createLoveCard(
  a1,
  a2,
  name1,
  name2,
  percent,
  level,
  output
) {

  const W = 1200;
  const H = 1200;

  // Background
  const bg = new Jimp(
    W,
    H,
    0xff130816
  );

  // Main panel
  const panel = new Jimp(
    W - 100,
    H - 100,
    0x241026dd
  );

  bg.composite(
    panel,
    50,
    50
  );

  // Glow
  const glow1 = new Jimp(
    520,
    520,
    0x8e245555
  );

  const glow2 = new Jimp(
    520,
    520,
    0xff3b7655
  );

  bg.composite(
    glow1,
    -130,
    250
  );

  bg.composite(
    glow2,
    810,
    250
  );

  // Fonts
  const f64 = await Jimp.loadFont(
    Jimp.FONT_SANS_64_WHITE
  );

  const f32 = await Jimp.loadFont(
    Jimp.FONT_SANS_32_WHITE
  );

  const f24 = await Jimp.loadFont(
    Jimp.FONT_SANS_32_WHITE
  );

  // =============================
  // TITLE
  // =============================

  bg.print(
    f64,
    0,
    80,
    {
      text: "LOVE MATCH",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    W,
    90
  );

  bg.print(
    f32,
    0,
    165,
    {
      text: "♥ Perfect Together ♥",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    W,
    50
  );


  // =============================
  // AVATARS
  // =============================

  const size = 330;

  const left = cropCircle(
    a1.clone(),
    size
  );

  const right = cropCircle(
    a2.clone(),
    size
  );


  // =============================
  // AVATAR BORDERS
  // =============================

  const border1 = new Jimp(
    size + 20,
    size + 20,
    0xffff4f00
  );

  const border2 = new Jimp(
    size + 20,
    size + 20,
    0xffff4f00
  );

  makeRing(
    border1,
    size + 20,
    10
  );

  makeRing(
    border2,
    size + 20,
    10
  );

  bg.composite(
    border1,
    155,
    260
  );

  bg.composite(
    border2,
    695,
    260
  );

  bg.composite(
    left,
    165,
    270
  );

  bg.composite(
    right,
    705,
    270
  );


  // =============================
  // HEART
  // =============================

  const heart = new Jimp(
    300,
    180,
    0x00000000
  );

  heart.scan(
    0,
    0,
    300,
    180,
    function (x, y, idx) {

      const nx =
        (x - 150) / 105;

      const ny =
        (y - 90) / 80;

      const inside =
        Math.pow(
          nx * nx +
          ny * ny -
          1,
          3
        ) -
        nx * nx *
        Math.pow(ny, 3) <= 0;

      this.bitmap.data[
        idx + 3
      ] = inside ? 235 : 0;

      if (inside) {
        this.bitmap.data[idx] = 255;
        this.bitmap.data[idx + 1] = 45;
        this.bitmap.data[idx + 2] = 130;
      }
    }
  );

  bg.composite(
    heart,
    450,
    450
  );


  // =============================
  // PERCENTAGE
  // =============================

  bg.print(
    f64,
    450,
    505,
    {
      text: `${percent}%`,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    300,
    70
  );


  // =============================
  // NAMES
  // =============================

  bg.print(
    f32,
    110,
    620,
    {
      text: name1,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    420,
    60
  );

  bg.print(
    f32,
    670,
    620,
    {
      text: name2,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    420,
    60
  );


  // =============================
  // INFO BOX
  // =============================

  const box = new Jimp(
    980,
    310,
    0x08050cdd
  );

  bg.composite(
    box,
    110,
    730
  );

  bg.print(
    f32,
    150,
    770,
    {
      text:
        "♥ LOVE PERCENTAGE : " +
        percent +
        "%",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_LEFT
    },
    900,
    50
  );

  bg.print(
    f32,
    150,
    845,
    {
      text:
        "♥ MATCH LEVEL : " +
        level,
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_LEFT
    },
    900,
    80
  );

  bg.print(
    f24,
    150,
    955,
    {
      text:
        "Different people ♥ Same feelings ♥ Love Match",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    900,
    55
  );


  // =============================
  // FOOTER
  // =============================

  bg.print(
    f24,
    0,
    1080,
    {
      text:
        "Powered by GoatBot V2 • LOVE19",
      alignmentX:
        Jimp.HORIZONTAL_ALIGN_CENTER
    },
    W,
    50
  );


  // Save
  await bg.writeAsync(output);
}


// =============================
// CREATE RING
// =============================

function makeRing(
  img,
  size,
  thickness
) {

  const cx = size / 2;
  const cy = size / 2;

  const outer = cx * cx;

  const inner =
    (cx - thickness) *
    (cx - thickness);

  img.scan(
    0,
    0,
    size,
    size,
    function (x, y, idx) {

      const dx = x - cx;
      const dy = y - cy;

      const d =
        dx * dx +
        dy * dy;

      if (
        d >= inner &&
        d <= outer
      ) {

        this.bitmap.data[idx] = 255;
        this.bitmap.data[idx + 1] = 55;
        this.bitmap.data[idx + 2] = 145;
        this.bitmap.data[idx + 3] = 255;

      } else {

        this.bitmap.data[
          idx + 3
        ] = 0;
      }
    }
  );
}
