const User=require('../../models/usersModel')
const getUsers=async (req,res)=>{
    console.log('this is get user method ')
    const page=parseInt(req.query.page)||1;
    const limit=5
    const searchterm=req.query.search || ''
    try{
        console.log('this is searchterm:',searchterm)
      const  users=await User.find({$or:[{name:{$regex:searchterm,$options:'i'}},{email:{$regex:searchterm,$options:'i'}}]})
        .skip((page - 1) * limit)
            .limit(limit);
        const totalCount=await User.countDocuments()
         res.render('admin/adminUsers',{
            users,page,
            totalPages:Math.ceil(totalCount/limit),
            searchterm:searchterm
        })

    }catch(err){
        console.error('Error fetching categories:',err)
        res.status(500).render('500/500erroradmin')
}
}
const toggleUser=async (req,res)=>{
    try{
        const userId=req.params.id
        const data=await User.findById(userId)
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
        console.log('this is searchterm',searchterm)
       const totalCount=await User.countDocuments({name:{$regex:searchterm,$options:'i'}})
        let users
        if(searchterm){
             users=await User.find({$or:[{name:{$regex:searchterm,$options:'i'}},{email:{$regex:searchterm,$options:'i'}}]})
        .skip((page - 1) * limit)
            .limit(limit);
        }else{
            users=await User.find({}).skip((page-1)*limit).limit(limit)
        }
        res.status(200).render('admin/adminUsers',{
            users,
            currentPage:page,
            totalPages:Math.ceil(totalCount/limit),
            searchterm:''
        })
    }catch(err){
        console.error('error in searching ',err)
       
        res.status(500).render('500/500erroradmin')
    }
}
module.exports={
    getUsers,
    toggleUser,
    searchUser
}