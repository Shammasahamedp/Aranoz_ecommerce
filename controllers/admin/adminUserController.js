const User=require('../../models/usersModel')
const getUsers=async (req,res)=>{
    const page=parseInt(req.query.page)||1;
    const limit=5
    try{
        const users=await User.find({})
        .skip((page-1)*limit)
        .limit(limit)
        const totalCount=await User.countDocuments()
         res.render('admin/adminUsers',{
            users,currentPage:page,
            totalPages:Math.ceil(totalCount/limit),
            searchterm:''
        })

    }catch(err){
        console.error('Error fetching categories:',err)
        res.status(500).send('error in get userpage')
}
}
const toggleUser=async (req,res)=>{
    try{
        // console.log(req)
        const userId=req.params.id
        // console.log(userId)
        const data=await User.findById(userId)
        // console.log(data)
        if(data){
            data.isBlocked=!data.isBlocked
            await data.save()
            res.status(200).json({message:'user status changed',isBlocked:data.isBlocked})
        }else{
            res.status(409).json({message:'user not found'})
        }

    }catch(err){
        res.status(500).json({message:'error in change user status'})
    }
}
const searchUser=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
    
        const searchterm=req.query.term
       const totalCount=await User.countDocuments({name:{$regex:searchterm,$options:'i'}})
        
        console.log(searchterm)
        const users=await User.find({name:{$regex:searchterm,$options:'i'}})
        .skip((page - 1) * limit)
            .limit(limit);
        console.log(users)
        res.status(200).render('admin/adminUsers',{
            users,
            currentPage:page,
            totalPages:Math.ceil(totalCount/limit),
            searchterm:searchterm
        })
    }catch(err){
        console.error('error in searching ',err)
        res.status(500).send('error in searching')
    }
}
module.exports={
    getUsers,
    toggleUser,
    searchUser
}