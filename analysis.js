// Ananality for CBML Generator
class CBMLAnalyzer {
    constructor() {
        this.charts = [];
    }

    loadDefaultXML() {
        fetch('./cbml_sample.xml')
            .then(response => response.text())
            .then(xmlText => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(xmlText, "application/xml");
                this.analyze(xml);
            })
            .catch(error => {
                console.error('Error loading default XML:', error);
                app.showAlert('Failed to load default XML file.', 'error');
            });
    }

    loadUserXML(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(e.target.result, "application/xml");
                this.analyze(xml);
            };
            reader.readAsText(file);
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

    analyze(xml) {
        this.clearResults();
        
        const output = document.getElementById('analysisOutput');
        const chapters = xml.querySelectorAll('div[type="chapter"]');

        if (chapters.length === 0) {
            output.innerHTML = '<div class="alert alert-warning">No chapters found in the XML file.</div>';
            return;
        }

        let outputHTML = `
            <div class="analysis-header mb-4">
                <h3>Statistics by Chapter</h3>
                <p class="text-muted">Analysis of ${chapters.length} chapter(s)</p>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Chapter ID</th>
                            <th>Page Stats</th>
                            <th>Character Stats</th>
                            <th>Transition Tags</th>
                            <th>Attentional Framing Tags</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const attentionalFramingTags = ['#macro', '#mono', '#micro', '#amorphic'];
        const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];

        let overallAnaDistribution = { attentionalFraming: {}, transition: {} };
        let overallCharacterStats = {};
        let overallTotalPanels = 0;

        attentionalFramingTags.forEach(tag => overallAnaDistribution.attentionalFraming[tag] = 0);
        transitionTags.forEach(tag => overallAnaDistribution.transition[tag] = 0);

        chapters.forEach((chapter, index) => {
            const chapterId = chapter.getAttribute('id');
            outputHTML += `
                <tr>
                    <td class="fw-bold">${chapterId}</td>
                    <td id="chapter-page-stat-${chapterId}"></td>
                    <td id="chapter-character-stat-${chapterId}"></td>
                    <td><div class="chart-container"><canvas id="chart-transition-${chapterId}"></canvas></div></td>
                    <td><div class="chart-container"><canvas id="chart-attention-${chapterId}"></canvas></div></td>
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
                
                <div class="row g-4 mt-3">
                    <div class="col-lg-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Character Appearance in Panels</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-characters-panels"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="card h-100">
                            <div class="card-header">
                                <h6 class="card-title mb-0">Character Appearance in Chapters</h6>
                            </div>
                            <div class="card-body">
                                <canvas id="chart-overall-characters-chapters"></canvas>
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

        // Process each chapter
        chapters.forEach((chapter, index) => {
            this.processChapter(chapter, index, chapters.length, overallAnaDistribution, overallCharacterStats, { overallTotalPanels });
        });

        // Create overall charts
        this.createOverallCharts(chapters, overallAnaDistribution, overallCharacterStats, { overallTotalPanels });
    }

    processChapter(chapter, index, totalChapters, overallAnaDistribution, overallCharacterStats, counters) {
        const chapterId = chapter.getAttribute('id');
        const panelGrps = chapter.querySelectorAll('div[type="panelGrp"]');
        const panels = chapter.getElementsByTagName('cbml:panel');
        const balloons = chapter.getElementsByTagName('cbml:balloon');

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
                        characterStats[char] = { panels: 0, wordCount: 0 };
                    }
                    characterStats[char].panels += 1;

                    if (!overallCharacterStats[char]) {
                        overallCharacterStats[char] = { panels: 0, wordCount: 0, chapters: new Set() };
                    }
                    overallCharacterStats[char].panels += 1;
                    overallCharacterStats[char].chapters.add(chapterId);
                });
            }
        });

        Array.from(balloons).forEach(balloon => {
            const who = balloon.getAttribute('who');
            const wordCount = balloon.textContent.split(/\s+/).length;
            if (who && characterStats[who]) {
                characterStats[who].wordCount += wordCount;
                if (overallCharacterStats[who]) {
                    overallCharacterStats[who].wordCount += wordCount;
                }
            }
        });

        // Update page stats
        const pagesCount = panelGrps.length;
        const avgPanelsPerPage = pagesCount > 0 ? (totalPanels / pagesCount).toFixed(2) : 0;

        document.getElementById(`chapter-page-stat-${chapterId}`).innerHTML = `
            <div class="small">
                <strong>Pages:</strong> ${pagesCount}<br>
                <strong>Panels:</strong> ${totalPanels}<br>
                <strong>Avg Panels/Page:</strong> ${avgPanelsPerPage}
            </div>
        `;

        // Update character stats
        let charStatHTML = `<div class="small">`;
        charStatHTML += `<strong>Characters:</strong> ${Object.keys(characterStats).length}<br>`;
        
        const topCharacters = Object.entries(characterStats)
            .sort(([,a], [,b]) => b.panels - a.panels)
            .slice(0, 3);
            
        if (topCharacters.length > 0) {
            charStatHTML += '<strong>Top Characters:</strong><br>';
            topCharacters.forEach(([char, stats]) => {
                charStatHTML += `${char}: ${stats.panels}p, ${stats.wordCount}w<br>`;
            });
        }
        charStatHTML += `</div>`;
        
        document.getElementById(`chapter-character-stat-${chapterId}`).innerHTML = charStatHTML;

        // Create chapter-specific charts
        this.createChapterCharts(chapterId, anaDistribution, totalPanels, attentionalFramingTags, transitionTags);
    }

    createChapterCharts(chapterId, anaDistribution, totalPanels, attentionalFramingTags, transitionTags) {
        const attentionalFramingPercentages = attentionalFramingTags.map(tag => 
            parseFloat(((anaDistribution.attentionalFraming[tag] || 0) / totalPanels * 100).toFixed(2))
        );

        const transitionPercentages = transitionTags.map(tag => 
            parseFloat(((anaDistribution.transition[tag] || 0) / totalPanels * 100).toFixed(2))
        );

        // Transition chart
        const transitionChart = new Chart(document.getElementById(`chart-transition-${chapterId}`), {
            type: 'bar',
            data: {
                labels: transitionTags.map(tag => tag.replace('#', '')),
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
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });

        // Attention chart
        const attentionChart = new Chart(document.getElementById(`chart-attention-${chapterId}`), {
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

    createOverallCharts(chapters, overallAnaDistribution, overallCharacterStats, counters) {
        const attentionalFramingTags = ['#macro', '#mono', '#micro', '#amorphic'];
        const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];

        const pagesPerChapter = Array.from(chapters).map(chapter => 
            chapter.querySelectorAll('div[type="panelGrp"]').length
        );
        const panelsPerChapter = Array.from(chapters).map(chapter => 
            chapter.getElementsByTagName('cbml:panel').length
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
                maintainAspectRatio: true,
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
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Overall transition types
        const overallTransitionData = Object.values(overallAnaDistribution.transition).map(count => 
            (count / counters.overallTotalPanels * 100).toFixed(2)
        );

        const transitionChart = new Chart(document.getElementById('chart-overall-transition'), {
            type: 'doughnut',
            data: {
                labels: transitionTags.map(tag => tag.replace('#', '')),
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
                maintainAspectRatio: true
            }
        });

        // Overall attentional framing
        const overallAttentionalFramingData = Object.values(overallAnaDistribution.attentionalFraming).map(count => 
            (count / counters.overallTotalPanels * 100).toFixed(2)
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
                maintainAspectRatio: true
            }
        });

        // Character charts
        const overallCharacterLabels = Object.keys(overallCharacterStats);
        const overallCharacterPanelsData = overallCharacterLabels.map(char => 
            ((overallCharacterStats[char].panels / counters.overallTotalPanels) * 100).toFixed(2)
        );
        const overallCharacterChaptersData = overallCharacterLabels.map(char => 
            ((overallCharacterStats[char].chapters.size / chapters.length) * 100).toFixed(2)
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
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true }
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
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        this.charts.push(pagesChart, panelsChart, transitionChart, attentionChart, characterPanelsChart, characterChaptersChart);

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
