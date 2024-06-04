const {cartServices, productsServices } = require('../repositories/index.repositories')
const ticketsControllers = require("./ticketsControllers")

//Crear carrito
const createCart = async (req, res) => {
    let { name, description } = req.body;

    let result = await cartServices.createCart({ name, description })

    if (!result) return res.status(500).send({status:"Error", error: "Algo salió mal al crear el carrito."})

    res.send({ result: "Success", payload: result });
}


//Obtener carrito
const getCart = async (req, res) => {
    let result = await cartServices.getCart()

    if (!result) return res.status(500).send({status:"Error", error: "Algo salió mal al obtener carrito."})

    res.send({status:"Success", result:result})
}

//Obtener carrito por id
const getCartById = async (req,res) => {
    try {
        let { cid } = req.params;

        let result = await cartServices.getCartById(cid)

        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al obtener un carrito por su ID." });
    }
}


//Agregar producto al carrito
const addProduct = async(req, res) => {

    //Buscar carrito
    let {cid} = req.params
    let cart = await cartServices.getCartById(cid)
    if (!cart) {
        res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
    }

    //Buscar producto
    const {productsServices} = require("../repositories/index.repositories")
    let {pid} = req.params
    let product = await productsServices.getProductById(pid)
    if (!product) {
        res.status(404).json({ error: `El producto con el id proporcionado no existe` })
    }

    //Cantidad
    let { quantity } = req.body;

    //Validamos la existencia del producto en el carrito
    const foundProductInCart = cart.products_list.find((p) => {
        if (p.product._id.equals(pid)) return p
    })
    
    //Si existe le actualizamos la cantidad enviada por body.
    //Si no existe pusheamos el nuevo producto con la cantidad enviada por body.
    const indexProduct = cart.products_list.findIndex((p) => p.product._id.equals(pid))
    if (foundProductInCart) {
        cart.products_list[indexProduct].quantity += quantity || 1;
    } else {
        cart.products_list.push({ product: pid, quantity: quantity});
    }

    //Actualizar carrito
    await cartServices.updateCart(cart._id, cart)

    //Buscar cart nuevamente para el populate
    cart = await cartServices.getCartById(cid)

    console.log(JSON.stringify(cart, null, '\t'));

    res.send({status:"Success", result:cart})
}


//Eliminar productos del carrito
const deleteOneProduct = async (req, res) => {
    try {
        //Buscar carrito
        let { cid } = req.params
        let cart = await cartServices.getCartById(cid)
        if (!cart) {
            res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
        }
    
        //Buscar producto
        let { pid } = req.params
        let product = await productsServices.getProductById(pid)
        if (!product) {
            res.status(404).json({ error: `El producto con el id proporcionado no existe` })
        }
    
        //Validar la existencia del producto en el carrito
        const foundProductInCart = cart.products_list.find((p) => {
            if (p.product._id.equals(pid)) return p
        })
        if(!foundProductInCart){
            res.status(404).json({ error: `El producto no existe en el carrito.` })
        }
    
        //Filtrando array para eliminar el producto indicado
        cart.products_list = cart.products_list.filter(p => !p.product._id.equals(pid))
    
        //Actualizar carrito
        await cartServices.updateCart(cart._id, cart)
    
        //Buscar cart nuevamente para el populate
        cart = await cartServices.getCartById(cid)
    
        console.log(JSON.stringify(cart, null, '\t'));
    
        res.send({status:"Success", result:cart})
        
    } catch (error) {
        res.status(404).json({ error: `Error al eliminar un producto.` })
    }
}


//Eliminar todos los productos del carrito
const deleteAllProducts = async (req, res) => {
    try {
        //Buscar carrito
        let { cid } = req.params
        let cart = await cartServices.getCartById(cid)
        if (!cart) {
            res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
        }

        //Vaciar carrito
        cart.products_list = []

        //Actualizamos las modificaciones del carrito.
        let result = await cartServices.updateCart(cart._id, cart)
        console.log(JSON.stringify(cart, null, '\t'));
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.status(404).json({ error: `Error al vaciar el carrito.` })
    }
}


const deleteAllCarts = async (req, res) => {
    try {
        let result = await cartServices.deleteAllCarts()
        res.send({ result: "Success", payload: result });
    } catch (error) {
        res.status(500).json({ error: `Error al eliminar los carritos.` })
    }
} 


// Finalizar compra
const finalizePurchase = async (req, res) => {
    try {
        let {cid} = req.params
        let cart = await cartServices.getCartById(cid)
        if (!cart) return res.status(404).json({message: "El carrito con el id proporcionado no existe"})

        // Productos confirmados
        let productosConfirmados = []

        // // Validar stock de cada producto
        // // Quedarán en el carrito aquellos productos con stock insuficiente
        for (let i = cart.products_list.length-1; i >= 0; i-=1) {

            if (cart.products_list[i].product.stock >= cart.products_list[i].quantity) {
                cart.products_list[i].product.stock = cart.products_list[i].product.stock - cart.products_list[i].quantity

                // Lo agregamos al array de productos confirmados
                productosConfirmados.push(cart.products_list[i])
                
                // Actualizar stock del producto en la db
                await productsServices.updateProduct(cart.products_list[i].product._id, cart.products_list[i].product)

                // Lo retiramos del carrito
                cart.products_list.splice(i, 1)

            }
        }

        // Actualizar carrito
        await cartServices.updateCart(cid, cart)

        // Obtener usuario del body para luego crear el ticket
        let { user } = req.body
        ticketsControllers.createTicket(user, productosConfirmados, cart, req, res)
        
    } catch (error) {
        res.status(404).json({ error: `Error al finalizar la compra.` })
    }
}


module.exports = {
    createCart,
    getCart,
    getCartById,
    addProduct,
    deleteOneProduct,
    deleteAllProducts,
    deleteAllCarts,
    finalizePurchase
}