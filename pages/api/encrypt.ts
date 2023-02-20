import { IncomingMessage, ServerResponse } from "http";
import xorCipher from "../../lib/xorCipher";

export default async function handler(
  req: IncomingMessage & any,
  res: ServerResponse & any
): Promise<void> {
  try {
    if (process.env.CIPHER) {
      res.status(200).json({
        text: xorCipher.encode(process.env.CIPHER, req.body.text),
      });
    } else {
      res.status(403).json({ text: "Error" });
    }
  } catch (error) {
    res.status(403).json({ text: "Error" });
  }
}
