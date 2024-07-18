const Cart=require('../../models/cartModel')
const Address=require('../../models/addressModel')
const getCheckout=async (req,res)=>{
    try{
        const userId=req.session.user
        const cartId=req.params.id
        const addresses=await Address.findOne({userId})
        console.log(addresses)
        const cart=await Cart.findById(cartId).populate('items.productId')
        let totalQuantity=0
        let totalPrice=0
        let cartData={
            items:[],
            totalQuantity:totalQuantity,
            totalPrice:totalPrice
        }
        cart.items.forEach(item => {
            let itemTotalPrice=item.quantity*item.productId.price;
            cartData.items.push({
                productName:item.productId.name,
                quantity:item.quantity,
                price:item.productId.price,
                totalPrice:itemTotalPrice
                
            })
            cartData.totalPrice+=itemTotalPrice,
            cartData.totalQuantity+=item.quantity
        });
        console.log(cart)
        res.status(200).render('users/checkout',{addresses,cartData})
    }catch(err){
        console.error(err)
    }
}

module.exports={
    getCheckout
}