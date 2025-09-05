// Mock pipelines
let pipelines = [
    { id: 1, name: "Build Pipeline", params: "branch=main" },
    { id: 2, name: "Deploy Pipeline", params: "env=staging" },
    { id: 3, name: "Test Pipeline", params: "scope=unit" },
    { id: 4, name: "Cleanup Pipeline", params: "resource=temp" }
];

// Array to store the reorderable playbook
let playbook = [];

// Load DevOps pipelines into dropdown
function loadDevOpsPipelines() {
    const select = document.getElementById("devops-pipelines");
    select.innerHTML = "";
    pipelines.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
    });
    // Add event listener to the select element to add pipelines to the playbook
    select.onchange = (event) => {
        const selectedId = parseInt(event.target.value);
        const selectedPipeline = pipelines.find(p => p.id === selectedId);
        if (selectedPipeline) {
            addPipelineToPlaybook(selectedPipeline);
        }
    };
    log("Loaded pipelines from DevOps API (mock). Select one to add to playbook.");
}

// Add a pipeline to the playbook list
function addPipelineToPlaybook(pipeline) {
    if (!playbook.find(p => p.id === pipeline.id)) {
        playbook.push({ ...pipeline, uniqueId: Date.now() + Math.random() });
        renderPlaybookList();
        log(`Added '${pipeline.name}' to the playbook.`);
    } else {
        log(`'${pipeline.name}' is already in the playbook.`);
    }
}

// Upload file
function uploadPipelineFile(event) {
    const file = event.target.files[0];
    if (file) {
        // Here you would parse the file to get pipeline details
        // For this mock, we'll create a new pipeline entry
        const newPipeline = { id: Date.now(), name: file.name, params: "file uploaded" };
        addPipelineToPlaybook(newPipeline);
        log(`Uploaded and added pipeline file: ${file.name}`);
    }
}

// Schedule pipeline
function schedulePipeline() {
    const time = document.getElementById("schedule-time").value;
    if (playbook.length === 0) {
        log("Cannot schedule. The playbook is empty.");
        return;
    }
    log(`Scheduled playbook with ${playbook.length} pipelines to run at ${time}.`);
}

// Run pipelines
function runPipelines() {
    if (playbook.length === 0) {
        log("Cannot run. The playbook is empty.");
        return;
    }
    log("Running all pipelines in the playbook...");
    playbook.forEach((p, index) => {
        setTimeout(() => {
            log(`▶️ Executing pipeline ${index + 1}: ${p.name}`);
        }, 1000 * (index + 1));
    });
    setTimeout(() => {
        log("✅ Playbook executed successfully.");
    }, 1000 * (playbook.length + 1));
}

// Stop pipelines
function stopPipelines() {
    log("⏹ Pipelines stopped.");
}

// Save configuration
function saveConfiguration() {
    const config = JSON.stringify(playbook, null, 2);
    log(`Configuration saved:\n${config}`);
    // In a real application, you'd send this to a backend
}

// Logging utility
function log(message) {
    const logEl = document.getElementById("log");
    logEl.textContent += `\n${message}`;
    logEl.scrollTop = logEl.scrollHeight; // Auto-scroll to bottom
}

// Render the playbook list in the UI
function renderPlaybookList() {
    const list = document.getElementById("playbook-list");
    if (!list) return;

    list.innerHTML = "";
    playbook.forEach(p => {
        const li = document.createElement("li");
        li.draggable = true;
        li.setAttribute('data-unique-id', p.uniqueId);
        li.innerHTML = `
            <span>${p.name}</span>
            <div class="pipeline-actions">
                <button class="icon-btn" onclick="removePipelineFromPlaybook('${p.uniqueId}')">❌</button>
            </div>
        `;
        list.appendChild(li);
    });
    attachDragAndDropListeners();
}

// Remove a pipeline from the playbook
function removePipelineFromPlaybook(uniqueId) {
    playbook = playbook.filter(p => p.uniqueId.toString() !== uniqueId);
    renderPlaybookList();
    log("Pipeline removed from playbook.");
}

// Drag and drop logic
function attachDragAndDropListeners() {
    const list = document.getElementById("playbook-list");
    let dragSrcEl = null;

    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.uniqueId);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter() {
        this.classList.add('over');
    }

    function handleDragLeave() {
        this.classList.remove('over');
    }

    function handleDrop(e) {
        e.stopPropagation();
        const dropSrcEl = this;
        
        if (dragSrcEl !== dropSrcEl) {
            const dragId = e.dataTransfer.getData('text/plain');
            const dropId = dropSrcEl.dataset.uniqueId;
            
            const dragIndex = playbook.findIndex(p => p.uniqueId.toString() === dragId);
            const dropIndex = playbook.findIndex(p => p.uniqueId.toString() === dropId);
            
            const [draggedItem] = playbook.splice(dragIndex, 1);
            playbook.splice(dropIndex, 0, draggedItem);
            
            renderPlaybookList();
        }
        
        return false;
    }

    function handleDragEnd() {
        this.style.opacity = '1';
        [...list.children].forEach(item => item.classList.remove('over'));
    }

    if (list) {
        [...list.children].forEach(item => {
            item.addEventListener('dragstart', handleDragStart, false);
            item.addEventListener('dragenter', handleDragEnter, false);
            item.addEventListener('dragover', handleDragOver, false);
            item.addEventListener('dragleave', handleDragLeave, false);
            item.addEventListener('drop', handleDrop, false);
            item.addEventListener('dragend', handleDragEnd, false);
        });
    }
}

// Edit pipelines (manage-pipelines.html)
window.onload = () => {
    if (document.getElementById("pipeline-list")) {
        const list = document.getElementById("pipeline-list");
        pipelines.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p.name;
            li.onclick = () => loadPipelineIntoForm(p);
            list.appendChild(li);
        });
    }

    // Check if on the main dashboard and load initial data
    if (document.getElementById("playbook-panel")) {
        loadDevOpsPipelines();
        renderPlaybookList();
    }
};

function loadPipelineIntoForm(pipeline) {
    document.getElementById("pipeline-name").value = pipeline.name;
    document.getElementById("pipeline-params").value = pipeline.params;
}

function savePipeline(event) {
    event.preventDefault();
    log("Pipeline changes saved (mock).");
}