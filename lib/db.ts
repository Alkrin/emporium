import mysql from "serverless-mysql";

const db = mysql({
  config: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  },
});

export interface SQLQuery {
  query: string;
  values: any[];
}

export async function executeQuery<T>(query: string, values: any[]): Promise<T | any> {
  try {
    const results = await db.query<T>(query, values);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}

export async function executeTransaction<T>(queries: SQLQuery[]): Promise<T | any> {
  try {
    let transaction = db.transaction();
    queries.forEach((q) => {
      transaction = transaction.query(q.query, q.values);
    });
    const results = await transaction.commit();

    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}
