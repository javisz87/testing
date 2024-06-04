const ProductDTO = require('../dao/DTOs/product.dto')

class ProductRepository {
    constructor(dao) {
        this.dao = dao
    }

    getProducts = async () => {
        let result = await this.dao.get()
        return result
    }

    getProductById = async (pid) => {
        let result = await this.dao.getById(pid)
        return result
    }

    createProduct = async (product) => {
        let productToInsert = new ProductDTO(product)
        let result = await this.dao.create(productToInsert)
        return result
    }

    updateProduct = async (pid, productToReplace) => {
        let result = await this.dao.update(pid, productToReplace)
        return result
    }

    deleteProduct = async (pid) => {
        let result = await this.dao.delete(pid)
        return result
    }

    deleteAll = async () => {
        let result = await this.dao.deleteAll()
        return result
    }
    
    paginateProducts = async (filtro, options) => {
        let result = await this.dao.paginate(filtro, options)
        return result
    }
}

module.exports = ProductRepository