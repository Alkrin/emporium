import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_UpdateDomain } from "../../serverRequestTypes";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_UpdateDomain;

    let queries: SQLQuery[] = [];

    // Update the domain itself.
    queries.push({
      query: `UPDATE domains SET frontier_population=?,current_morale=?,last_updated_date WHERE id=?`,
      values: [b.frontier_population, b.morale, getFirstOfThisMonthDateString(), b.domain_id],
    });

    // Update any cities.
    Object.entries(b.city_updates).forEach(([city_id, cityData]) => {
      queries.push({
        query: `UPDATE locations SET type_data=? WHERE id=?`,
        values: [JSON.stringify(cityData), city_id],
      });
    });

    // Update the treasury.
    queries.push({
      query: `UPDATE storage SET money=? WHERE id=?`,
      values: [b.treasury_value, b.treasury_id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
