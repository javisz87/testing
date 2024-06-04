const mongoose = require('mongoose');
const {Schema} = mongoose
const cartCollection = "Carts";

const cartSchema = new mongoose.Schema({
    title: String,
    products_list: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Products"
            },
            quantity: { type: Number, default: 1 }
        }
    ]
})

const cartModel = mongoose.model(cartCollection, cartSchema);

module.exports = { cartModel };