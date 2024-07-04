const express = require('express')
require('dotenv').config()
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
const unAuthUserRouter=require('./routes/userrouter/unAuthHomeRouter')
const userProductRouter=require('./routes/userrouter/userProductRouter')
const Admin=require('./models/adminModel')
const Category=require('./models/categoriesModel')
const User=require('./models/usersModel')
const passport=require('passport')
const GoogleStrategy=require('passport-google-oauth20').Strategy
connectDB().then(async()=>{
    await Admin.createAdmin('shammasahamedp123@gmail.com','admin123')

}).catch(err=>{
    console.error('Failed to connect to the database:',err)
})
const port = process.env.PORT

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
app.use(passport.initialize())
app.use(passport.session())
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:3000/user/auth/google/callback',
},async(accessToken,refreshToken,profile,done)=>{
    try{
        console.log('this is passport callback')
        let user=await User.findOne({googleId:profile.id})
        if(!user){
            user=new User({
                googleId:profile.id,
                name:profile.displayName,
                email:profile.emails[0].value
            })
            await user.save()
            req.session.user=profile.id
            console.log(user)
            console.log('this is passport callback')
        }
        return done(null,user)
    }catch(err){
        return done(err,null)
    }
}))
passport.serializeUser((user, done) => {
    done(null, user._id); 
});

passport.deserializeUser( async (id, done) => {
    try{
        const user=await User.findById(id)
        done(null,user)
    }catch(err){
        done(err,null)
    }
});
app.use('/admin',adminAuthRouter)
app.use('/admin/products',adminProductsRouter)

app.use('/admin/categories',adminCategoriesRouter)

app.use('/admin/users',adminUserRouter)
app.use('/user',userAuthRouter)
app.use('/user/dashboard',userHomeRouter)
app.use('/user/product',userProductRouter)
app.use('/',unAuthUserRouter)
// app.get('*', (req, res) => {
//     res.render('404/404error')
// })
app.listen(port, () => { console.log('The server has started at http://localhost:3000') })