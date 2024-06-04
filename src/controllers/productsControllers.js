const {productsServices, usersServices} = require('../repositories/index.repositories')
const jwt = require('jsonwebtoken');
const { isValidatePassword, createHash } = require('../utils')

//Obtener los productos
const getProducts = async (req, res) => {
    try {
        const pageSize = parseInt(req.query.limit) || 10;  //Query limit opcional
        const page = parseInt(req.query.page) || 1;        //Query page opcional

        let filtro = {}
        if (req.query.categoria) filtro = { categoria: req.query.categoria }
        if (req.query.stock) filtro = { stock: req.query.stock }

        let orden
        if (req.query.sort) {
            orden = {precio: req.query.sort}
        } else {
            orden = null
        }

        const options = {
            page,
            limit: pageSize,
            sort: orden
        };

        let result = await productsServices.paginateProducts(filtro, options)
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al obtener información de los productos." })
    }
}


//Obtener producto por ID
const getProductById = async (req, res) => {
    try {
        let { pid } = req.params;

        let result = await productsServices.getProductById(pid)

        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al obtener un producto por su ID." });
    }
}


//Agregar productos
const createProducts = async(req, res) => {
    try {
        let { title, categoria, precio, stock, imagen, owner } = req.body

        if (!title || !categoria || !precio || !stock || !imagen) {
            res.send({ status: "error", error: "Faltan parámetros para crear el producto." })
        }

        if (owner) {
            // Obtener token de cookie
            const token = req.cookies["jwtCookie"]
            if (!token) return res.status(403).json({ status: "error", error: "No token provided." })

            // Obtener id del token para buscar usuario
            const { email } = jwt.verify(token, "secret")

            let resultUser = await usersServices.getUserByEmail(email)
            if (!resultUser) return res.status(400).json({message: "Usuario no encontrado."})

            if (resultUser.email !== owner) return res.status(400).json({message: "Owner no coincide con el email de usuario logeado."})

            // Validar que el usuario cuente con role premium
            if (resultUser.role === "premium") {
                owner = resultUser.email
            } else {
                owner = null
            }
        }

        let product = {
            title,
            categoria,
            precio,
            stock,
            imagen,
            owner
        }

        let result = await productsServices.createProduct(product)

        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al crear producto." });
    }
}

//Actualizar un producto
const updateProduct = async (req, res) => {
    try {
        let { pid } = req.params;
        let productToReplace = req.body;

        let result = await productsServices.updateProduct(pid, productToReplace)

        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al actualizar un producto." });
    }
}

//Eliminar producto por su ID.
const deleteProduct = async (req, res) => {
    try {
        let { pid } = req.params;

        let resultProduct = await productsServices.getProductById(pid)

        // Obtener token de cookie
        const token = req.cookies["jwtCookie"]
        if (!token) return res.status(403).json({ status: "error", error: "No token provided." })

        // Obtener id del token para buscar usuario
        const { email } = jwt.verify(token, "secret")

        // Buscar usuario
        let resultUser = await usersServices.getUserByEmail(email)
        if (!resultUser) return res.status(400).json({ message: "Usuario no encontrado." })


        // Role admin ? Puede eliminar cualquier producto
        // Role premium ? Puede eliminar si es que le pertenece
        if (resultUser.role === "admin") {
            let result = await productsServices.deleteProduct(pid)
            res.send({ result: "Success", payload: result });

        } else if (resultUser.email === resultProduct.owner) {
            let result = await productsServices.deleteProduct(pid)
            res.send({ result: "Success", payload: result });

        } else {
            res.status(401).json({ messsage: "No puede eliminar producto, no le pertenece." })
        }

    } catch (error) {
        res.send({ status: error, error: "Error al eliminar un producto." })
    }
}

const deleteAllProducts = async (req, res) => {
    try {
        let result = await productsServices.deleteAll()
        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al eliminar los productos." })
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProducts,
    updateProduct,
    deleteProduct,
    deleteAllProducts
}