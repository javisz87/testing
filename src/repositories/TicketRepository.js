const TicketDTO = require('../dao/DTOs/ticket.dto')

class TicketRepository {
    constructor(dao){
        this.dao = dao
    }

    getTicket = async () => {
        let result = await this.dao.get()
        return result
    }

    getTicketById = async (tid) => {
        let result = await this.dao.getById(tid)
        return result
    }

    createTicket = async (ticket) => {
        let ticketToInsert = new TicketDTO(ticket)
        let result = await this.dao.create(ticketToInsert)
        return result
    }

}

module.exports = TicketRepository