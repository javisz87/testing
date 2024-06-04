const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const productCollection = "Products";


const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    categoria: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true },
    imagen: { type: String, required: true },
    owner: String
})


//Paginate
productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model(productCollection, productSchema);

module.exports = { productModel };