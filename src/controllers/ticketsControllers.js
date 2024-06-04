const {ticketServices, usersServices} = require('../repositories/index.repositories')


//Obtener tickets
const getTicket = async(req, res) => {
    try {
        let result = await ticketServices.getTicket()
    
        res.send({status:"Success", result:result})
    } catch (error) {
        res.send({ status: error, error: "Error al obtener los tickets." });
    }
}

//Obtener ticket por Id
const getTicketById = async(req, res) => {
    try {
        const {tid} = req.params
    
        let ticket = await ticketServices.getTicketById(tid)
    
        res.send({status:"Success", result:ticket})
    } catch (error) {
        res.send({ status: error, error: "Error al obtener ticket por su ID." });
    }
}


// Crear ticket
const createTicket = async(user, productosConfirmados, cart, req, res) => {
    try {
        //Obtener usuario
        let resultUser = await usersServices.getUserById(user)
        if (!resultUser) res.status(404).json({ error: "El usuario con el id proporcionado no existe" })

        //Suma del precio total
        let sum = productosConfirmados.reduce((acc, prev) => {
            acc += prev.product.precio * prev.quantity
            return acc
        }, 0)

        //Creación de un número de orden al azar
        let ticketNumber = Math.floor(Math.random() * 10000 + 1)
        let fechaActual = new Date()
    
        //Orden final
        let ticket = {
            code: ticketNumber,
            purchase_datetime: fechaActual,
            amount: sum,
            purchaser: resultUser.email,
            products: productosConfirmados
        }

        //Creación de la orden en la db
        let ticketResult = await ticketServices.createTicket(ticket)

        // Enviar correo con el resumen de la compra
        const {transporter} = require('../app')

        const mailOptions = {
            from: 'Coder Tests <pcoderhouse@gmail.com>',
            to: "javiersantos87@outlook.com.ar",
            subject: "Mail de prueba",
            html: `
            <div>
                <h1>¡Gracias por su compra!</h1>

                <h2>Resumen: </h2>

                <div>
                <p><strong>Número de orden: </strong> ${ticketResult.code}</p>
                <p><strong>Fecha y hora: </strong> ${ticketResult.purchase_datetime}</p>
                <p><strong>Precio total: </strong> $${ticketResult.amount}</p>
                <p><strong>Email del comprador: </strong> ${ticketResult.purchaser}</p>

                <p><strong>Productos: </strong>
                <ul> 
                ${ticketResult.products.map((p) => `
                <li>${p.product.nombre} - $${p.product.precio} - Cantidad: ${p.quantity}</li>
                `).join('')}
                </ul>

                </div>
            </div>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Correo enviado", info.response);
            }
        })

        // Enviar sms de confirmación
        const twilio = require('twilio')
        const config = require('../config/config.dotenv')
        const client = twilio(config.twilio_account_sid, config.twilio_auth_token)
        
        await client.messages.create({
            body: `¡ Gracias por su compra ! Puede ver el resumen en su correo.
            Número de orden: ${ticketResult.code}`,
            from: config.twilio_sms_number,
            to: "+5426159393333"
        })

        res.status(200).json({status:"Success", result: ticketResult, productosSinComprarPorStockInsuficiente: cart.products_list})

    } catch (error) {
        res.status(404).json({ message: "Error al crear ticket" });
    }

}


module.exports = {
    getTicket,
    getTicketById,
    createTicket
}


