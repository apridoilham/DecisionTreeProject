document.addEventListener('alpine:init', () => {
    Alpine.data('appState', () => ({
        toast: {
            show: false,
            message: '',
            type: 'info'
        },
        loading: {
            show: false,
            message: 'Building tree...'
        },
        tree: {
            zoom: 1,
            isDragging: false,
            initialX: 0,
            initialY: 0,
            xOffset: 0,
            yOffset: 0,
        },
        buildLogsHistory: [],

        init() {
            console.log("Alpine appState initialized.");
            this.hideLoading(); 
            
            this.loadInitialData();
            this.setupEventListeners();
            this.initializeAOS();
            this.createFallingLeaves();
            this.initializeTooltips();
            
            this.addLogEntry('Application initialized successfully.', 'success');
        },

        showToast(message, type = 'info') {
            this.toast.message = message;
            this.toast.type = type;
            this.toast.show = true;
            setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        },

        showLoading(message = 'Processing...') {
            this.loading.message = message;
            this.loading.show = true;
        },

        hideLoading() {
            this.loading.show = false;
        },

        loadInitialData() {
            document.getElementById('parameters').value = localStorage.getItem('dtb-parameters') || '';
            document.getElementById('trainingData').value = localStorage.getItem('dtb-training-data') || '';
            this.updateDataTable();
        },

        setupEventListeners() {
            document.getElementById('parameters').addEventListener('input', () => this.updateDataTable());
            document.getElementById('trainingData').addEventListener('input', () => this.updateDataTable());

            const treeImage = document.getElementById('treeVisualization');
            if (treeImage) {
                treeImage.addEventListener('mousedown', (e) => this.dragStart(e));
                document.addEventListener('mousemove', (e) => this.drag(e));
                document.addEventListener('mouseup', () => this.dragEnd());
                document.addEventListener('mouseleave', () => this.dragEnd());
            }

            document.addEventListener('keydown', (e) => {
                const ctrlOrMeta = e.ctrlKey || e.metaKey;
                if (ctrlOrMeta && e.key === 'Enter') {
                    e.preventDefault();
                    this.buildTree();
                }
                if (ctrlOrMeta && e.shiftKey && e.key === 'E') {
                    e.preventDefault();
                    this.insertExampleData();
                }
                if (ctrlOrMeta && e.code === 'Equal') {
                    e.preventDefault();
                    this.zoomIn();
                }
                if (ctrlOrMeta && e.code === 'Minus') {
                    e.preventDefault();
                    this.zoomOut();
                }
                if (ctrlOrMeta && e.code === 'Digit0') {
                    e.preventDefault();
                    this.resetZoom();
                }
            });

            setInterval(() => this.saveToLocalStorage(), 30000);
        },

        initializeAOS() {
            if (window.AOS) {
                AOS.init({
                    duration: 800,
                    offset: 100,
                    once: true
                });
            }
        },

        createFallingLeaves() {
            const leavesContainer = document.querySelector('.falling-leaves');
            if (!leavesContainer || leavesContainer.children.length > 0) return;
            const numberOfLeaves = 20;
            for (let i = 0; i < numberOfLeaves; i++) {
                const leaf = document.createElement('div');
                leaf.classList.add('leaf');
                leaf.style.left = `${Math.random() * 100}vw`;
                leaf.style.animationDuration = `${Math.random() * 5 + 5}s`;
                leaf.style.animationDelay = `${Math.random() * 5}s`;
                leavesContainer.appendChild(leaf);
            }
        },

        initializeTooltips() {
            if (window.tippy) {
                tippy('[data-tippy-content]', {
                    theme: 'forest',
                    animation: 'scale',
                    touch: false
                });
            }
        },

        showUserGuide() {
            if (window.introJs) {
                const intro = introJs();
                intro.setOptions({
                    steps: [
                        { element: document.querySelector('#parameters'), title: 'Enter Parameters', intro: 'Enter the parameters separated by commas. The last parameter is the target variable.' },
                        { element: document.querySelector('#trainingData'), title: 'Enter Training Data', intro: 'Enter your training data, one entry per line, with values separated by commas.' },
                        { element: document.querySelector('#build-btn'), title: 'Build Tree', intro: 'Click here to build the decision tree based on your data.' },
                        { element: document.querySelector('#treeVisualization'), title: 'Tree Visualization', intro: 'Your decision tree will be displayed here after it\'s built.' },
                        { element: document.querySelector('#buildLogs'), title: 'Build Logs', intro: 'View the detailed logs of the tree building process here.' }
                    ],
                    nextLabel: 'Next &rarr;',
                    prevLabel: '&larr; Previous',
                    doneLabel: 'Done',
                    showBullets: false,
                    exitOnOverlayClick: true,
                    scrollToElement: true,
                });
                
                window.addEventListener('resize', () => {
                    intro.refresh();
                }, true);

                intro.start();
            } else {
                this.showToast('Intro.js library not loaded.', 'error');
            }
        },

        addLogEntry(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            this.buildLogsHistory.push({ message, type, timestamp });
            this.updateLogsDisplay();
        },

        updateLogsDisplay() {
            const logsContainer = document.getElementById('buildLogs');
            if (!logsContainer) return;
            logsContainer.innerHTML = this.buildLogsHistory.map(log => `
                <div class="log-entry" data-type="${log.type}">
                    <span class="log-timestamp">${log.timestamp}</span>
                    <span>${log.message}</span>
                </div>
            `).join('');
            logsContainer.scrollTop = logsContainer.scrollHeight;
        },

        clearLogs() {
            this.buildLogsHistory = [];
            this.updateLogsDisplay();
            this.addLogEntry("Logs cleared.", "info");
            this.showToast('Build logs cleared', 'info');
        },

        copyLogs() {
            const logsText = this.buildLogsHistory.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
            navigator.clipboard.writeText(logsText)
                .then(() => this.showToast('Logs copied to clipboard', 'success'))
                .catch(() => this.showToast('Failed to copy logs', 'error'));
        },
        
        downloadLogs() {
            const logsText = this.buildLogsHistory.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
            const blob = new Blob([logsText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `decision-tree-log-${new Date().toISOString().slice(0,10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast('Logs downloaded successfully', 'success');
        },

        applyZoom() {
            const img = document.getElementById('treeVisualization');
            if (img) {
                img.style.transform = `translate(${this.tree.xOffset}px, ${this.tree.yOffset}px) scale(${this.tree.zoom})`;
            }
        },
        
        zoomIn() {
            this.tree.zoom = Math.min(this.tree.zoom + 0.1, 3);
            this.applyZoom();
        },
        
        zoomOut() {
            this.tree.zoom = Math.max(this.tree.zoom - 0.1, 0.5);
            this.applyZoom();
        },
        
        resetZoom() {
            this.tree.zoom = 1;
            this.tree.xOffset = 0;
            this.tree.yOffset = 0;
            this.applyZoom();
        },

        dragStart(e) {
            e.preventDefault();
            this.tree.isDragging = true;
            this.tree.initialX = e.clientX - this.tree.xOffset;
            this.tree.initialY = e.clientY - this.tree.yOffset;
        },

        dragEnd() {
            this.tree.isDragging = false;
        },

        drag(e) {
            if (this.tree.isDragging) {
                e.preventDefault();
                this.tree.xOffset = e.clientX - this.tree.initialX;
                this.tree.yOffset = e.clientY - this.tree.initialY;
                this.applyZoom();
            }
        },

        downloadTree() {
            const img = document.getElementById('treeVisualization');
            if (img && img.src && !img.src.endsWith('#')) {
                const a = document.createElement('a');
                a.href = img.src;
                a.download = 'decision-tree.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                this.showToast('Tree image downloaded!', 'success');
            } else {
                this.showToast('Tree visualization is not available for download.', 'error');
            }
        },

        async buildTree() {
            const parameters = document.getElementById('parameters').value;
            const data = document.getElementById('trainingData').value;

            if (!parameters.trim() || !data.trim()) {
                this.showToast('Please fill in the parameters and dataset first.', 'error');
                this.addLogEntry('Build failed: Parameters or dataset is empty.', 'error');
                return;
            }

            this.addLogEntry('Starting the tree building process...', 'info');
            this.showLoading('Building the decision tree...');

            try {
                this.addLogEntry('Sending data to the server...', 'info');
                const response = await fetch('/build_tree', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ parameters, data })
                });

                const result = await response.json();
                
                if (!response.ok || result.error) {
                    throw new Error(result.error || `HTTP error! status: ${response.status}`);
                }

                if (result.logs && Array.isArray(result.logs)) {
                    result.logs.forEach(log => this.addLogEntry(log, 'info'));
                }

                const treeVisualization = document.getElementById('treeVisualization');
                treeVisualization.src = `data:image/png;base64,${result.visualization}`;
                this.resetZoom();
                
                this.addLogEntry('Tree visualization updated successfully.', 'success');
                this.showToast('Decision tree built successfully!', 'success');

            } catch (error) {
                this.addLogEntry(`Critical error while building tree: ${error.message}`, 'error');
                this.showToast(`Error: ${error.message}`, 'error');
            } finally {
                this.hideLoading();
            }
        },

        insertExampleData() {
            document.getElementById('parameters').value = 'Weather, Temperature, Humidity, Wind, Play';
            document.getElementById('trainingData').value =
                'sunny,hot,high,small,no\n' +
                'sunny,hot,high,big,no\n' +
                'cloudy,hot,high,small,yes\n' +
                'rain,medium,high,small,yes\n' +
                'rain,cold,normal,small,yes\n' +
                'rain,cold,normal,big,no\n' +
                'cloudy,cold,normal,big,yes\n' +
                'sunny,medium,high,small,no\n' +
                'sunny,cold,normal,small,yes\n' +
                'rain,medium,normal,small,yes\n' +
                'sunny,medium,normal,big,yes\n' +
                'cloudy,medium,high,big,yes\n' +
                'cloudy,hot,normal,small,yes\n' +
                'rain,medium,high,big,no';
            
            this.showToast('Example data loaded successfully', 'success');
            this.addLogEntry('Example data loaded.', 'info');
            this.updateDataTable();
        },

        updateDataTable() {
            const parameters = document.getElementById('parameters').value;
            const data = document.getElementById('trainingData').value;
            const tableHeader = document.getElementById('tableHeader');
            const tableBody = document.getElementById('tableBody');

            if (!parameters.trim() || !data.trim()) {
                tableHeader.innerHTML = '<tr><th class="py-2 px-4">No data entered</th></tr>';
                tableBody.innerHTML = '';
                return;
            }

            const headers = parameters.split(',').map(param => param.trim());
            const rows = data.split('\n').filter(row => row.trim()).map(row => row.split(',').map(cell => cell.trim()));

            tableHeader.innerHTML = `
                <th class="py-2 px-4 border-b border-border-color bg-bg-tertiary text-text-secondary uppercase text-sm font-semibold">No</th>
                ${headers.map(header => `<th class="py-2 px-4 border-b border-border-color bg-bg-tertiary text-text-secondary uppercase text-sm font-semibold">${header}</th>`).join('')}
            `;

            tableBody.innerHTML = rows.map((row, index) => `
                <tr>
                    <td class="py-2 px-4 border-b border-border-color text-text-primary text-center">${index + 1}</td>
                    ${row.map(cell => `<td class="py-2 px-4 border-b border-border-color text-text-primary text-center">${cell}</td>`).join('')}
                </tr>
            `).join('');
        },

        saveToLocalStorage() {
            localStorage.setItem('dtb-parameters', document.getElementById('parameters').value);
            localStorage.setItem('dtb-training-data', document.getElementById('trainingData').value);
        },
    }));
});