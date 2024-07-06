document.addEventListener('DOMContentLoaded', () => {
    let cropper;
    let croppedBlobs = [];
    const resetModal = (url) => {
      $('#cropModal').modal('show');

    };


    const initializeCropper = () => {
      const image = document.getElementById('imageToCrop');
      cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
      });
    };


    document.getElementById('uploadButton').addEventListener('click', () => {
      document.getElementById('productImage').click();
    });


    document.getElementById('productImage').addEventListener('change', function (event) {
      const files = event.target.files;

      if (files && files.length >= 0) {
        [...files].forEach(file => {
          const reader = new FileReader();
          reader.onload = () => {
            $('#imageToCrop').attr('src', reader.result);
            $('#cropModal').modal('show');
          };
          reader.readAsDataURL(file);
        });
      }
    });


    $('#cropModal').on('shown.bs.modal', function () {
      initializeCropper();
    }).on('hidden.bs.modal', function () {
      cropper.destroy();
      cropper = null;
    });

    document.getElementById('cropAndSave').addEventListener('click', function () {
      const canvas = cropper.getCroppedCanvas({
        width: 500,
        height: 500,
      });

      canvas.toBlob((blob) => {
        croppedBlobs.push(blob);
        $('#cropModal').modal('hide');
        Swal.fire({
          icon: 'success',
          title: 'Image cropped successfully!',
          showConfirmButton: false,
          timer: 1500
        });

        const url = URL.createObjectURL(blob)
        const imagePreview = document.createElement('img');
        imagePreview.src = url;
        imagePreview.style.maxWidth = '100px';
        imagePreview.style.maxHeight = '100px';
        imagePreview.style.objectFit = 'cover';

        const displayDiv = document.getElementById('croppedImageDisplay');
        displayDiv.style.display = 'inline'
        displayDiv.appendChild(imagePreview);

      });
    });

    document.getElementById('productAddForm').addEventListener('submit', async function (event) {
      event.preventDefault();
      const name = document.getElementById('productName').value.trim();
      const category = document.getElementById('productCategory').value.trim();
      const price = document.getElementById('productPrice').value;
      const stock = document.getElementById('productQuantity').value;
      const validName = /^(?=.*\S)(?=\D*$).*$/.test(name);
      const validPrice = /^(?!0+$)\d+$/.test(price.toString());
      const validStock = /^\d+$/.test(stock.toString());
      document.getElementById('validateName').innerText = '';
      if (!validName) {
        document.getElementById('validateName').innerText = 'Name is not valid';
        return;
      }
      document.getElementById('validatePrice').innerText = '';
      if (!validPrice) {
        document.getElementById('validatePrice').innerText = 'Price is not valid';
        return;
      }
      document.getElementById('validateStock').innerText = '';
      if (!validStock) {
        document.getElementById('validateStock').innerText = 'stock is not valid';
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('stock', stock);

      croppedBlobs.forEach((blob, index) => {
        console.log(blob)
        formData.append(`croppedImage${index}`, blob, `croppedImage_${index}.jpg`);
      });
      try {
        const response = await fetch('/admin/products/addproduct', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Product added successfully!',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            window.location.href = '/admin/products';
          });
        } else {
          console.log('already exists')
          const errorText = await response.json();
          Swal.fire({
            
            title: 'Failed',
            text: errorText.message,
            icon: 'error',
            confirmButtonText:'OK'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: error.message,
          text: 'Please try again later.',
        });
      }
    });
  });