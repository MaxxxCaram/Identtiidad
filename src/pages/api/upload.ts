import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  const filename =
    (req.headers["x-filename"] as string) || `upload-${Date.now()}.webm`;
  const filePath = path.join(uploadDir, filename);

  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);

  writeStream.on("finish", () => {
    res.status(200).json({ success: true, filename });
  });

  writeStream.on("error", (err) => {
    res.status(500).json({ error: "Upload failed", details: err.message });
  });
}
