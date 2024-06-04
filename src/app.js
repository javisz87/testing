const express = require('express')
const app = express()
const PORT = 8080
const path = require('path')

//Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor is running on port ${PORT}`);
})

//Config Handlebars
const handlebars = require('express-handlebars');
app.engine("handlebars", handlebars.engine())
app.set("views", path.join(__dirname, 'views'))
app.set("view engine", "handlebars")


//Persistir información de sesiones en una db.
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
app.use(session({
    store: new MongoDBStore({
        uri: "mongodb+srv://javiszumilo87:gcDE719B48EVkoJ9@cluster7.x4k0ov3.mongodb.net/",
        collection: 'mySessions',
        ttl: 1000
    }),
    secret: "secret",
    resave: false,
    saveUninitialize: false
}))

//Middleware passport
const passport = require('passport');
const initializePassport = require('./config/passport.config');
initializePassport();
app.use(passport.initialize())
app.use(passport.session());

//Middleware cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Middleware para analizar el cuerpo de las solicitudes.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Config Nodemailer
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:"pcoderhouse@gmail.com",
        pass:"mkvi afne szfo nokb"
    }
})

// Config Swagger
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: "Documentación API ecommerce",
            description: "ecommerce"
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJsdoc(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))


//Rutas
const cartRouter = require('./routes/cart.router')
const ticketRouter = require('./routes/ticket.router')
const productsRouter = require('./routes/products.router')
const usersRouter = require('./routes/users.router')

app.use("/api/cart", cartRouter)
app.use("/api/ticket", ticketRouter)
app.use("/api/products", productsRouter)
app.use("/api/sessions", usersRouter)

module.exports = {transporter}