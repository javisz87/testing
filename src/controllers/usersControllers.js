const {usersServices} = require('../repositories/index.repositories')
const jwt = require('jsonwebtoken');
const { isValidatePassword, createHash } = require('../utils')

//Renderizar vista de registro
const renderViewRegister = (req, res) => {
    try {
        res.render("register.handlebars")
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

//Renderizar vista de login
const renderViewLogin = (req, res) => {
    try {
        res.render("login.handlebars")
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

// Obtener lista de usuarios
const getUsersList = async (req, res) => {
    try {
        let users_list = await usersServices.getUsers()

        res.status(200).json({message:"Success", payload:users_list})
        
    } catch (error) {
        res.status(400).json({message:"Error al obtener lista de usuarios."})
    }
}

// Obtener usuario por ID
const userById = async (req, res) => {
    try {
        let {uid} = req.params
        let user = await usersServices.getUserById(uid)

        if (!user) return res.send({ message: "Usuario no registrado" })

        res.status(200).json({message:"Success", payload:user})

    } catch (error) {
        res.status(404).json("Error al obtener usuario.")
    }
}

// Eliminar un usuario
const deleteAllUsers = async (req, res) => {
    try {
        let result = await usersServices.deleteAllUsers()
        res.status(200).json({message:"Success", payload:result})
    } catch (error) {
        res.status(500).json("Error al eliminar usuario.")
    }
}

//--------------------------------------------------------------------//

//Destruir session
const destroySession = (req, res) => {
    req.session.destroy(err => {
        if (!err) {
            res.redirect('/api/sessions')
        } else {
            res.send("Error al intentar salir.")
        }
    })
}

//--------------------------------------------------------------------//

//Registrar usuario (Estrategia local)
const registerUser = (req, res) => {
    try {
        console.log("Usuario registrado correctamente.");
        res.redirect(200, "/api/sessions")

    } catch (error) {
        res.status(500).send("Error de registro.")
    }
}

//Ruta por si no se logra hacer el passport register.
const failRegister = (req, res) => {
    console.log("Failed strategy");
    res.send({ error: "Failed" })
}


//--------------------------------------------------------------------//


//Autenticación con JWT
const authenticateWithJwt = async (req, res) => {
    try {
        let { email, password } = req.body
 
        //Buscar usuario en la base.
        let user = await usersServices.getUserByEmail(email)
        if (!user) return res.send({ message: "Usuario no registrado" })

        //Comparación del pass del usuario con el pass hasheado.
        if (!isValidatePassword(user, password)) return res.send({ message: "Contraseña incorrecta." });

        //Creación del token.
        let token = jwt.sign({ email: user.email }, "secret", { expiresIn: "24h" });

        //El cliente envía sus credenciales mediante una cookie.
        res.cookie("jwtCookie", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        })

        req.session.user = {
            full_name: user.full_name,
            age: user.age,
            email: user.email,
            role: user.role,
        }

        res.redirect("/api/sessions/current")

    } catch (error) {
        res.status(500).send("Error al logearse.")
    }
}  


//Ruta para renderizar vista del usuario.
const currentUser = (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/api/sessions');
        }

        let { full_name, email, age, role } = req.session.user;

        res.render('current.handlebars', {
            full_name, email, age, role
        })

    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

//Ruta para devolver el actual usuario en JSON.
const currentUserJson = (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/api/sessions');
        }

        res.send({payload: req.user})

    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}
//--------------------------------------------------------------------//

//Autenticación. Estrategia con GitHub.
const authenticateWithGitHub = (req, res) => {
    console.log(req.user);
    req.session.user = req.user;
    res.redirect("/api/sessions/current")
}

//--------------------------------------------------------------------//

// Renderizar vista para enviar correo y restablecer password
const renderViewToSendEmail = (req, res) => {
    try {
        res.render('restorePass.handlebars')
    } catch (error) {
        res.status(500).send("Error de presentación.")   
    }
}

//Renderizar vista para cambiar password.
const renderViewChangePassword = (req, res) => {
    try {
        res.render('restore.handlebars')
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

// Enviar correo con enlace de restablecimiento de contraseña
const emailToRestorePassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        //Verificar existencia de usuario en db
        let user = await usersServices.getUserByEmail(email)
        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        const token = jwt.sign({ email }, "secret", { expiresIn: '1h'})

        // Enviar un correo con el enlace para restablecer la contraseña
        const {transporter} = require('../app')

        const mailOptions = {
            from: 'Coder Tests <pcoderhouse@gmail.com>',
            to: email,
            subject: "Restablecer contraseña",
            html: `
            <div>
            <h1>Restablecer contraseña</h1>
            <p>Ingrese en el siguiente enlace: 
            <a href="http://localhost:8080/api/sessions/restore/${token}">Haga click aquí</a>
            </p>
            </div>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Correo enviado", info.response);
                res.status(200).json({message: "Revise su correo, se le envió un enlace para restablecer su contraseña."})
            }
        })

    } catch (error) {
        res.status(500).send("Error al enviar correo y restablecer contraseña.")
    }
}


// Cambiar Contraseña
const changePassword = async (req, res) => {
    try {
        let { token } = req.params
        if(!token) return res.status(400).send({ status: "error", error: "Token inexistente." })

        let { newPassword } = req.body; 
        if (!newPassword) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        //Verificar existencia de usuario en db
        const { email } = jwt.verify(token, "secret")
        let user = await usersServices.getUserByEmail(email)
        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        // Verificar si son iguales la pass vieja con la nueva
        if (isValidatePassword(user, newPassword)) return res.status(400).json({message:"Las contraseñas son iguales."})

        //Actualizando password con hash
        user.password = createHash(newPassword);

        //Actualizamos usuario en la base con su nuevo password.
        await usersServices.updateUser(user._id, user)

        //Redirigir para logearse.
        console.log("Contraseña cambiada correctamente.");
        res.redirect("/api/sessions");

    } catch (error) {
        console.log("Token expirado");
        res.redirect('/api/sessions/restore')
    }
}

//--------------------------------------------------------------------//

// Cambiar de rol
const changeRole = async (req, res) => {
    try {
        let {uid} = req.params
        let user = await usersServices.getUserById(uid)
        if (!user) return res.send({ message: "Usuario no registrado" })

        if (user.role === "user") user.role = "premium"
        else user.role = "user"

        //Actualizamos usuario en la base con su nuevo role.
        await usersServices.updateUser(user._id, user)

        res.status(200).json({message: "Role cambiado exitosamente."})

    } catch (error) {
        res.status(400).json({message: "Error al cambiar de role."})
    }
}

module.exports = {
    renderViewRegister,
    renderViewLogin,
    getUsersList,
    userById,
    deleteAllUsers,
    destroySession,
    registerUser,
    failRegister,
    authenticateWithJwt,
    currentUser,
    currentUserJson,
    authenticateWithGitHub,
    renderViewChangePassword,
    renderViewToSendEmail,
    changePassword,
    emailToRestorePassword,
    changeRole
}