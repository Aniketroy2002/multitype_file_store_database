// Update file name display when file is selected
document.getElementById('file').addEventListener('change', function(e) {
    const fileName = document.querySelector('.file-name');
    if (this.files.length > 0) {
      fileName.textContent = this.files[0].name;
    } else {
      fileName.textContent = 'No file selected';
    }
  });
  
  // Confirm before deleting a file
  document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!confirm('Are you sure you want to delete this file?')) {
        e.preventDefault();
      }
    });
  });