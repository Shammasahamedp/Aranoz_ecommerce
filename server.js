const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid')
const nocache = require('nocache')
const connectDB=require('./config/database')
const errorHandler=require('./middlewares/errorMiddleware')
const adminAuthRouter=require('./routes/adminrouter/adminAuthRouter')
const adminProductsRouter=require('./routes/adminrouter/adminProductRouter')
const adminCategoriesRouter=require('./routes/adminrouter/adminCategoriesRouter')
const adminUserRouter=require('./routes/adminrouter/adminUserRouter')
const userAuthRouter=require('./routes/userrouter/userAuthRouter')
const userHomeRouter=require('./routes/userrouter/userHomeRouter')
const Admin=require('./models/adminModel')
const Category=require('./models/categoriesModel')
const upload=require('./middlewares/uploadImageMiddleware')
// Category.find({}).then((categories)=>{console.log(categories)})
connectDB().then(async()=>{
    await Admin.createAdmin('shammasahamedp123@gmail.com','admin123')

}).catch(err=>{
    console.error('Failed to connect to the database:',err)
})
const port = process.env.PORT||3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(errorHandler)
app.use(nocache())
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}))
// app.use('/users',)
app.use('/admin',adminAuthRouter)
app.use('/admin/products',upload.single('image'),adminProductsRouter)

app.use('/admin/categories',adminCategoriesRouter)
app.use('/admin/users',adminUserRouter)
app.use('/user',userAuthRouter)
app.use('/',userHomeRouter)
// app.get('*', (req, res) => {
//     res.render('404/404error')
// })
app.listen(port, () => { console.log('The server has started at http://localhost:3000') })