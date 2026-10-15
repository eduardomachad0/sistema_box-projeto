import { Hono } from 'hono'
import * as controller from "../controllers/sessao"
import { type } from 'arktype'
import { ffInputType } from '../middleware/inputTest'

const Sessao = type({
  box_id: "number",
  placa: "string"
})
const Pausa = type({
  id: "string.numeric",
  motivo: "string"
})

const route = new Hono()
route.get('/sessao', controller.listAll)
route.post('/sessao', ffInputType(Sessao), controller.create)
route.get('/sessao/:id', controller.listOne)
route.get('/sessao/:id/pausas', controller.listPausas)
route.put('/sessao/:id/pausar', ffInputType(Pausa), controller.pausar)
route.put('/sessao/:id/retomar', controller.retomar)
route.put('/sessao/:id/finalizar', controller.finalizar)
export { route }
