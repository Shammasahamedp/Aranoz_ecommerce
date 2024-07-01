async function logout(){

    try{
     const response=await fetch('/user/logout',{
         method:'POST',
         headers:{
             'Content-Type':'application/json'
         }
     })
     const data=await response.json()

     if(response.ok){
         Swal.fire({
             title:'success',
             text:data.message,
             icon:'success',
             confirmButtonText:'OK'
         }).then(()=>{
             window.location.href='/'
         })
     }else{
         Swal.fire({
             title:'failed',
             text:data.message,
             icon:'failed',
             confirmButtonText:'OK'
         })
     }
    }catch(err){
     console.log('error in logout')
     Swal.fire({
         title:'failed',
         text:'error in logout',
         icon:'failed',
         confirmButtonText:'OK'
     })
    }
}