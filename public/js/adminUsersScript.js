document.addEventListener('DOMContentLoaded',async (event)=>{
    event.preventDefault()
    const buttons=document.querySelectorAll('.togglebutton')
   
   buttons.forEach((button)=>{
    button.addEventListener('click',async (event)=>{
      console.log('button clicked')
      event.preventDefault()
     try{
      const userId=button.getAttribute('data-id')
      const response=await fetch(`/admin/users/toggle/${userId}`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        }
      })
      if(response.ok){
        const data=await response.json()
        
        if(data.isBlocked===true){
          button.classList.remove('btn-warning')
          button.classList.add('btn-danger')
          button.textContent='unblock'
        }else {
          button.classList.remove('btn-danger')
          button.classList.add('btn-warning')
          button.textContent='block'
        }
      }else{
        Swal.fire({
          title:'failed',
          text:'error in changing status',
          icon:'error',
          confirmButttonText:'OK'
        })
      }
     }catch(err){
      Swal.fire({
          title:'failed',
          text:'error in changing status',
          icon:'error',
          confirmButttonText:'OK'
        })
     }
    })
   })

  })