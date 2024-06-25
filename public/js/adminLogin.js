document.getElementById('adminLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData={
        email:document.getElementById('email').value,
        password:document.getElementById('password').value
    }
    try{
        const response=await fetch('/admin/login',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(formData)
        })
        console.log(response)
        if(response.redirected){
            const result=await response.json()
            console.log(result)
            window.location.href=response.url
        }else{
            const errorData=await response.json()
            document.getElementById('loginMessage').innerText=errorData.message
        }
    }catch(err){
        console.error('Error:',err)
        document.getElementById('loginMessage').innerText='An error occured .Please try again later'
        document.getElementById('loginMessage').classList.add('alert','alert-danger')
    }
})