document.addEventListener('alpine:init', () => {
    Alpine.data('appState', () => ({
        toast: {
            show: false,
            message: '',
            type: 'info'
        },
        loading: {
            show: false,
            message: 'Membangun pohon...'
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
            
            addLogEntry('Aplikasi berhasil diinisialisasi.', 'success');
        },

        showToast(message, type = 'info') {
            this.toast.message = message;
            this.toast.type = type;
            this.toast.show = true;
            setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        },

        showLoading(message = 'Memproses...') {
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
                });
            }
        },

        showUserGuide() {
            if (window.introJs) {
                introJs().setOptions({
                    steps: [
                        { element: '#parameters', title: 'Masukkan Parameter', intro: 'Masukkan parameter yang dipisahkan koma. Parameter terakhir adalah variabel target.' },
                        { element: '#trainingData', title: 'Masukkan Data Pelatihan', intro: 'Masukkan data pelatihan Anda, satu baris per entri data, dipisahkan koma.' },
                        { element: '#build-btn', title: 'Bangun Pohon', intro: 'Klik di sini untuk membangun pohon keputusan berdasarkan data Anda.' },
                        { element: '#treeVisualization', title: 'Visualisasi Pohon', intro: 'Pohon keputusan Anda akan ditampilkan di sini setelah dibangun.' },
                        { element: '#buildLogs', title: 'Log Build', intro: 'Lihat log terperinci dari proses pembangunan pohon di sini.' }
                    ],
                    nextLabel: 'Berikutnya',
                    prevLabel: 'Sebelumnya',
                    doneLabel: 'Selesai'
                }).start();
            } else {
                this.showToast('Pustaka Intro.js tidak dimuat.', 'error');
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
            this.addLogEntry("Log dibersihkan.", "info");
            this.showToast('Log build dibersihkan', 'info');
        },

        copyLogs() {
            const logsText = this.buildLogsHistory.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
            navigator.clipboard.writeText(logsText)
                .then(() => this.showToast('Log disalin ke clipboard', 'success'))
                .catch(() => this.showToast('Gagal menyalin log', 'error'));
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
            this.showToast('Log berhasil diunduh', 'success');
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
                this.showToast('Gambar pohon diunduh!', 'success');
            } else {
                this.showToast('Visualisasi pohon tidak tersedia untuk diunduh.', 'error');
            }
        },

        async buildTree() {
            const parameters = document.getElementById('parameters').value;
            const data = document.getElementById('trainingData').value;

            if (!parameters.trim() || !data.trim()) {
                this.showToast('Harap isi parameter dan dataset terlebih dahulu.', 'error');
                this.addLogEntry('Build gagal: Parameter atau dataset kosong.', 'error');
                return;
            }

            this.addLogEntry('Memulai proses pembangunan pohon...', 'info');
            this.showLoading('Membangun pohon keputusan...');

            try {
                this.addLogEntry('Mengirim data ke server...', 'info');
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
                
                this.addLogEntry('Visualisasi pohon berhasil diperbarui.', 'success');
                this.showToast('Pohon keputusan berhasil dibangun!', 'success');

            } catch (error) {
                this.addLogEntry(`Error kritis saat membangun pohon: ${error.message}`, 'error');
                this.showToast(`Error: ${error.message}`, 'error');
            } finally {
                this.hideLoading();
            }
        },

        insertExampleData() {
            document.getElementById('parameters').value = 'Cuaca,Temperatur,Kelembapan,Angin,Main';
            document.getElementById('trainingData').value =
                'cerah,panas,tinggi,kecil,tidak\n' +
                'cerah,panas,tinggi,besar,tidak\n' +
                'mendung,panas,tinggi,kecil,ya\n' +
                'hujan,sedang,tinggi,kecil,ya\n' +
                'hujan,dingin,normal,kecil,ya\n' +
                'hujan,dingin,normal,besar,tidak\n' +
                'mendung,dingin,normal,besar,ya\n' +
                'cerah,sedang,tinggi,kecil,tidak\n' +
                'cerah,dingin,normal,kecil,ya\n' +
                'hujan,sedang,normal,kecil,ya\n' +
                'cerah,sedang,normal,besar,ya\n' +
                'mendung,sedang,tinggi,besar,ya\n' +
                'mendung,panas,normal,kecil,ya\n' +
                'hujan,sedang,tinggi,besar,tidak';
            
            this.showToast('Data contoh berhasil dimuat', 'success');
            this.addLogEntry('Data contoh dimuat.', 'info');
            this.updateDataTable();
        },

        updateDataTable() {
            const parameters = document.getElementById('parameters').value;
            const data = document.getElementById('trainingData').value;
            const tableHeader = document.getElementById('tableHeader');
            const tableBody = document.getElementById('tableBody');

            if (!parameters.trim() || !data.trim()) {
                tableHeader.innerHTML = '<tr><th class="py-2 px-4">Data belum diisi</th></tr>';
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