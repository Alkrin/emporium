import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_ResolveActivity } from "../../serverRequestTypes";
import { ActivityData_ParticipantToString } from "../../serverAPI";
import dateFormat from "dateformat";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { ContractId } from "../../redux/gameDefsSlice";
import { ProficiencySource } from "../../staticData/types/abilitiesAndProficiencies";
import { generateQueriesResolveActivity } from "./generators/generateQueriesResolveActivity";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_ResolveActivity;

    let queries: SQLQuery[] = [];

    queries = queries.concat(generateQueriesResolveActivity(b.activity, b.outcomes, b.resolution));

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
