//Importando la persistencia del DAO
const {Cart, Products, Users, Ticket } = require('../dao/factory')

//Importando los repositorios
const CartRepository = require('./CartRepository')
const ProductRepository = require('./ProductsRepository')
const UserRepository = require('./UsersRepository')
const TicketRepository = require('./TicketRepository')

//Instancias a los repositorios
const cartServices = new CartRepository(new Cart())
const productsServices = new ProductRepository(new Products())
const usersServices = new UserRepository(new Users())
const ticketServices = new TicketRepository(new Ticket())

module.exports = {
    cartServices,
    productsServices,
    usersServices,
    ticketServices
}