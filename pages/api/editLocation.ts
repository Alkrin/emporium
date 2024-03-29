import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_EditLocation } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditLocation;

    const queries: SQLQuery[] = [];

    // Create the location record first.
    queries.push({
      query: `UPDATE locations SET name=?,description=?,map_id=?,hex_id=?,is_public=?,viewer_ids=?,type=?,icon_url=? WHERE id=?`,
      values: [
        b.name,
        b.description,
        b.map_id,
        b.hex_id,
        b.is_public,
        b.viewer_ids.join(","),
        b.type,
        b.icon_url,
        b.id,
      ],
    });

    // Erase old type-specific data (because type may have changed).
    queries.push({
      query: `DELETE FROM location_cities WHERE location_id=?`,
      values: [b.id],
    });
    queries.push({
      query: `DELETE FROM location_lairs WHERE location_id=?`,
      values: [b.id],
    });

    // Generate new type-specific record(s).
    switch (b.type) {
      case "City": {
        queries.push({
          query: `INSERT INTO location_cities (location_id,market_class) VALUES (?,?)`,
          values: [b.id, b.city.market_class],
        });
        break;
      }
      case "Lair": {
        queries.push({
          query: `INSERT INTO location_lairs (location_id,monster_level,num_encounters) VALUES (?,?,?)`,
          values: [b.id, b.lair.monster_level, b.lair.num_encounters],
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
