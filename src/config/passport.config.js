const passport = require('passport');
//Import model
const { userModel } = require('../dao/mongo/models/userModel');
//Import utils.js
const { createHash } = require('../utils');
//Import Roles
const { ROLES } = require('../middlewares/authJwt')

const initializePassport = () => {

    //-------------------------------------------------------//
    //Estrategia local para registrarse.
    const local = require('passport-local');
    const LocalStrategy = local.Strategy;
    const { usersServices } = require('../repositories/index.repositories')

    passport.use("local", new LocalStrategy({passReqToCallback:true, usernameField: "email" },
        async (req, username, password, done) => {

            const { first_name, last_name, email, age, role } = req.body

                try {
                //Buscamos usuario en la base
                let user = await usersServices.getUserByEmail(username)

                //Validación si existe el usuario.
                if (user) {
                    return done("El usuario ya existe.", false);
                }

                //Si no existe, se creará uno nuevo con los datos del body.
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }

                //Validar si se ingresa un rol
                if (role) {
                    if (ROLES.includes(role)) {
                        newUser.role = role
                    } else {
                        return done("Invalid role", false);
                    }
                }

                let result = await usersServices.createUser(newUser)

                //Retorno del resultado.
                return done(null, result);

            } catch (error) {
                return done("Error al obtener el usuario." + error);
            }
    
        }))


    //-------------------------------------------------------//
    //Estrategia para autenticarse con GitHub.
    const GitHubStrategy = require('passport-github2');
    //Import config dotenv
    const config = require('./config.dotenv')

    passport.use("github", new GitHubStrategy({
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    },
        async (accessToken, refreshToken, profile, done) => {

            try {
                console.log(profile);

                let user = await usersServices.getUserByEmail(profile._json.email)
    
                    if (!user) {
                        let newUser = {
                            name: profile._json.name,
                            age: 27,
                            email: profile._json.email,
                        }
    
                        let result = await usersServices.createUser(newUser);
    
                        done(null, result)
                        
                    } else {
                        done(null, user)
                    }

            } catch (error) {
                return done(error);
            }
        }
    ));


    //-------------------------------------------------------//
    //Estrategia para logearse con JWT
    const jwt = require('passport-jwt');

        const cookieExtractor = req => {
            let token = null;
    
            if (req && req.cookies) {
                token = req.cookies["jwtCookie"]
            }
            
            return token;
        }
    
        const JWTStrategy = jwt.Strategy;
        const ExtractJWT = jwt.ExtractJwt;
    
        passport.use("jwt", new JWTStrategy({
    
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: "secret"
    
        }, async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload)
            } catch (error) {
                return done(error)
            }
        }
        ))


    //-------------------------------------------------------//
    //Serializar y deserializar.
    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById({ _id: id });
        done(null, user);
    })

}

module.exports = initializePassport;