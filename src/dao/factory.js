const config = require('../config/config.dotenv');

let Cart
let Products
let Users
let Ticket

switch (config.persistence) {
    case "MONGO":
        //Conexión con Mongo
        const mongoose = require('mongoose');
        const mongoDB = "mongodb+srv://javiszumilo87:gcDE719B48EVkoJ9@cluster7.x4k0ov3.mongodb.net/";

        main().catch((err) => console.log(err));
        async function main() {
            await mongoose.connect(mongoDB);
            console.log("Conectado a la base de datos de MongoDB Atlas.");
        }

        //Importamos los datos de la base
        const CartMongo = require('./mongo/cartDataMongo')
        const ProductsMongo = require('./mongo/productsDataMongo')
        const UsersMongo = require('./mongo/usersDataMongo')
        const TicketMongo = require('./mongo/ticketDataMongo')

        Cart = CartMongo
        Products = ProductsMongo
        Users = UsersMongo
        Ticket = TicketMongo

        break;

    default:
        console.log("Error al conectar");
        break;
}


module.exports = {
    Cart,
    Products,
    Users,
    Ticket
}