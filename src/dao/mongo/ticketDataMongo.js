const ticketModel = require('./models/ticketModel')

class TicketMongo {
    constructor(){

    }

    get = async () => await ticketModel.find().populate('products.product')

    getById = async (tid) => await ticketModel.findOne({_id: tid}).populate('products.product')

    create = async (ticket) => await ticketModel.create(ticket)

}


module.exports = TicketMongo