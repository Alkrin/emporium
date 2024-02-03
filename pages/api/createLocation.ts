import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateLocation } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateLocation;

    const queries: SQLQuery[] = [];

    // Create the location record first.
    queries.push({
      query: `INSERT INTO locations (name,description,map_id,hex_id,is_public,viewer_ids,type,icon_url) VALUES (?,?,?,?,?,?,?,?)`,
      values: [b.name, b.description, b.map_id, b.hex_id, b.is_public, b.viewer_ids.join(","), b.type, b.icon_url],
    });

    // Grab the insert id so we can pass it on to the type-specific record(s).
    queries.push({
      query: `SELECT @id:=LAST_INSERT_ID();`,
      values: [],
    });

    // Only insert the matching record.
    switch (b.type) {
      case "City": {
        queries.push({
          query: `INSERT INTO location_cities (location_id,market_class) VALUES (@id,?)`,
          values: [b.city.market_class],
        });
        break;
      }
      case "Lair": {
        queries.push({
          query: `INSERT INTO location_lairs (location_id,monster_level,num_encounters) VALUES (@id,?,?)`,
          values: [b.lair.monster_level, b.lair.num_encounters],
        });
        break;
      }
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
