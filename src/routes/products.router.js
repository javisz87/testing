const {Router} = require('express')
const router = Router()
const authJwt = require('../middlewares/authJwt')
const productsControllers = require('../controllers/productsControllers')

//Obtener lista de productos
router.get("/", productsControllers.getProducts)

//Obtener producto por ID
router.get("/:pid", productsControllers.getProductById)

//Agregar productos
router.post("/", authJwt.verifyToken, authJwt.isAdminOrPremium, productsControllers.createProducts)

//Actualizar un producto
router.put("/:pid", authJwt.verifyToken, authJwt.isAdminOrPremium, productsControllers.updateProduct)

//Eliminar producto por su ID.
router.delete("/:pid", authJwt.verifyToken, authJwt.isAdminOrPremium, productsControllers.deleteProduct)

// Eliminar todos los productos
router.delete("/", productsControllers.deleteAllProducts)

module.exports = router;


