document.addEventListener('DOMContentLoaded', () => {

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const alertBox = document.getElementById('alertBox');
    const loader = document.getElementById('loader');

    let selectedFile = null;

    // Click upload
    dropZone.addEventListener('click', () => fileInput.click());

    // File select
    fileInput.addEventListener('change', handleFileSelect);

    // Drag drop
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
            showAlert('Upload PDF only', 'error');
            return;
        }

        selectedFile = file;
        fileInfo.innerHTML = `📄 ${file.name}`;
        analyzeBtn.style.display = 'block';
        alertBox.style.display = 'none';
    }

    function showAlert(msg, type) {
        alertBox.innerText = msg;
        alertBox.className = "alert " + type;
        alertBox.style.display = "block";
    }

    // 🚀 MAIN FUNCTION
    analyzeBtn.addEventListener('click', async () => {

        if (!selectedFile) return;

        // 🔥 FIXED TOKEN
        const token = localStorage.getItem("token")?.replace(/"/g, "");
        console.log("TOKEN:", token);

        if (!token) {
            showAlert("Login again!", "error");
            window.location.href = "login.html";
            return;
        }

        const formData = new FormData();
        formData.append("resume", selectedFile);

        loader.style.display = "block";
        analyzeBtn.style.display = "none";

        try {
            const response = await fetch("http://localhost:5000/api/resume/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            console.log("API RESPONSE:", data);

            loader.style.display = "none";

            if (!response.ok) {
                showAlert(data.message || "Error", "error");
                analyzeBtn.style.display = "block";
                return;
            }

            const result = data.analysis;

            // 🔥 SHOW RESULT
            document.getElementById("resultSection").style.display = "block";

            document.getElementById("score").innerText = result.score;
            document.getElementById("role").innerText = result.bestMatchRole;

            // Skills
            const skillsContainer = document.getElementById("skills");
            skillsContainer.innerHTML = "";
            result.detectedSkills.forEach(skill => {
                const span = document.createElement("span");
                span.className = "skill-tag";
                span.innerText = skill;
                skillsContainer.appendChild(span);
            });

            // Suggestions
            const suggestions = document.getElementById("suggestions");
            suggestions.innerHTML = "";
            result.improvementSuggestions.forEach(s => {
                const li = document.createElement("li");
                li.innerText = s;
                suggestions.appendChild(li);
            });

            // 🔥 GRAPH
            renderChart(result.matchPercentages);

        } catch (err) {
            console.error(err);
            showAlert("Server error", "error");
            loader.style.display = "none";
            analyzeBtn.style.display = "block";
        }
    });

    // 📊 Chart
    function renderChart(matchData) {

        const ctx = document.getElementById("barChart").getContext("2d");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(matchData),
                datasets: [{
                    label: "Match %",
                    data: Object.values(matchData),
                    backgroundColor: "#6366f1"
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
});