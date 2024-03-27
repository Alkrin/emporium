import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import dateFormat from "dateformat";
import { RequestBody_SetCharacterRemainingCXPDeductible } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetCharacterRemainingCXPDeductible;

    const thisMonth = dateFormat(new Date(), "yyyy-mm-01");
    const results = await executeQuery<any>(
      `UPDATE characters SET remaining_cxp_deductible=?,cxp_deductible_date=? WHERE id=?`,
      [b.remainingCXPDeductible, thisMonth, b.characterId]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
