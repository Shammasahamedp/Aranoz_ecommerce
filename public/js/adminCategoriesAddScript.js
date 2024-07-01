document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryAddForm');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

    
      const name = document.getElementById('categoryName').value;
      const description = document.getElementById('categoryDescription').value;

      try {
        const validName=/^(?=.*\S)(?=\D*$).*$/.test(name)
        const validDescription=/^(?=.*\S)(?=\D*$).*$/.test(description)
        if(!validName){
            document.getElementById('validateName').innerText='Name is not valid '
            return
        }else{
             document.getElementById('validateName').innerText=''
        }
        if(!validDescription){
            document.getElementById('validateDescription').innerText='Description not valid'
            return 
        }else{
          document.getElementById('validateDescription').innerText=''

        }
        const response=await fetch('/admin/categories/add',{
            method:'POST',
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({name,description})
        })
        console.log(response.status)
        if(!response.ok){
          const errorData=await response.json()
          if(response.status==409){
            Swal.fire({
            title:'Failed',
            text:errorData.message,
            icon:'failed',
            confirmButtonText:'OK'
          })
          }else{
            throw new Error('Failed to add category')
          }
        }else{
          Swal.fire({
            title:'Success',
            text:'Added successfully',
            icon:'success',
            confirmButtonText:'OK'
          }).then(()=>{
            window.location.reload()
          })
        }

        

      } catch (error) {
       Swal.fire({
        title:'Failed',
        text:error.message,
        icon:'error',
        confirmButtonText:'OK'
       })
        
      }
    }); 
  });