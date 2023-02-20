import { IncomingMessage, ServerResponse } from "http";
import executeQuery from "../../lib/db";
import xorCipher from "../../lib/xorCipher";

export default async function handler(
  req: IncomingMessage & any,
  res: ServerResponse & any
): Promise<void> {
  try {
    if (process.env.CIPHER) {
      const passCrypt = xorCipher.encode(process.env.CIPHER, req.body.pass);
      if (passCrypt.length > 0) {
        const result = await executeQuery<any>(
          `SELECT id, name, role FROM user WHERE name=? AND pass=?`,
          [req.body.name, passCrypt]
        );

        if (result.length === 1) {
          res.status(200).json(result[0]);
        } else {
          res.status(500).json({ error: "Error A" });
        }
      } else {
        res.status(500).json({ error: "Error B" });
      }
    } else {
      res.status(500).json({ error: "Error C" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error D" });
  }
}
