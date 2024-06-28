const multer=require('multer')
const path=require('path')
// const storage=multer.diskStorage({
//     destination:function (req,file,cb){
//         cb(null,path.join(__dirname,'../../aranoz_ecommerce/public/images/productsImage'))
//     },
//     filename:function (req,file,cb){
//         cb(null, Date.now() + path.extname(file.originalname)); 
//     }
// })

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//       const fileTypes = /jpeg|jpg|png/;
//       const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//       const mimetype = fileTypes.test(file.mimetype);
  
//       if (mimetype && extname) {
//         return cb(null, true);
//       } else {
//         cb('Error: Images Only!');
//       }
//     }
//   });
// const uploadMultiple = upload.array('images', 3); 

// module.exports={
// //    uploadMultiple
// upload
// }