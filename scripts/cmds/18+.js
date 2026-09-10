module.exports = {
  config: {
    name: "18+",
    version: "1.0.0",
    author: "Converted",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Random 18+ image"
    },
    longDescription: {
      en: "Sends a random adult image"
    },
    category: "nsfw",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    const links = [
      "https://i.postimg.cc/wTZJ1Yvb/images-1-29.jpg",
      "https://i.postimg.cc/ZRN79xP1/97420.jpg",
      "https://i.postimg.cc/tCB54cQs/27712360-320x180.jpg",
      "https://i.postimg.cc/0NzwGp5n/Hot-Indiane-cam.jpg",
      "https://i.postimg.cc/CMQ9m044/naughty-Bhabhi-licking-own-nipples.jpg",
      "https://i.postimg.cc/RFjyCQhD/cute-girl-showing-her-big-round-boobs.jpg",
      "https://i.postimg.cc/VsqDbcV6/beautiful-Pakistani-UsKMEr-striptease-show.jpg",
      "https://i.postimg.cc/g03mvQWD/10-272.jpg",
      "https://i.postimg.cc/fRnH3RwJ/foreplay-sex-with-beautiful-Bhabhi-before-fucking.jpg",
      "https://i.postimg.cc/Hkgfq28Z/NRI-Punjabi-girl-showing-her-big-boobies.jpg",
      "https://i.postimg.cc/yNWntgjp/unsatisfied-Desi-Milf-showing-her-big-clit.jpg",
      "https://i.postimg.cc/NjCk6Gt6/Desi-girl-showing-her-cute-small-boobies-on-VC.jpg",
      "https://i.postimg.cc/7YW5X5CZ/Desi-couple-hot-romance-in-shower.jpg",
      "https://i.postimg.cc/xTCkKv1Z/Bangladeshi-cute-village-girl-showing-boanding-sexeo-call.jpg",
      "https://i.postimg.cc/V6kw3FpQ/097.jpg",
      "https://i.postimg.cc/hjQnDGDp/e-inside-phabhi-fucked-doggy-style-with-moanings-1.jpg",
      "https://i.postimg.cc/13W1DF4v/cute-college-girl-showing-her-shaved-pussy-on-VC.jpg",
      "https://i.postimg.cc/Hn0fncf4/beautiful-south-Indirl-showing-her-tiny-tits.jpg",
      "https://i.postimg.cc/8PKZHmBf/Pakistani-mature-girl-paid-to-expose-her-assets.jpg",
      "https://i.postimg.cc/tJ7xCW18/super-bustcollege-gireplay-sexbhi.jpg",
      "https://i.postimg.cc/d0HdM53G/beautiful-Pakistani-bitch-showher-toplesked-beauty.jpg",
      "https://i.postimg.cc/8C89RbNB/ing-her-hoadeshi-girl-playing-with-her-boobs.jpg",
      "https://i.postimg.cc/fb9KK4BJ/beautiful-Bangladeshin-and-pleing-with-her-big-boobs.jpg",
      "https://i.postimg.cc/15XDBhzs/busty-sexy-escort-Bhabhi-captured-nude-after-sex.jpg",
      "https://i.postimg.cc/k4wtNf32/Sexy-Desi--in-front-ws-her-boobs.jpg",
      "https://i.postimg.cc/90K01kxQ/mature-Indian-girl-Shows-boobs-and-pussy.jpg",
      "https://i.postimg.cc/NfxfK5t0/cute-skinny-girl-fingering-her-small-pussy-on-VC.jpg",
      "https://i.postimg.cc/h41qr65y/beautiful-girl-fingering-pussy-with-hornpussy.jpg",
      "https://i.postimg.cc/9f5xsF4G/beautiful-Bangladeshi-wife-showing-her-topless-beauty.jpg",
      "https://i.postimg.cc/T2FsvX4Y/Dehati-cute-wife-shoy-expressiexy-white-boobs.jpg",
      "https://i.postimg.cc/x14Jttd7/beautiful-Bengali-girl-saree-striptease-show.jpg",
      "https://i.postimg.cc/Y0RjgxVd/097.jpg",
      "https://i.postimg.cc/g2nrX8KK/cute-Desi-girl-showing-pussy-for-BF.jpg",
      "https://i.postimg.cc/FsbwyBTr/received-834398520401522.jpg",
      "https://i.postimg.cc/K8mYBwJ1/beautiful-big-boob-Bangladeshi-sexy.jpg",
      "https://i.postimg.cc/65x9dgYd/big-boobs-Indian-girteasing-with-her-huge-melons.jpg",
      "https://i.postimg.cc/76cL8L3c/horny-Bangla-girl-fiMS.jpg",
      "https://i.postimg.cc/6pyBrvDv/Beautiful-Bangladeshi-girl-boob-sucking-by-lover.jpg",
      "https://i.postimg.cc/VL7CsXqr/cute-looking-Desi-girl-naked-bath-show-in-bathroom.jpg",
      "https://i.postimg.cc/NGdMRB5Z/ngering-pu-Bengali-girl-showing-her-shaved-pussy.jpg",
      "https://i.postimg.cc/yYSHWH9m/She-felt-a-hot-prickle-of-desire-while-making-nude-video.jpg",
      "https://i.postimg.cc/DZZVhknb/super-chubdeo-call.jggling-with-her-big-boobies.jpg",
      "https://i.postimg.cc/1zbdkgCb/horny-chubby-girl-showing-her-volutous-boobs.jpg",
      "https://i.postimg.cc/wvKWWC3p/Bangladeshties.jpg",
      "https://i.postimg.cc/fyy0YLZT/Bangladeshi-Cute-Girl-Showing-For-Lover-With-Bangla-talk.jpg",
      "https://i.postimg.cc/m2FP4Kgq/BBW-Bhabhi-showing-her-melons-while-dancing.jpg",
      "https://i.postimg.cc/tCPFksWY/shaggy-booan-wife-shows-her-boanding-sexeo-call.jpg",
      "https://i.postimg.cc/VLyCJzp1/Beautiful-girl-showing-her-sexy-soft-boobies-on-selfie-cam.jpg",
      "https://i.postimg.cc/50L3LKb0/Rajasthani-housewife-ginving-handjob-while-masturbating-pussy.jpg",
      "https://i.postimg.cc/vBF7Y7fd/Desi-slum-girl-showing-boobies-on-video-call.jpg",
      "https://i.postimg.cc/y82cjhfS/beautiful-cute-girl-boobs-show-selfie-MMS.jpg",
      "https://i.postimg.cc/hP5d4bR3/Beautiful-ing-her-hoadeshi-gir-lovers-stboobs.jpg",
      "https://i.postimg.cc/52z6xh36/cute-college-girl-in-glasses-showing-boobs.jpg",
      "https://i.postimg.cc/4NDxF8gZ/sexy-boobs-show-by-cute-Bangladeshi-girl.webp",
      "https://i.postimg.cc/XNcM0Qd4/Bangladeshi-girl-sucking-black-dick-of-BF.jpg",
      "https://i.postimg.cc/QtGz2TMF/big-boob-young-girl-getting-nude-on-cam.jpg",
      "https://i.postimg.cc/wj5R5Ksn/wing-her-sirl-showing-her-big-melons.jpg",
      "https://i.postimg.cc/pLkzbbXz/of-lover-My-Bengali-girl-boobs-pressing-outdoors.jpg",
      "https://i.postimg.cc/4ybn6VYV/big-boob-nude-Bhabhi-showing-her-melons.jpg",
      "https://i.postimg.cc/BQSvW887/sexy-cute-girl-showsshows-boobound-boobs.jpg",
      "https://i.postimg.cc/wBcPdBRF/cute-Bhabhi-sucking-big-red-dick-of-hubby.jpg",
      "https://i.postimg.cc/JnFQwwxP/Beautiful-Pakistani-girl-teasing-with-sexy-boobs-show.jpg",
      "https://i.postimg.cc/qBtPN4PB/horny-Desi-girl-masturbating-with-long-brinjal.jpg",
      "https://i.postimg.cc/CxMJf4RC/sexy-Indian-girl-fingering-pussy.webp",
      "https://i.postimg.cc/nhwK9fbZ/She-is-just-God-gifted.jpg",
      "https://i.postimg.cc/43kdSWpV/beautiful-g-cum-in-mwing-her-big-titties-on-video-call.jpg",
      "https://i.postimg.cc/qRq9XTgL/horny-girl-fingering-pussy-on-video-call.jpg"
    ];

    const link = links[Math.floor(Math.random() * links.length)];
    const cachePath = path.join(__dirname, "cache");
    const filePath = path.join(cachePath, "18plus.jpg");

    try {
      await fs.ensureDir(cachePath);

      const response = await axios({
        url: link,
        method: "GET",
        responseType: "stream",
        timeout: 20000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: "🔥 18+ Random Photo",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ ছবি লোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
  }
};
