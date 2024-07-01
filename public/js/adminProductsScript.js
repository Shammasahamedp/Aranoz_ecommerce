document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchform').addEventListener('submit', (event) => {
      event.preventDefault()
      const inputValue = document.getElementById('inputsearch').value
      window.location.href = `/admin/products/search?term=${inputValue}`
    })
    const toggleButtons = document.getElementsByClassName('toggleButton')
    try {
     Array.from( toggleButtons).forEach(toggleButton => {
        toggleButton.addEventListener('click', async (event) => {
          const productId=toggleButton.getAttribute('data-id')

          event.preventDefault()
          console.log('button clicked')
          const response = await fetch(`/admin/products/toggle/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

          })
          if (!response.ok) {
            const errorData = await response.json()
            Swal.fire({
              title: 'failed',
              text: errorData.message,
              icon: 'error',
              confirmButtonText: 'OK'
            })
          } else {
            const data = await response.json()
            if (data.listed === true) {
              toggleButton.textContent = 'unlist'
              toggleButton.classList.remove('btn-danger')
              toggleButton.classList.add('btn-warning')
              
            } else if (data.listed === false) {
              toggleButton.textContent = 'list'
              toggleButton.classList.remove('btn-warning')
              toggleButton.classList.add('btn-danger')
            

            } else {
              throw new Error('error occured in toggleproduct')
            }
          }

        })
      });

    } catch (err) {
      Swal.fire({
        title: 'failed',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  })