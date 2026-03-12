document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const alertBox = document.getElementById('alertBox');
    const loader = document.getElementById('loader');

    let selectedFile = null;

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        
        if (!file) return;

        if (file.type !== 'application/pdf') {
            showAlert('Please upload a PDF file only.', 'error');
            resetUpload();
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAlert('File size must be less than 5MB.', 'error');
            resetUpload();
            return;
        }

        selectedFile = file;
        fileInfo.innerHTML = `📄 ${file.name} ( ${(file.size / 1024 / 1024).toFixed(2)} MB )`;
        analyzeBtn.style.display = 'block';
        alertBox.style.display = 'none';
    }

    function resetUpload() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.innerHTML = '';
        analyzeBtn.style.display = 'none';
    }

    function showAlert(message, type) {
        alertBox.textContent = message;
        alertBox.className = 'alert ' + type;
        alertBox.style.display = 'block';
    }

    // Submit file to API
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        const token = getToken();
        if (!token) {
            showAlert('Session expired. Please log in again.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        const formData = new FormData();
        formData.append('resume', selectedFile);

        // UI Loading State
        analyzeBtn.style.display = 'none';
        loader.style.display = 'block';

        try {
            const response = await fetch('http://localhost:5000/api/resume/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do not set Content-Type, browser sets it automatically with boundary for FormData
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully parsed, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showAlert(data.message || 'Error uploading file.', 'error');
                analyzeBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Upload Error:', error);
            showAlert('Server error. Ensure backend is running.', 'error');
            analyzeBtn.style.display = 'block';
        } finally {
            loader.style.display = 'none';
        }
    });
});
