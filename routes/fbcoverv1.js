const fs = require('fs');
const { loadImage, createCanvas, registerFont } = require("canvas");
const axios = require("axios");
const path = require("path");
const jimp = require("jimp");
const express = require("express");

const router = express.Router();

router.get("/xnil/fbcover/v1", async (req, res) => {
  try {
    const pathImg = path.join(__dirname, 'cache', 'fbcover1.png');
    const pathAva = path.join(__dirname, 'cache', 'fbcover2.png');
    const pathLine = path.join(__dirname, 'cache', 'fbcover3.png');
    const __root = path.resolve(__dirname, "cache");

    // Ensure the cache directory exists
    if (!fs.existsSync(__root)) {
      fs.mkdirSync(__root);
    }

    // Get query parameters
    const tenchinh = req.query.name;
    const color = req.query.color || '#ffffff';
    const address = req.query.address;
    const email = req.query.email;
    const subname = req.query.subname;
    const phoneNumber = req.query.sdt;
    const uid = req.query.uid;

    if (!address || !tenchinh || !email || !subname || !phoneNumber || !uid) {
      return res.json({ error: 'Missing data to process the request' });
    }

    const name = tenchinh.toUpperCase();

    // Fetch avatar, background, and effect images
    const avtAnime = (
      await axios.get(`https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde566`, { responseType: "arraybuffer" })
    ).data;
    const background = (
      await axios.get(`https://1.bp.blogspot.com/-ZyXHJE2S3ew/YSdA8Guah-I/AAAAAAAAwtQ/udZEj3sXhQkwh5Qn8jwfjRwesrGoY90cwCNcBGAsYHQ/s0/bg.jpg`, { responseType: "arraybuffer" })
    ).data;
    const hieuung = (
      await axios.get(`https://1.bp.blogspot.com/-zl3qntcfDhY/YSdEQNehJJI/AAAAAAAAwtY/C17yMRMBjGstL_Cq6STfSYyBy-mwjkdQwCNcBGAsYHQ/s0/mask.png`, { responseType: "arraybuffer" })
    ).data;

    // Save images locally
    fs.writeFileSync(pathAva, Buffer.from(avtAnime, "binary"));
    fs.writeFileSync(pathImg, Buffer.from(background, "binary"));
    fs.writeFileSync(pathLine, Buffer.from(hieuung, "binary"));

    // Circle avatar processing using Jimp
    let avatar = await jimp.read(pathAva);
    avatar.circle();
    const avatarBuffer = await avatar.getBufferAsync("image/png");

    // Download and register fonts
    if (!fs.existsSync(path.join(__dirname, 'cache', 'UTMAvoBold.ttf'))) {
      const getfont2 = (
        await axios.get(`https://drive.google.com/u/0/uc?id=1DuI-ou9OGEkII7n8odx-A7NIcYz0Xk9o&export=download`, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(path.join(__dirname, 'cache', 'UTMAvoBold.ttf'), Buffer.from(getfont2, "binary"));
    }

    // Create canvas and draw the images
    let baseImage = await loadImage(pathImg);
    let baseAva = await loadImage(avatarBuffer);
    let baseLine = await loadImage(pathLine);

    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    // Draw background and avatar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAva, 824, 180, 285, 285);

    // Add text and effects
    registerFont(path.join(__dirname, 'cache', 'UTMAvoBold.ttf'), { family: "UTMAvoBold" });
    ctx.strokeStyle = "rgba(255,255,255, 0.2)";
    ctx.lineWidth = 3;
    ctx.font = "100px UTMAvoBold";
    ctx.strokeText(name, 30, 100);
    ctx.fillText(name, 680, 270);
    ctx.font = "40px UTMAvoBold";
    ctx.fillText(subname.toUpperCase(), 680, 320);
    ctx.font = "23px UTMAvoBold";
    ctx.fillText(phoneNumber.toUpperCase(), 1350, 252);
    ctx.fillText(email.toUpperCase(), 1350, 332);
    ctx.fillText(address.toUpperCase(), 1350, 410);

    // Apply the mask effect
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(baseLine, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the image
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // Send the final image file
    return res.sendFile(pathImg);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
