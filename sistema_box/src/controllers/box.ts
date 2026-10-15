import type { Context } from "hono"
import { db } from "../database-connect"

export const listAll = (c: Context) => {
  const query = db.query(`SELECT * FROM box`)
  const data = query.all()
  return c.json(data)
}
