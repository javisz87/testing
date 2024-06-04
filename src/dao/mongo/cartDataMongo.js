const { cartModel } = require('./models/cartModel');

class CartMongo {
    constructor() {
    }

    get = async () => {
        let cart = await cartModel.find().populate('products_list.product')
        return cart
    }

    getById = async (cid) => await cartModel.findOne({_id: cid}).populate('products_list.product')

    create = async (cart) => {
        return await cartModel.create(cart)
    }

    update = async (cid, cart) => {
        return await cartModel.updateOne({ _id: cid }, cart)
    }

    delete = async () => {
        return await cartModel.deleteMany()
    }

}


module.exports = CartMongo