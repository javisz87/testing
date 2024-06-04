const chai = require('chai')
const supertest = require('supertest')

const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe("Testing ecommerce proyecto final.", () => {
    // Mocks
    let cookie

    let mockUser = {
        first_name: "Admin",
        last_name:"Admin",
        email: "admin@mail.com",
        age: 25,
        password: "123",
        role: "admin"
    }

    let mockUserLogin = {
        email: "admin@mail.com",
        password: "123"
    }

    let mockProduct = {
        title:"ProductoB",
        categoria:"CategoriaB",
        precio:5000,
        stock:20,
        imagen:"urlImagenProductoB"
    }

    let mockCart = {
        name: "Cart_Test"
    }

    // Al finalizar los test se eliminan los documentos de las colecciones users, products y carts
    after(async function () {
        const result1 = await requester.delete("/api/sessions")
        const result2 = await requester.delete("/api/products")
        const result3 = await requester.delete("/api/cart")
    
        expect(result1.statusCode).eql(200)
        expect(result2.statusCode).eql(200)
        expect(result3.statusCode).eql(200)
    })

    // ----------------------------------------------------------- //

    // CONTEXTO SESSIONS
    describe("Testing sessions", () => {
        it("Debe registrar un usuario.", async () => {
            const {statusCode, ok, _body} = await requester.post('/api/sessions/register').send(mockUser)
            expect(statusCode).eql(200)
        })

        it("Debe logear correctamente al usuario y devolver una cookie", async () => {

            // Enviar datos del usuario para el login
            const result = await requester.post('/api/sessions').send(mockUserLogin)

            // El endpoint devuelve una cookie
            const cookieResult = result.headers['set-cookie'][0]
            expect(cookieResult).to.be.ok

            // El valor de la cookie se guarda en la variable cookie declarada arriba
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }

            expect(cookie.name).to.be.ok.and.eql('jwtCookie')
            expect(cookie.value).to.be.ok
        })


        it("Debe enviar la cookie del usuario y desestructurar éste.", async () => {

            // Enviar cookie guardada
            const {_body} = await requester.get('/api/sessions/currentJson').set('Cookie', [`${cookie.name} = ${cookie.value}`])

            // El método current debería devolver el correo del usuario
            expect(_body.payload.email).to.be.eql(mockUser.email)
        })
    })

    // -------------------------------------------------------------- //

    // CONTEXTO PRODUCTS
    describe("Testing productos", () => {

        it("El endpoint POST /api/products debe crear un producto.", async () => {
            const {statusCode, ok, _body} = await requester.post("/api/products")
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(mockProduct)

            expect(_body.payload).to.be.an('object')
        })

        it("El endpoint GET /api/products debe devolver un arreglo de productos", async () => {
            const result = await requester.get("/api/products")

            expect(result.statusCode).to.equal(200)
            expect(result._body).to.have.property('payload')
            expect(result._body.payload.docs).to.be.an('array')
        })


        it("El endpoint DELETE /api/products/:pid debe eliminar un solo producto.", async () => {
            const {statusCode, ok, _body} = await requester.post("/api/products")
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(mockProduct)

            const result = await requester.delete(`/api/products/${_body.payload._id}`)
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])

            expect(result.statusCode).eql(200)
            expect(result._body.payload.deletedCount).eql(1)
        })
    })

    // -------------------------------------------------------------- //

    // CONTEXTO CART
    describe ("Testing cart", () => {

        it ("El endpoint POST /api/cart debe crear un cart", async () => {
            const {statusCode, ok, _body } = await requester.post("/api/cart").send(mockCart)

            expect(statusCode).eql(200)
            expect(_body).to.have.property("payload")
            expect(_body.payload.products_list).to.be.an('array')
        })

        it ("El endpoint GET /api/cart/:cid debe devolver un cart", async () => {
            const {statusCode, ok, _body } = await requester.post("/api/cart").send(mockCart)
            expect(statusCode).eql(200)

            let result = await requester.get(`/api/cart/${_body.payload._id}`)
            expect(result.statusCode).eql(200)
            expect(result._body).to.have.property("payload")
        })

        it ("El endpoint POST /api/cart/:cid/:pid debe agregar un producto al carrito", async () => {

            // Crear cart
            const cart = await requester.post("/api/cart").send(mockCart)
            expect(cart.statusCode).eql(200)
            
            // Crear producto , se necesita role "admin", por lo que se enviará el token del mockUser anterior
            const product = await requester.post("/api/products")
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])
            .send(mockProduct)
            
            // Para agregar un producto al cart debemos registrar un usuario con role "user"
            mockUser = {
                first_name: "User",
                last_name:"User",
                email: "user@mail.com",
                age: 25,
                password: "123",
                role: "user"
            }

            mockUserLogin = {
                email: "user@mail.com",
                password: "123",
            }

            // Registro y login del usuario con su respectivo token cookie
            const userRegister = await requester.post('/api/sessions/register').send(mockUser)
            expect(userRegister.statusCode).eql(200)

            const userLogin = await requester.post('/api/sessions').send(mockUserLogin)

            const cookieResult = userLogin.headers['set-cookie'][0]
            expect(cookieResult).to.be.ok

            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }

            expect(cookie.name).to.be.ok.and.eql('jwtCookie')
            expect(cookie.value).to.be.ok

            // Agregar producto al carrito, se enviará el token cookie del nuevo usuario con role "user"
            let result = await requester.post(`/api/cart/${cart._body.payload._id}/${product._body.payload._id}`)
            .set('Cookie', [`${cookie.name} = ${cookie.value}`])

            expect(result.statusCode).eql(200)
            expect(result._body).to.have.property("result")
            expect(result.body.result).to.have.property("products_list").with.lengthOf(1)
        })
    })
})
