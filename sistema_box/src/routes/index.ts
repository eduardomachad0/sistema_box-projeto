import { route as box } from './box'
import { route as sessao } from './sessao'
import { Hono } from 'hono'
const routes = new Hono()
routes.route("/", box)
routes.route("/", sessao)
export { routes }
