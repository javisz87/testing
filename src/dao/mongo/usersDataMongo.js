const { userModel } = require('./models/userModel');

class UsersMongo {
    constructor() {

    }

    create = async (newUser) => await userModel.create(newUser)

    get = async () => await userModel.find()

    getById = async (uid) => await userModel.findOne({ _id: uid })

    getByEmail = async (email) => await userModel.findOne({ email: email })

    update = async (uid, user) => await userModel.updateOne({ _id: uid }, user)

    delete = async () => await userModel.deleteMany()

}


module.exports = UsersMongo