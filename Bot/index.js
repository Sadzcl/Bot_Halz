// ====== SERVER UNTUK REPLIT KEEP-ALIVE ======
const express = require("express");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "file_list.json");

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// ====== BOT WHATSAPP ======
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} = require("baileys");
const pino = require("pino");
const chalk = require("chalk");
const readline = require("readline");

// Metode Pairing
const usePairingCode = true;

// Prompt input di terminal
async function question(promt) {
    process.stdout.write(promt);
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        r1.question("", (ans) => {
            r1.close();
            resolve(ans);
        }),
    );
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./HalzSesi");

    // Versi WA terbaru
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Halz Using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const halz = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        version: version,
    });

    // Pairing Code
    if (usePairingCode && !halz.authState.creds.registered) {
        try {
            const phoneNumber = await question(
                "☘️ Masukan Nomor Diawali Dengan 62 :\n",
            );
            const code = await halz.requestPairingCode(phoneNumber.trim());
            console.log(`🎁 Pairing Code : ${code}`);
        } catch (err) {
            console.error("Failed to get pairing code:", err);
        }
    }

    // Simpan sesi login
    halz.ev.on("creds.update", saveCreds);

    // Info koneksi
    halz.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") {
            console.log(
                chalk.red("❌ Koneksi Terputus, Mencoba Menyambung Ulang"),
            );
            connectToWhatsApp();
        } else if (connection === "open") {
            console.log(chalk.green("✔ Bot Berhasil Terhubung Ke WhatsApp"));
        }
    });

    // Respon pesan masuk
    halz.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const body = (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ""
        ).trim();
        const sender = msg.key.remoteJid;
        const pushname = msg.pushName || "Halz";

        // Log pesan masuk
        const listColor = [
            "red",
            "green",
            "yellow",
            "magenta",
            "cyan",
            "white",
            "blue",
        ];
        const randomColor =
            listColor[Math.floor(Math.random() * listColor.length)];
        console.log(
            chalk.yellow.bold("Credit : Halz"),
            chalk.green.bold("[ WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](" : "),
            chalk.white(body),
        );

        // Hanya proses jika prefix "!" (abaikan kalau tidak pakai prefix)
        if (!body.startsWith("!")) return;

        // Paksa command jadi lowercase agar !MENU / !Menu / !menu sama saja
        msg.message.conversation = body.charAt(0) + body.slice(1).toLowerCase();

        // Panggil handler command asli di halz.js
        require("./halz")(halz, m);
    });
}

// Endpoint tambah file
app.post("/add-file", (req, res) => {
    const { nama, link, token } = req.body;

    if (token !== process.env.API_TOKEN) {
        return res.status(403).json({ error: "Token salah!" });
    }

    if (!nama || !link) {
        return res.status(400).json({ error: "Nama dan Link harus diisi!" });
    }

    let fileData = [];
    if (fs.existsSync(filePath)) {
        try {
            fileData = JSON.parse(fs.readFileSync(filePath));
        } catch (e) {
            console.error("Error membaca file_list.json:", e);
        }
    }

    fileData.push({ nama, link });
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    console.log(`✅ Link baru ditambahkan: ${nama}`);

    res.json({ success: true, message: "Link berhasil ditambahkan!" });
});

// Endpoint hapus file
app.post("/delete-file", (req, res) => {
    const { nama, token } = req.body;

    if (token !== process.env.API_TOKEN) {
        return res.status(403).json({ error: "Token salah!" });
    }

    if (!nama) {
        return res.status(400).json({ error: "Nama file harus diisi!" });
    }

    if (!fs.existsSync(filePath)) {
        return res
            .status(404)
            .json({ error: "file_list.json tidak ditemukan" });
    }

    let fileData = JSON.parse(fs.readFileSync(filePath));
    const newData = fileData.filter(
        (item) => item.nama.toLowerCase() !== nama.toLowerCase(),
    );

    if (newData.length === fileData.length) {
        return res
            .status(404)
            .json({ error: "File dengan nama tersebut tidak ditemukan" });
    }

    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    console.log(`❌ File dihapus: ${nama}`);

    res.json({ success: true, message: `File ${nama} berhasil dihapus!` });
});

// Jalankan bot
connectToWhatsApp();

app.get("/", (req, res) => {
    res.send("Bot Halz is running!");
});

app.listen(port, () => {
    console.log(`🌐 Server berjalan di port ${port}`);
});
