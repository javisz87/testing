const { productModel } = require('./models/productModel');

class ProductsMongo {
    constructor() {
    }

    get = async () => {
        let products = await productModel.find()
        return products
    }

    getById = async (pid) => await productModel.findById({ _id: pid })

    create = async (product) => (await productModel.create(product))

    update = async (pid, productToReplace) => await productModel.updateOne({ _id: pid }, productToReplace)

    delete = async (pid) => await productModel.deleteOne({ _id: pid })

    deleteAll = async () => await productModel.deleteMany()
    
    paginate = async (filtro, options) => {
        let result = await productModel.paginate(filtro, options)
        return result
    }

}


module.exports = ProductsMongo