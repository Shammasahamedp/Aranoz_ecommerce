const User=require('../../models/usersModel')
const Cart=require('../../models/cartModel')
const Product=require('../../models/productsModel')
const getCart=async (req,res)=>{
    try{
        const userId=req.session.user
        const cart=await Cart.findOne({userId}).populate('items.productId')
        let totalQuantity=0;
            let totalPrice=0;
        if(!cart||cart.items.length==0){
           console.log('this is without cart')
            let cartData={
                items:[],
                totalQuantity:totalQuantity,
                totalPrice:totalPrice,
                breadcrumbItems:[{name:'Dashboard',url:'/user/dashboard'},{name:'cart'}]
            }
            res.status(200).render('cart/cart',{cartData,cart:''})
        }else{
            let cartData={
                items:[],
                totalQuantity:totalQuantity,
                totalPrice:totalPrice,
                breadcrumbItems:[{name:'Dashboard',url:'/user/dashboard'},{name:'cart'}]

            }
            
                cart.items.forEach(item=>{
                    let itemTotalPrice=item.quantity*item.productId.price;
                    cartData.items.push({
                        productId:item.productId._id,
                        productImage:item.productId.imageUrl[0],
                        productName:item.productId.name,
                        quantity:item.quantity,
                        price:item.productId.price,
                        totalPrice:itemTotalPrice,
                        totalStock:item.productId.stock
                    })
                    cartData.totalPrice+=itemTotalPrice,
                    cartData.totalQuantity+=item.quantity
                })
            res.status(200).render('cart/cart',{cartData,cart})
        }
        
    }catch(err){
        console.error(err)
    }
}
const updateCart=async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId, newQuantity } = req.body;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        if (newQuantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = newQuantity;
        }

        await cart.save();
        let totalQuantity = 0;
        let totalPrice = 0;
        cart.items.forEach(item => {
            totalQuantity += item.quantity;
            totalPrice += item.quantity * item.price;
        });

        res.json({ cart, totalQuantity, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
const deleteCart=async (req,res)=>{
    try{
        const productId=req.params.id
        const userId=req.session.user
        const cart = await Cart.findOne({userId})
        if(!cart){
            return res.status(404).json({message:'cart is not found'})
        }
        const itemIndex=cart.items.findIndex(item=>item.productId.toString()===productId)
        if(itemIndex>-1){
            cart.items.splice(itemIndex,1)
            await cart.save()
            const newSubTotal=cart.items.reduce((acc,curr)=>{
                acc+=curr.quantity*curr.price
                return acc
            },0)
           return  res.status(200).json({message:'cart is deleted',newSubTotal})
        }else{
            return res.status(404).json({message:'item not found in the cart'})
        }
    }catch(err){
        console.error(err)
        res.status(500).json({message:'an error occured while deleting the item from the cart'})
    }
}
module.exports={
    getCart,
    updateCart,
    deleteCart
}