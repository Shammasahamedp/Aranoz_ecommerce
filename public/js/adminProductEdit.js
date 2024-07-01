document.addEventListener('DOMContentLoaded', () => {
    const oldName = document.getElementById('productName').value;
    const oldCategoryId = document.getElementById('productCategory').value;
    const oldPrice = document.getElementById('productPrice').value;
    const oldStock = document.getElementById('productQuantity').value;
    const form = document.getElementById('productEditForm');
  
    let cropper;
    const modal = $('#cropModal');
    const imageToCrop = document.getElementById('imageToCrop');
    const uploadButtons = document.querySelectorAll('.uploadButton');
    const uploadInputs = document.querySelectorAll('input[type="file"]');
  
    let currentImage;
    let croppedImages = [];
  
    // Initialize oldCroppedImages with the current state of the images
    let oldCroppedImages = Array.from(document.querySelectorAll('#imagecontainer img')).map(img => img.src);
  
    uploadButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        uploadInputs[index].click();
      });
  
      uploadInputs[index].addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            imageToCrop.src = reader.result;
            currentImage = document.getElementById(`currentimage${index + 1}`);
            modal.modal('show');
          };
          reader.readAsDataURL(file);
        }
      });
    });
  
    modal.on('shown.bs.modal', () => {
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 1,
        viewMode: 2,
        preview: '.preview',
      });
    }).on('hidden.bs.modal', () => {
      cropper.destroy();
      cropper = null;
    });
  
    document.getElementById('cropAndSave').addEventListener('click', () => {
      const canvas = cropper.getCroppedCanvas({
        width: 100,
        height: 100,
      });
  
      const croppedImageDataURL = canvas.toDataURL();
      currentImage.src = croppedImageDataURL;
  
      const index = Array.from(uploadButtons).indexOf(currentImage.closest('.image-group').querySelector('.uploadButton'));
      croppedImages[index] = croppedImageDataURL;
  
      modal.modal('hide');
    });
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const name = document.getElementById('productName').value.trim();
      const categoryId = document.getElementById('productCategory').value;
      const price = document.getElementById('productPrice').value;
      const stock = document.getElementById('productQuantity').value;
      const validName = /^(?=.*\S)(?=\D*$).*$/.test(name);
  
      document.getElementById('validateName').innerText = '';
  
      try {
        if (!validName) {
          document.getElementById('validateName').innerText = 'Name is not valid';
          return;
        }
        
        // Compare form values and cropped images to their initial state
        if (name === oldName && categoryId === oldCategoryId && price === oldPrice && stock === oldStock && croppedImages.every((croppedImage, index) => {
          return croppedImage === oldCroppedImages[index];
        })) {
          document.getElementById('samedata').innerText = 'Cannot submit without any change';
          return;
        }
  
        const formData = new FormData();
        formData.append('name', name);
        formData.append('categoryId', categoryId);
        formData.append('price', price);
        formData.append('stock', stock);
  
        // Append each cropped image as a blob
        for (let i = 0; i < croppedImages.length; i++) {
          if (croppedImages[i]) {
            const response = await fetch(croppedImages[i]);
            const blob = await response.blob();
            formData.append('imageUrl', blob, `image${i + 1}.png`);
          }
        }
  
        const response = await fetch(`/admin/products/edit/<%= product._id %>`, {
          method: 'POST',
          body: formData
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          Swal.fire({
            title: 'Failed',
            text: errorData.message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } else {
          const successData = await response.json();
          Swal.fire({
            title: 'Success',
            text: successData.message,
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            window.location.href = '/admin/products';
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Failed',
          text: err.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  });