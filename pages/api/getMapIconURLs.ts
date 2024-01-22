import { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const dirRelativeToPublicFolder = "images/MapIcons";
    const dir = path.resolve("./public", dirRelativeToPublicFolder);
    const filenames = fs.readdirSync(dir);
    const imageURLs = filenames.map((name) => `${path.join("/", dirRelativeToPublicFolder, name)}`);

    res.statusCode = 200;
    res.json(imageURLs);
  } catch (error) {
    res.status(403).json({ text: "Error" });
  }
}
