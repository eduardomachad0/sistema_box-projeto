import { Hono } from 'hono'
import * as controller from "../controllers/box"

const route = new Hono()
route.get('/box', controller.listAll)
export { route }
