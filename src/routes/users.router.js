const {Router} = require('express')
const router = Router()
const passport = require('passport');
const usersControllers = require('../controllers/usersControllers')
const authJwt = require('../middlewares/authJwt')

//Renderizar vista de registro
router.get("/register", usersControllers.renderViewRegister)

//Renderizar vista de login
router.get("/", usersControllers.renderViewLogin)

// Obtener lista de usuarios
router.get("/users_list", usersControllers.getUsersList)

// Obtener usuario por ID
router.get("/user/:uid", usersControllers.userById)

// Eliminar un usuario
router.delete("/", usersControllers.deleteAllUsers)

//--------------------------------------------------------------------//

//Destruir session
router.get("/logout", usersControllers.destroySession)

//--------------------------------------------------------------------//

//Registrar usuario (Estrategia local)
router.post("/register", passport.authenticate('local', { failureRedirect: "/api/sessions/failRegister" }), usersControllers.registerUser)

//Ruta por si no se logra hacer el passport register.
router.get('/failRegister', usersControllers.failRegister)

//--------------------------------------------------------------------//

//Autenticación con JWT
router.post("/", usersControllers.authenticateWithJwt)

//Ruta para renderizar vista con los datos del usuario.
router.get("/current", passport.authenticate("jwt", { session: false }), usersControllers.currentUser)

// Ruta para devolver el actual usuario en JSON
router.get("/currentJson", passport.authenticate("jwt", { session: false }), usersControllers.currentUserJson)

//--------------------------------------------------------------------//

//Autenticación. Estrategia con GitHub.
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { })

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/api/sessions/" }), usersControllers.authenticateWithGitHub)

//--------------------------------------------------------------------//

// Renderizar vista para enviar correo con enlace para restablecer contraseña
router.get('/restore', usersControllers.renderViewToSendEmail)

// Restablecer contraseña
router.post('/restore', usersControllers.emailToRestorePassword)

//Renderizar vista para cambiar password.
router.get('/restore/:token', usersControllers.renderViewChangePassword)

//Cambiar contraseña.
router.post('/restore/:token', usersControllers.changePassword)

//--------------------------------------------------------------------//

// Cambiar de rol
router.put('/premium/:uid', authJwt.verifyToken, authJwt.isUserOrPremium, usersControllers.changeRole)

module.exports = router