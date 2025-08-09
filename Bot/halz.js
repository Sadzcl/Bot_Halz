// Import Module
require("./zcl");
require("./database/Menu/HalzMenu");
const fs = require("fs");
const axios = require("axios");

// Import Scrape
const Ai4Chat = require("./scrape/Ai4Chat");
const tiktok2 = require("./scrape/Tiktok");

module.exports = async (halz, m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body =
        msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;
    const pushname = msg.pushName || "Halz";
    const args = body.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();
    const q = args.join(" ");

    if (!body.startsWith(prefix)) return;

    const halzreply = (teks) =>
        halz.sendMessage(sender, { text: teks }, { quoted: msg });
    const isGroup = sender.endsWith("@g.us");
    const isAdmin = admin.includes(sender);
    const menuImage = fs.readFileSync(image);

    switch (command) {
        // Menu
        case "menu":
            {
                await halz.sendMessage(
                    sender,
                    {
                        image: menuImage,
                        caption: halzmenu,
                        mentions: [sender],
                    },
                    { quoted: msg },
                );
            }
            break;

        // Hanya Admin
        case "admin":
            {
                if (!isAdmin) return halzreply(mess.admin); // COntoh Penerapan Hanya Admin
                halzreply("🎁 *Kamu Adalah Admin*"); // Admin Akan Menerima Pesan Ini
            }
            break;

        // Hanya Group
        case "group":
            {
                if (!isGroup) return halzreply(mess.group); // Contoh Penerapan Hanya Group
                halzreply("🎁 *Kamu Sedang Berada Di Dalam Grup*"); // Pesan Ini Hanya Akan Dikirim Jika Di Dalam Grup
            }
            break;

        // AI Chat
        case "kirimkan":
            {
                if (!q)
                    return halzreply(
                        "⚠️ *Contoh:* !kirimkan ruu ketenagakerjaan",
                    );

                const fs = require("fs");
                const path = require("path");
                const axios = require("axios");
                const mime = require("mime-types");

                const fileList = require("./file_list.json");
                const keyword = q.toLowerCase();
                const match = fileList.find((item) =>
                    item.nama.toLowerCase().includes(keyword),
                );

                if (!match)
                    return halzreply(
                        `❌ File dengan kata kunci "${q}" tidak ditemukan.`,
                    );

                const kirimkanLink = match.link;
                const fileIdMatch = kirimkanLink.match(/\/d\/(.+?)\//);
                if (!fileIdMatch || !fileIdMatch[1])
                    return halzreply("❌ Link tidak valid.");

                const fileId = fileIdMatch[1];
                const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

                halzreply(mess.wait);

                try {
                    const response = await axios({
                        url: downloadUrl,
                        method: "GET",
                        responseType: "stream",
                    });

                    // Ambil nama file dari header
                    let fileName = `file_${Date.now()}.bin`;
                    const disposition = response.headers["content-disposition"];
                    const matchName = disposition?.match(/filename="(.+)"/);
                    if (matchName && matchName[1]) {
                        fileName = matchName[1];
                    }

                    const filePath = path.join(__dirname, fileName);

                    let totalBytes = 0;
                    response.data.on("data", (chunk) => {
                        totalBytes += chunk.length;
                        if (totalBytes > 100 * 1024 * 1024) {
                            response.data.destroy();
                            halzreply(
                                "❌ File terlalu besar (lebih dari 100MB).",
                            );
                        }
                    });

                    const writer = fs.createWriteStream(filePath);
                    response.data.pipe(writer);

                    writer.on("finish", async () => {
                        const mimetype =
                            mime.lookup(fileName) || "application/octet-stream";

                        let messageOptions = {
                            mimetype,
                            fileName,
                            caption: `📁 File: ${fileName}`,
                        };

                        if (mimetype.startsWith("image/")) {
                            await halz.sendMessage(
                                sender,
                                { image: { url: filePath }, ...messageOptions },
                                { quoted: msg },
                            );
                        } else if (mimetype.startsWith("video/")) {
                            await halz.sendMessage(
                                sender,
                                { video: { url: filePath }, ...messageOptions },
                                { quoted: msg },
                            );
                        } else {
                            await halz.sendMessage(
                                sender,
                                {
                                    document: { url: filePath },
                                    ...messageOptions,
                                },
                                { quoted: msg },
                            );
                        }

                        fs.unlinkSync(filePath); // Hapus file setelah dikirim
                    });

                    writer.on("error", () => {
                        halzreply("❌ Gagal menyimpan file.");
                    });
                } catch (err) {
                    console.error("GDrive download error:", err.message);
                    halzreply("❌ Terjadi kesalahan saat mengunduh file.");
                }
            }
            break;
        /*
case "ai": {
    if (!q) return halzreply("☘️ *Contoh:* !ai Apa itu JavaScript?");
        halzreply(mess.wait);
    try {
        const lenai = await Ai4Chat(q);
            await halzreply(`*Halz AI*\n\n${lenai}`);
                } catch (error) {
            console.error("Error:", error);
        halzreply(mess.error);
    }
}
break;

case "ttdl": {
    if (!q) return halzreply("⚠ *Mana Link Tiktoknya?*");
        halzreply(mess.wait);
    try {
        const result = await tiktok2(q); // Panggil Fungsi Scraper

            // Kirim Video
            await halz.sendMessage(
                sender,
                    {
                        video: { url: result.no_watermark },
                        caption: `*🎁 Halz Tiktok Downloader*`
                    },
                { quoted: msg }
            );

        } catch (error) {
            console.error("Error TikTok DL:", error);
        halzreply(mess.error);
    }
}
break;

case "igdl": {
    if (!q) return halzreply("⚠ *Mana Link Instagramnya?*");
    try {
        halzreply(mess.wait);

        // Panggil API Velyn
        const apiUrl = `https://www.velyn.biz.id/api/downloader/instagram?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.data.url[0]) {
            throw new Error("Link tidak valid atau API error");
        }

        const data = response.data.data;
        const mediaUrl = data.url[0];
        const metadata = data.metadata;

        // Kirim Media
        if (metadata.isVideo) {
            await halz.sendMessage(
                sender,
                    {
                        video: { url: mediaUrl },
                        caption: `*Instagram Reel*\n\n` +
                            `*Username :* ${metadata.username}\n` +
                            `*Likes :* ${metadata.like.toLocaleString()}\n` +
                            `*Comments :* ${metadata.comment.toLocaleString()}\n\n` +
                            `*Caption :* ${metadata.caption || '-'}\n\n` +
                            `*Source :* ${q}`
                    },
                    { quoted: msg }
                );
        } else {
            await halz.sendMessage(
                sender,
                    {
                        image: { url: mediaUrl },
                        caption: `*Instagram Post*\n\n` +
                            `*Username :* ${metadata.username}\n` +
                            `*Likes :* ${metadata.like.toLocaleString()}\n\n` +
                            `*Caption :* ${metadata.caption || '-'}`
                    },
                    { quoted: msg }
                );
            }

        } catch (error) {
            console.error("Error Instagram DL:", error);
        halzreply(mess.error);
    }
}
break;

// Game Tebak Angka
case "tebakangka": {
    const target = Math.floor(Math.random() * 100);
        halz.tebakGame = { target, sender };
    halzreply("*Tebak Angka 1 - 100*\n*Ketik !tebak [Angka]*");
}
break;

case "tebak": {
    if (!halz.tebakGame || halz.tebakGame.sender !== sender) return;
        const guess = parseInt(args[0]);
    if (isNaN(guess)) return halzreply("❌ *Masukkan Angka!*");

    if (guess === halz.tebakGame.target) {
        halzreply(`🎉 *Tebakkan Kamu Benar!*`);
            delete halz.tebakGame;
        } else {
            halzreply(guess > halz.tebakGame.target ? "*Terlalu Tinggi!*" : "*Terlalu rendah!*");
    }
}
break;

case "quote": {
    const quotes = [
        "Jangan menyerah, hari buruk akan berlalu.",
        "Kesempatan tidak datang dua kali.",
        "Kamu lebih kuat dari yang kamu kira.",
        "Hidup ini singkat, jangan sia-siakan."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    halzreply(`*Quote Hari Ini :*\n_"${randomQuote}"_`);
}
break;
*/
        default: {
            halzreply(mess.default);
        }
    }
};
