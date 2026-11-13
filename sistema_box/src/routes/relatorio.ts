import { Hono } from 'hono'
import * as controller from "../controllers/relatorio"

const route = new Hono()
route.get('/relatorio', controller.gerar)
export { route }
