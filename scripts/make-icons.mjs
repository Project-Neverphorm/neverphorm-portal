import sharp from "sharp";

const src  = "public/pn-logo.png";

// full logo versions
await sharp(src).resize(512, 512).png().toFile("app/icon.png");
await sharp(src).resize(180, 180).png().toFile("app/apple-icon.png");

// optional: mascot-only crop for cleaner tab icon
// tweak left/top/width/height if the face isn't centered
await sharp(src)
    .extract({ left: 430, top: 190, width: 580, height: 580 })
    .resize(512, 512)
    .png()
    .toFile("public/pn-mascot-icon.png");

console.log("Icons generated");