import type { Context } from "hono"
import { db } from "../database-connect"

export const create = async (c: Context) => {
  const body = await c.req.json()
  const placa = body.placa.toUpperCase().replace("-", "")
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa))
    return c.json({ msg: "placa inválida" }, { status: 400 })

  const emUso = db.query(`
    SELECT id FROM sessao WHERE box_id=:box_id AND status!='finalizado'
  `).get({ ":box_id": body.box_id })
  if (emUso)
    return c.json({ msg: "box já está em uso" }, { status: 400 })

  const query = db.query(`
    INSERT INTO sessao (box_id, placa, status)
    VALUES (:box_id, :placa, 'em_servico')
  `)
  const resp = query.run({
    ":box_id": body.box_id,
    ":placa": placa
  })
  return c.json(resp)
}

export const listAll = (c: Context) => {
  const query = db.query(`SELECT * FROM sessao`)
  const data = query.all()
  return c.json(data)
}

export const listOne = async (c: Context) => {
  const query = db.query(`SELECT * FROM sessao WHERE id=:id`)
  const data = query.get({ ":id": c.req.param("id") })
  if (!data)
    return c.json({ msg: "sessão não encontrada" }, { status: 404 })
  return c.json(data)
}

export const pausar = async (c: Context) => {
  const body = await c.req.json()
  const sessao: any = db.query(`SELECT * FROM sessao WHERE id=:id`).get({ ":id": c.req.param("id") })
  if (!sessao)
    return c.json({ msg: "sessão não encontrada" }, { status: 404 })
  if (sessao.status != "em_servico")
    return c.json({ msg: "serviço não está em andamento" }, { status: 400 })

  db.query(`INSERT INTO pausa (sessao_id, motivo) VALUES (:sessao_id, :motivo)`).run({
    ":sessao_id": sessao.id,
    ":motivo": body.motivo
  })
  db.query(`UPDATE sessao SET status='pausado' WHERE id=:id`).run({ ":id": sessao.id })
  return c.json({ msg: "serviço pausado" })
}

export const retomar = async (c: Context) => {
  const sessao: any = db.query(`SELECT * FROM sessao WHERE id=:id`).get({ ":id": c.req.param("id") })
  if (!sessao)
    return c.json({ msg: "sessão não encontrada" }, { status: 404 })
  if (sessao.status != "pausado")
    return c.json({ msg: "serviço não está pausado" }, { status: 400 })

  db.query(`UPDATE pausa SET fim=datetime('now', 'localtime') WHERE sessao_id=:id AND fim IS NULL`).run({ ":id": sessao.id })
  db.query(`UPDATE sessao SET status='em_servico' WHERE id=:id`).run({ ":id": sessao.id })
  return c.json({ msg: "serviço retomado" })
}

export const finalizar = async (c: Context) => {
  const sessao: any = db.query(`SELECT * FROM sessao WHERE id=:id`).get({ ":id": c.req.param("id") })
  if (!sessao)
    return c.json({ msg: "sessão não encontrada" }, { status: 404 })
  if (sessao.status == "finalizado")
    return c.json({ msg: "serviço já foi finalizado" }, { status: 400 })

  db.query(`UPDATE pausa SET fim=datetime('now', 'localtime') WHERE sessao_id=:id AND fim IS NULL`).run({ ":id": sessao.id })
  db.query(`UPDATE sessao SET status='finalizado', fim=datetime('now', 'localtime') WHERE id=:id`).run({ ":id": sessao.id })
  return c.json({ msg: "serviço finalizado" })
}

export const listPausas = async (c: Context) => {
  const query = db.query(`SELECT * FROM pausa WHERE sessao_id=:id`)
  const data = query.all({ ":id": c.req.param("id") })
  return c.json(data)
}
