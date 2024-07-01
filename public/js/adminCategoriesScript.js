document.addEventListener('DOMContentLoaded',()=>{
    const buttons=document.getElementsByClassName('categoryToggleBtn')
    const formSearch=document.getElementById('searchform')
    formSearch.addEventListener('submit',async (event)=>{
      event.preventDefault()
      const inputValue=document.getElementById('inputsearch').value
      window.location.href=`/admin/categories/search?term=${inputValue}`
      if(response.ok){
        const data=await response.json()
        console.log(data)
        window.location.reload()
      }else{
        const data=await response.json()
        Swal.fire({
          title:'failed',
          text:data.message,
          icon:'error',
          confirmButtonText:'OK'
        })
      }
    })
    Array.from(buttons).forEach((button)=>{
      button.addEventListener('click', async (event) => {
    event.preventDefault()
    console.log('button clicked')
   try{
    const categoryId=button.getAttribute('data-id')
    const response=await fetch(`/admin/categories/toggle/${categoryId}`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      }
    })
    if(response.ok){
      
      const data=await response.json()
      if(data.listed===false){
        button.textContent='list'
      button.classList.remove('btn-warning')
      button.classList.add('btn-danger')
      }else{
        button.textContent='unlist'
      button.classList.remove('btn-danger')
      button.classList.add('btn-warning')
      }
      console.log(data)
      Swal.fire({
        title:'success',
        text:data.message,
        icon:'success',
        confirmTextButton:'OK'
      }).then(()=>{
        window.location.reload()
      })
     

    }else{
      throw new Error('Error in toggle category status')
    }
   }catch(err){
    Swal.fire({
      title:'failed',
      text:err.message,
      icon:'success',
      confirmTextButton:'OK'
    })
   }
  })
    })
  })