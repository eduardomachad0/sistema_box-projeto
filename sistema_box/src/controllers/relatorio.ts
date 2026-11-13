import type { Context } from "hono"
import { db } from "../database-connect"

export const gerar = (c: Context) => {
  const periodo = {
    ":inicio": c.req.query("inicio") ?? null,
    ":fim": c.req.query("fim") ?? null
  }

  const servicos: any[] = db.query(`
    SELECT s.id, b.numero AS box, s.placa, s.inicio, s.fim,
      CAST(ROUND((julianday(s.fim) - julianday(s.inicio)) * 1440) AS INTEGER) AS tempo_total,
      IFNULL((
        SELECT CAST(ROUND(SUM(julianday(p.fim) - julianday(p.inicio)) * 1440) AS INTEGER)
        FROM pausa p WHERE p.sessao_id = s.id
      ), 0) AS tempo_pausa
    FROM sessao s
    JOIN box b ON b.id = s.box_id
    WHERE s.status = 'finalizado'
      AND date(s.inicio) BETWEEN IFNULL(:inicio, date('now', 'localtime')) AND IFNULL(:fim, date('now', 'localtime'))
    ORDER BY b.numero, s.inicio
  `).all(periodo)

  for (const s of servicos)
    s.tempo_trabalhado = s.tempo_total - s.tempo_pausa

  const porBox: any = {}
  for (const s of servicos) {
    if (!porBox[s.box])
      porBox[s.box] = { box: s.box, servicos: 0, tempo_trabalhado: 0, tempo_pausa: 0 }
    porBox[s.box].servicos++
    porBox[s.box].tempo_trabalhado += s.tempo_trabalhado
    porBox[s.box].tempo_pausa += s.tempo_pausa
  }

  const porMotivo = db.query(`
    SELECT p.motivo, COUNT(*) AS quantidade,
      CAST(ROUND(SUM(julianday(p.fim) - julianday(p.inicio)) * 1440) AS INTEGER) AS tempo
    FROM pausa p
    JOIN sessao s ON s.id = p.sessao_id
    WHERE s.status = 'finalizado'
      AND date(s.inicio) BETWEEN IFNULL(:inicio, date('now', 'localtime')) AND IFNULL(:fim, date('now', 'localtime'))
    GROUP BY p.motivo
    ORDER BY tempo DESC
  `).all(periodo)

  return c.json({ servicos, porBox: Object.values(porBox), porMotivo })
}
