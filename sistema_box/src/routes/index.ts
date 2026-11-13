import { route as box } from './box'
import { route as sessao } from './sessao'
import { route as relatorio } from './relatorio'
import { Hono } from 'hono'
const routes = new Hono()
routes.route("/", box)
routes.route("/", sessao)
routes.route("/", relatorio)
export { routes }
