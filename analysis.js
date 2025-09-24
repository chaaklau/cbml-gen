// Ananality for CBML Generator
class CBMLAnalyzer {
    constructor() {
        this.charts = [];
    }

    // Helper function to get panels regardless of namespace
    getPanels(element) {
        // Try different namespace prefixes and no namespace
        const selectors = [
            'cbml\\:panel',
            'ns1\\:panel', 
            'ns2\\:panel',
            'panel'
        ];
        
        let panels = [];
        for (const selector of selectors) {
            const found = element.querySelectorAll(selector);
            if (found.length > 0) {
                panels = panels.concat(Array.from(found));
            }
        }
        
        // Remove duplicates (in case an element matches multiple selectors)
        return panels.filter((panel, index, self) => 
            self.findIndex(p => p === panel) === index
        );
    }

    // Helper function to get balloons regardless of namespace
    getBalloons(element) {
        const selectors = [
            'cbml\\:balloon',
            'ns1\\:balloon',
            'ns2\\:balloon', 
            'balloon'
        ];
        
        let balloons = [];
        for (const selector of selectors) {
            const found = element.querySelectorAll(selector);
            if (found.length > 0) {
                balloons = balloons.concat(Array.from(found));
            }
        }
        
        return balloons.filter((balloon, index, self) => 
            self.findIndex(b => b === balloon) === index
        );
    }

    loadDefaultXML() {
        fetch('./cbml_sample.xml')
            .then(response => response.text())
            .then(xmlText => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, "application/xml");
                this.analyze([xml], ['cbml_sample.xml']);
            })
            .catch(error => {
                console.error('Error loading default XML:', error);
                app.showAlert('Failed to load default XML file.', 'error');
            });
    }

    loadUserXML(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.name.toLowerCase().endsWith('.zip')) {
                this.loadZipFile(file);
            } else {
                this.loadSingleXMLFile(file);
            }
        }
    }

    loadSingleXMLFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(e.target.result, "application/xml");
            this.analyze([xml], [file.name]);
        };
        reader.readAsText(file);
    }

    async loadZipFile(file) {
        try {
            // For ZIP support, we'll need a ZIP library like JSZip
            // First check if JSZip is available
            if (typeof JSZip === 'undefined') {
                app.showAlert('ZIP support requires JSZip library. Please load a single XML file instead.', 'warning');
                return;
            }

            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);
            const xmlFiles = [];
            const xmlNames = [];

            // Extract all XML files from the ZIP
            for (const filename of Object.keys(zipData.files)) {
                if (filename.toLowerCase().endsWith('.xml') && !zipData.files[filename].dir) {
                    const xmlContent = await zipData.files[filename].async('text');
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(xmlContent, "application/xml");
                    xmlFiles.push(xml);
                    xmlNames.push(filename);
                }
            }

            if (xmlFiles.length === 0) {
                app.showAlert('No XML files found in the ZIP archive.', 'warning');
                return;
            }

            this.analyze(xmlFiles, xmlNames);
        } catch (error) {
            console.error('Error loading ZIP file:', error);
            app.showAlert('Failed to load ZIP file. Please ensure it contains valid XML files.', 'error');
        }
    }

    clearResults() {
        const output = document.getElementById('analysisOutput');
        if (output) {
            output.innerHTML = '';
        }
        
        // Destroy existing charts
        this.charts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = [];
    }

    analyze(xmlFiles, filenames = ['XML File']) {
        this.clearResults();
        
        // Ensure xmlFiles is always an array
        if (!Array.isArray(xmlFiles)) {
            xmlFiles = [xmlFiles];
        }
        
        const output = document.getElementById('analysisOutput');
        let allChapters = [];
        let fileChapterMap = [];

        // Collect all chapters from all files
        xmlFiles.forEach((xml, fileIndex) => {
            const chapters = xml.querySelectorAll('div[type="chapter"]');
            chapters.forEach(chapter => {
                allChapters.push(chapter);
                fileChapterMap.push({
                    chapter: chapter,
                    filename: filenames[fileIndex],
                    fileIndex: fileIndex
                });
            });
        });

        if (allChapters.length === 0) {
            output.innerHTML = '<div class="alert alert-warning">No chapters found in the XML file(s).</div>';
            return;
        }

        // Always show individual charts
        const showIndividualCharts = true;

        let outputHTML = `
            <div class="analysis-header mb-4">
                <h3>Statistics by Chapter</h3>
                <p class="text-muted">Analysis of ${allChapters.length} chapter(s) from ${xmlFiles.length} file(s)</p>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>File</th>
                            <th>Chapter ID</th>
                            <th>Page Stats</th>
                            <th>Character Stats</th>
                            ${showIndividualCharts ? '<th>Transition Tags</th>' : ''}
                            ${showIndividualCharts ? '<th>Attentional Framing Tags</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;

        const attentionalFramingTags = ['#macro', '#mono', '#micro', '#amorphic'];
        const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];

        let overallAnaDistribution = { attentionalFraming: {}, transition: {} };
        let overallCharacterStats = {};
        let counters = { overallTotalPanels: 0 };

        attentionalFramingTags.forEach(tag => overallAnaDistribution.attentionalFraming[tag] = 0);
        transitionTags.forEach(tag => overallAnaDistribution.transition[tag] = 0);

        fileChapterMap.forEach((item, index) => {
            const chapter = item.chapter;
            const chapterId = chapter.getAttribute('id');
            const filename = item.filename;
            
            outputHTML += `
                <tr>
                    <td class="small text-muted">${filename}</td>
                    <td class="fw-bold">${chapterId}</td>
                    <td id="chapter-page-stat-${chapterId}-${item.fileIndex}"></td>
                    <td id="chapter-character-stat-${chapterId}-${item.fileIndex}"></td>
                    ${showIndividualCharts ? `<td><div class="chart-container"><canvas id="chart-transition-${chapterId}-${item.fileIndex}"></canvas></div></td>` : ''}
                    ${showIndividualCharts ? `<td><div class="chart-container"><canvas id="chart-attention-${chapterId}-${item.fileIndex}"></canvas></div></td>` : ''}
                </tr>
            `;
        });

        outputHTML += `
                    </tbody>
                </table>
            </div>
            
            <div class="overall-stats mt-5">
                <h3>Overall Statistics</h3>
                <div class="row g-4">
                    <div class="col-lg-3 col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Pages Distribution</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-page-distribution"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Panels Distribution</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-panel-distribution"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Transition Types</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-transition"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Attentional Framing</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-attention"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row g-4 mt-3 analysis-final-charts">
                    <div class="col-lg-4 col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Character Appearance in Panels</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-characters-panels"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Character Appearance in Chapters</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-characters-chapters"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-md-12">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Mono vs Macro Distribution by File</h6>
                                <small class="text-muted">Scatterplot showing the ratio of Mono to Macro panels across all files</small>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-macro-mono-scatter"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Character Word Analysis</h6>
                                <small class="text-muted">Top 10 most common words for each character</small>
                            </div>
                            <div class="card-body" id="character-word-analysis">
                                <!-- Character word analysis will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="d-flex gap-3 justify-content-center">
                            <button class="btn btn-primary" id="download-panels-csv">
                                <i class="bi bi-download me-2"></i>Download Panels Data CSV
                            </button>
                            <button class="btn btn-primary" id="download-chapters-csv">
                                <i class="bi bi-download me-2"></i>Download Chapters Data CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        output.innerHTML = outputHTML;

        // Process each chapter with file information
        fileChapterMap.forEach((item, index) => {
            this.processChapter(item.chapter, index, allChapters.length, overallAnaDistribution, overallCharacterStats, counters, item.fileIndex, showIndividualCharts);
        });

        // Create overall charts
        this.createOverallCharts(allChapters, overallAnaDistribution, overallCharacterStats, counters, fileChapterMap);
    }

    processChapter(chapter, index, totalChapters, overallAnaDistribution, overallCharacterStats, counters, fileIndex = 0, showIndividualCharts = true) {
        const chapterId = chapter.getAttribute('id');
        const panelGrps = chapter.querySelectorAll('div[type="panelGrp"]');
        const panels = this.getPanels(chapter);
        const balloons = this.getBalloons(chapter);

        const attentionalFramingTags = ['#macro', '#mono', '#micro', '#amorphic'];
        const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];

        let anaDistribution = { attentionalFraming: {}, transition: {} };
        let characterStats = {};
        let totalPanels = panels.length;
        counters.overallTotalPanels += totalPanels;

        attentionalFramingTags.forEach(tag => anaDistribution.attentionalFraming[tag] = 0);
        transitionTags.forEach(tag => anaDistribution.transition[tag] = 0);

        Array.from(panels).forEach(panel => {
            const anaAttr = panel.getAttribute('ana');
            if (anaAttr) {
                anaAttr.split(' ').forEach(tag => {
                    if (attentionalFramingTags.includes(tag)) {
                        anaDistribution.attentionalFraming[tag] += 1;
                        overallAnaDistribution.attentionalFraming[tag] += 1;
                    } else if (transitionTags.includes(tag)) {
                        anaDistribution.transition[tag] += 1;
                        overallAnaDistribution.transition[tag] += 1;
                    }
                });
            }

            const charactersAttr = panel.getAttribute('characters');
            if (charactersAttr) {
                charactersAttr.split(' ').forEach(char => {
                    if (!characterStats[char]) {
                        characterStats[char] = { panels: 0, wordCount: 0, words: {} };
                    }
                    characterStats[char].panels += 1;

                    if (!overallCharacterStats[char]) {
                        overallCharacterStats[char] = { panels: 0, wordCount: 0, chapters: new Set(), words: {} };
                    }
                    overallCharacterStats[char].panels += 1;
                    overallCharacterStats[char].chapters.add(chapterId);
                });
            }
        });

        Array.from(balloons).forEach(balloon => {
            const who = balloon.getAttribute('who');
            const text = balloon.textContent.toLowerCase();
            const words = text.split(/\s+/).filter(word => word.length > 2); // Filter out short words
            const wordCount = words.length;
            
            if (who) {
                // Ensure character exists in stats even if not found in panel characters attribute
                if (!characterStats[who]) {
                    characterStats[who] = { panels: 0, wordCount: 0, words: {} };
                }
                if (!overallCharacterStats[who]) {
                    overallCharacterStats[who] = { panels: 0, wordCount: 0, chapters: new Set(), words: {} };
                }
                
                characterStats[who].wordCount += wordCount;
                overallCharacterStats[who].chapters.add(chapterId);
                
                // Count individual words
                words.forEach(word => {
                    const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation
                    if (cleanWord.length > 2) {
                        characterStats[who].words[cleanWord] = (characterStats[who].words[cleanWord] || 0) + 1;
                    }
                });
                
                if (overallCharacterStats[who]) {
                    overallCharacterStats[who].wordCount += wordCount;
                    
                    // Count individual words for overall stats
                    words.forEach(word => {
                        const cleanWord = word.replace(/[^\w]/g, '');
                        if (cleanWord.length > 2) {
                            overallCharacterStats[who].words[cleanWord] = (overallCharacterStats[who].words[cleanWord] || 0) + 1;
                        }
                    });
                }
            }
        });

        // Update page stats
        const pagesCount = panelGrps.length;
        const avgPanelsPerPage = pagesCount > 0 ? (totalPanels / pagesCount).toFixed(2) : 0;

        const pageStatHTML = `
            <div class="small">
                <strong>Pages:</strong> ${pagesCount}<br>
                <strong>Panels:</strong> ${totalPanels}<br>
                <strong>Avg Panels/Page:</strong> ${avgPanelsPerPage}
            </div>
        `;

        // Update character stats with toggle functionality
        const chapterCharId = `${chapterId}_${fileIndex}`;
        let charStatHTML = `<div class="small">`;
        charStatHTML += `<div class="d-flex justify-content-between align-items-center">`;
        charStatHTML += `<span><strong>Characters:</strong> ${Object.keys(characterStats).length}</span>`;
        
        const topCharacters = Object.entries(characterStats)
            .sort(([,a], [,b]) => b.panels - a.panels)
            .slice(0, 10);
            
        if (topCharacters.length > 0) {
            charStatHTML += `<button class="btn btn-sm btn-outline-secondary" onclick="analyzer.toggleChapterCharacterDetails('${chapterCharId}')" title="Toggle character details">`;
            charStatHTML += `<i class="bi bi-eye-fill" id="chapter-toggle-icon-${chapterCharId}"></i>`;
            charStatHTML += `</button>`;
        }
        charStatHTML += `</div>`;
        
        if (topCharacters.length > 0) {
            charStatHTML += `<div id="chapter-chars-${chapterCharId}" style="display: none;">`;
            charStatHTML += '<strong>Top Characters:</strong><br>';
            topCharacters.forEach(([char, stats]) => {
                const topWords = Object.entries(stats.words)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([word, count]) => `${word}(${count})`)
                    .join(', ');
                
                charStatHTML += `${char}: ${stats.panels}p, ${stats.wordCount}w<br>`;
                if (topWords) {
                    charStatHTML += `<small class="text-muted">Words: ${topWords}</small><br>`;
                }
            });
            charStatHTML += `</div>`;
        }
        charStatHTML += `</div>`;
        
        document.getElementById(`chapter-page-stat-${chapterId}-${fileIndex}`).innerHTML = pageStatHTML;
        document.getElementById(`chapter-character-stat-${chapterId}-${fileIndex}`).innerHTML = charStatHTML;

        // Create chapter-specific charts
        // Create charts only if showing individual charts
        if (showIndividualCharts) {
            this.createChapterCharts(chapterId, anaDistribution, totalPanels, attentionalFramingTags, transitionTags, fileIndex);
        }
    }

    createChapterCharts(chapterId, anaDistribution, totalPanels, attentionalFramingTags, transitionTags, fileIndex = 0) {
        const attentionalFramingPercentages = attentionalFramingTags.map(tag => 
            parseFloat(((anaDistribution.attentionalFraming[tag] || 0) / totalPanels * 100).toFixed(2))
        );

        const transitionPercentages = transitionTags.map(tag => 
            parseFloat(((anaDistribution.transition[tag] || 0) / totalPanels * 100).toFixed(2))
        );

        // Transition chart with abbreviated labels
        const transitionLabels = ['Mmnt-Mmnt', 'Actn-Actn', 'Subj-Subj', 'Scn-Scn', 'Asp-Asp', 'Non-Seq'];
        const transitionChart = new Chart(document.getElementById(`chart-transition-${chapterId}-${fileIndex}`), {
            type: 'bar',
            data: {
                labels: transitionLabels,
                datasets: [{
                    label: 'Transition (%)',
                    data: transitionPercentages,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            },
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 5,
                        bottom: 5,
                        left: 5,
                        right: 5
                    }
                }
            }
        });

        // Attention chart
        const attentionChart = new Chart(document.getElementById(`chart-attention-${chapterId}-${fileIndex}`), {
            type: 'bar',
            data: {
                labels: attentionalFramingTags.map(tag => tag.replace('#', '')),
                datasets: [{
                    label: 'Attentional Framing (%)',
                    data: attentionalFramingPercentages,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });

        this.charts.push(transitionChart, attentionChart);
    }

    createOverallCharts(chapters, overallAnaDistribution, overallCharacterStats, counters, fileChapterMap = []) {
        const attentionalFramingTags = ['#macro', '#mono', '#micro', '#amorphic'];
        const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];

        const pagesPerChapter = Array.from(chapters).map(chapter => 
            chapter.querySelectorAll('div[type="panelGrp"]').length
        );
        const panelsPerChapter = Array.from(chapters).map(chapter => 
            this.getPanels(chapter).length
        );
        const chapterLabels = Array.from(chapters).map(chapter => 
            chapter.getAttribute('id')
        );

        // Pages distribution
        const pagesChart = new Chart(document.getElementById('chart-overall-page-distribution'), {
            type: 'bar',
            data: {
                labels: chapterLabels,
                datasets: [{
                    label: 'Pages per Chapter',
                    data: pagesPerChapter,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Panels distribution
        const panelsChart = new Chart(document.getElementById('chart-overall-panel-distribution'), {
            type: 'bar',
            data: {
                labels: chapterLabels,
                datasets: [{
                    label: 'Panels per Chapter',
                    data: panelsPerChapter,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Overall transition types
        const transitionValues = Object.values(overallAnaDistribution.transition);
        const totalTransitions = transitionValues.reduce((sum, count) => sum + count, 0);
        const overallTransitionData = transitionValues.map(count => 
            totalTransitions > 0 ? (count / totalTransitions * 100).toFixed(2) : 0
        );

        const transitionChart = new Chart(document.getElementById('chart-overall-transition'), {
            type: 'doughnut',
            data: {
                labels: ['Mmnt-Mmnt', 'Actn-Actn', 'Subj-Subj', 'Scn-Scn', 'Asp-Asp', 'Non-Seq'],
                datasets: [{
                    data: overallTransitionData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 205, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.4,
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                size: 11
                            },
                            boxWidth: 10,
                            padding: 6
                        }
                    }
                }
            }
        });

        // Overall attentional framing
        const attentionValues = Object.values(overallAnaDistribution.attentionalFraming);
        const totalAttention = attentionValues.reduce((sum, count) => sum + count, 0);
        const overallAttentionalFramingData = attentionValues.map(count => 
            totalAttention > 0 ? (count / totalAttention * 100).toFixed(2) : 0
        );

        const attentionChart = new Chart(document.getElementById('chart-overall-attention'), {
            type: 'doughnut',
            data: {
                labels: attentionalFramingTags.map(tag => tag.replace('#', '')),
                datasets: [{
                    data: overallAttentionalFramingData,
                    backgroundColor: [
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.2,
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            },
                            boxWidth: 12,
                            padding: 8
                        }
                    }
                }
            }
        });

        // Character charts - only show top 10 characters by panel appearance
        const sortedCharacters = Object.entries(overallCharacterStats)
            .sort(([,a], [,b]) => b.panels - a.panels)
            .slice(0, 10);
        
        const overallCharacterLabels = sortedCharacters.map(([char, stats]) => char);
        const overallCharacterPanelsData = sortedCharacters.map(([char, stats]) => 
            ((stats.panels / counters.overallTotalPanels) * 100).toFixed(2)
        );
        const overallCharacterChaptersData = sortedCharacters.map(([char, stats]) => 
            ((stats.chapters.size / chapters.length) * 100).toFixed(2)
        );

        const characterPanelsChart = new Chart(document.getElementById('chart-overall-characters-panels'), {
            type: 'bar',
            data: {
                labels: overallCharacterLabels,
                datasets: [{
                    label: 'Character Appearance in Panels (%)',
                    data: overallCharacterPanelsData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });

        const characterChaptersChart = new Chart(document.getElementById('chart-overall-characters-chapters'), {
            type: 'bar',
            data: {
                labels: overallCharacterLabels,
                datasets: [{
                    label: 'Character Appearance in Chapters (%)',
                    data: overallCharacterChaptersData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });

        // Create Macro-Mono scatter plot data
        const macroMonoData = [];
        fileChapterMap.forEach((item, index) => {
            const chapter = item.chapter;
            const panels = this.getPanels(chapter);
            let macroCount = 0;
            let monoCount = 0;
            
            panels.forEach(panel => {
                const ana = panel.getAttribute('ana') || '';
                if (ana.includes('#macro')) macroCount++;
                if (ana.includes('#mono')) monoCount++;
            });
            
            const total = panels.length;
            if (total > 0) {
                macroMonoData.push({
                    x: macroCount / total * 100,  // Macro on X-axis
                    y: monoCount / total * 100,   // Mono on Y-axis
                    filename: item.filename,
                    chapterId: chapter.getAttribute('id'),
                    totalPanels: panels.length
                });
            }
        });

        const macroMonoChart = new Chart(document.getElementById('chart-macro-mono-scatter'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Files',
                    data: macroMonoData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 0.01,
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0,
                        left: 10,
                        right: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Mono vs Macro Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const dataPoint = context[0].raw;
                                return `${dataPoint.filename} - ${dataPoint.chapterId}`;
                            },
                            label: function(context) {
                                const dataPoint = context.raw;
                                return [
                                    `Macro: ${dataPoint.x.toFixed(1)}%`,
                                    `Mono: ${dataPoint.y.toFixed(1)}%`,
                                    `Total Panels: ${dataPoint.totalPanels}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Macro Percentage (%)'
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            maxTicksLimit: 6
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Mono Percentage (%)'
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            maxTicksLimit: 6
                        }
                    }
                }
            }
        });

        this.charts.push(pagesChart, panelsChart, transitionChart, attentionChart, characterPanelsChart, characterChaptersChart, macroMonoChart);
        
        // Populate character word analysis
        this.populateCharacterWordAnalysis(overallCharacterStats);

        // Add download functionality
        this.setupDownloadButtons(overallCharacterLabels, overallCharacterPanelsData, overallCharacterChaptersData);
    }

    setupDownloadButtons(characterLabels, panelsData, chaptersData) {
        document.getElementById('download-panels-csv')?.addEventListener('click', () => {
            const data = [["Character", "Panel Percentage"], ...characterLabels.map((char, index) => [char, panelsData[index]])];
            this.downloadCSV(data, 'character_panels_data.csv');
        });

        document.getElementById('download-chapters-csv')?.addEventListener('click', () => {
            const data = [["Character", "Chapter Percentage"], ...characterLabels.map((char, index) => [char, chaptersData[index]])];
            this.downloadCSV(data, 'character_chapters_data.csv');
        });
    }

    populateCharacterWordAnalysis(overallCharacterStats) {
        const container = document.getElementById('character-word-analysis');
        if (!container) return;

        let analysisHTML = '';
        const characters = Object.entries(overallCharacterStats)
            .sort(([,a], [,b]) => b.wordCount - a.wordCount); // Sort by total word count

        if (characters.length === 0) {
            analysisHTML = '<p class="text-muted">No character speech data available.</p>';
        } else {
            analysisHTML = '<div class="d-flex flex-wrap">';
            characters.forEach(([character, stats]) => {
                const topWords = Object.entries(stats.words)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 20);

                // Show all characters, even those without recorded speech
                const hasWords = topWords.length > 0;
                
                analysisHTML += `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="mb-0">${character}</h6>
                                <small class="text-muted">${stats.wordCount} total words</small>
                            </div>
                            <div class="card-body">
                                ${hasWords ? `
                                <div class="d-flex flex-wrap gap-1">
                                    ${topWords.map(([word, count]) => 
                                        `<span class="badge bg-primary" title="Used ${count} times">${word} (${count})</span>`
                                    ).join('')}
                                </div>
                                ` : `
                                <div class="text-muted small text-center">
                                    No recorded speech for this character
                                </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            });
            analysisHTML += '</div>';
        }

        container.innerHTML = analysisHTML;
    }

    toggleCharacterWords(characterId) {
        const wordsDiv = document.getElementById(`words-${characterId}`);
        const placeholderDiv = document.getElementById(`placeholder-${characterId}`);
        const iconElement = document.getElementById(`toggle-icon-${characterId}`);
        
        if (wordsDiv && placeholderDiv && iconElement) {
            if (wordsDiv.style.display === 'none') {
                // Show words
                wordsDiv.style.display = 'block';
                placeholderDiv.style.display = 'none';
                iconElement.className = 'bi bi-eye-slash-fill';
            } else {
                // Hide words
                wordsDiv.style.display = 'none';
                placeholderDiv.style.display = 'block';
                iconElement.className = 'bi bi-eye-fill';
            }
        }
    }

    toggleChapterCharacterDetails(chapterCharId) {
        const detailsDiv = document.getElementById(`chapter-chars-${chapterCharId}`);
        const iconElement = document.getElementById(`chapter-toggle-icon-${chapterCharId}`);
        
        if (detailsDiv && iconElement) {
            if (detailsDiv.style.display === 'none') {
                // Show character details
                detailsDiv.style.display = 'block';
                iconElement.className = 'bi bi-eye-slash-fill';
            } else {
                // Hide character details
                detailsDiv.style.display = 'none';
                iconElement.className = 'bi bi-eye-fill';
            }
        }
    }

    downloadCSV(data, filename) {
        const csvContent = data.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize analyzer when needed
window.analyzer = new CBMLAnalyzer();
