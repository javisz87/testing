const {Router} = require('express')
const router = Router()
const ticketsControllers = require('../controllers/ticketsControllers')

router.get("/", ticketsControllers.getTicket)

router.get("/:tid", ticketsControllers.getTicketById)

module.exports = router