const mongoose=require('mongoose')
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send('Invalid user ID')
    }
    next()
}

module.exports=errorHandler