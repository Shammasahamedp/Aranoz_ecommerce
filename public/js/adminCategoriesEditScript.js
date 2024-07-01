document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryForm');
    
      const oldname = document.getElementById('categoryName').value;
      const olddescription = document.getElementById('categoryDescription').value;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const categoryId = '<%= category._id %>';
      const name = document.getElementById('categoryName').value.trim();
      const description = document.getElementById('categoryDescription').value.trim();
      
      try {
        if(oldname===name&&olddescription===description){
          document.getElementById('validateDescription').innerText='you cannot submit with existing data'
          return 
        }
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
        const response = await fetch(`/admin/categories/edit/${categoryId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, description })
        });
        console.log(response.status)
        if (!response.ok) {
          const errorData = await response.json();
          if(response.status===409){
            Swal.fire({
              title:'Failed',
              text:errorData.message,
              icon:'failed',
              confirmButtonText:'OK'
            })

          }
          else if(response.status===500){
            Swal.fire({
              title:'Failed',
              text:errorData.message,
              icon:'failed',
              confirmButtonText:'OK'
            })
          }
          throw new Error( 'Failed to update category');
        }

        const data = await response.json();
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.reload(); // Reload the page after success
        });
      } catch (error) {
        console.error('Error updating category:', error.message);
        Swal.fire({
          title: 'Error!',
          text: error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }); 
  });