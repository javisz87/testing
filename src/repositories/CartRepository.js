const CartDTO = require('../dao/DTOs/cart.dto')

class CartRepository {
    constructor(dao) {
        this.dao = dao
    }

    getCart = async () => {
        let result = await this.dao.get()
        return result
    }

    getCartById = async (cid) => {
        let result = await this.dao.getById(cid)
        return result
    }
    
    createCart = async (cart) => {
        let cartToInsert = new CartDTO(cart)
        let result = await this.dao.create(cartToInsert)
        return result
    }

    updateCart = async (cid, cart) => {
        let result = await this.dao.update(cid, cart)
        return result
    }

    deleteAllCarts = async () => {
        let result = this.dao.delete()
        return result
    }
}

module.exports = CartRepository