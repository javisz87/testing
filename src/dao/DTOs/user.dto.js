class UserDTO {
    constructor(user) {
        this.full_name = user.name? user.name : user.first_name + " " + user.last_name
        this.email = user.email
        this.age = user.age
        this.password = user.password
        this.role = user.role ? user.role : "user"
        this.phone = user.phone ? user.phone.split("-").join('') : ''
    }
}

module.exports = UserDTO