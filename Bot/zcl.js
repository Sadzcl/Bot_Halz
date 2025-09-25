require("dotenv").config();

global.admin = [process.env.ADMIN_NUMBER];
global.prefix = "!";
global.image = "./database/image/KucingLucu.jpeg";

global.mess = {
    wait: "☕ *One Moment, Please*",
    error: "⚠ *Gagal Saat Melakukan Proses*",
    default: "📑 *Perintah Tidak Dikenali*",
    admin: "⚠ *Perintah Ini Hanya Bisa Digunakan Oleh Admin*",
    group: "⚠ *Perintah Ini Hanya Bisa Digunakan Di Dalam Grup*",
};
