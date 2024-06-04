class ProductDTO {
    constructor(product) {
        this.nombre = product.title,
            this.description = product.description,
            this.categoria = product.categoria,
            this.precio = product.precio,
            this.stock = product.stock,
            this.imagen = product.imagen,
            this.owner = product.owner ? product.owner : "admin"
    }
}

module.exports = ProductDTO