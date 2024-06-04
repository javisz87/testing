const mongoose = require('mongoose')
const {Schema} = mongoose
const collection = "Tickets"

const ticketSchema = new mongoose.Schema({
    code: Number,
    purchase_datetime: String,
    amount: Number,
    purchaser: String,
    products: []
})

const ticketModel = mongoose.model(collection, ticketSchema)

module.exports = ticketModel