function loadDefaultXML() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "00000000.xml", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(xhr.response, "application/xml");
            analyze(xml);
        }
    };
    xhr.send();
}

function loadUserXML(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const parser = new DOMParser();
            const xml = parser.parseFromString(e.target.result, "application/xml");
            analyze(xml);
        };
        reader.readAsText(file);
    }
}

function analyze(xml) {
    const output = document.getElementById('output');
    const chapters = xml.querySelectorAll('div[type="chapter"]');

    let outputHTML = `<h2>Statistics by Chapter</h2>`;
    outputHTML += `<table class="table table-striped"><thead><tr><th>Chapter ID</th><th>Page Stats</th><th>Character Stats</th><th>Transition Tags</th><th>Attentional Framing Tags</th></tr></thead><tbody>`;

    const attentionalFramingTags = ['#macro', '#mono', '#micro', '#amorphic'];
    const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];

    let overallAnaDistribution = { attentionalFraming: {}, transition: {} };
    let overallCharacterStats = {};
    let overallTotalPanels = 0;

    attentionalFramingTags.forEach(tag => overallAnaDistribution.attentionalFraming[tag] = 0);
    transitionTags.forEach(tag => overallAnaDistribution.transition[tag] = 0);

    chapters.forEach((chapter, index) => {
        const chapterId = chapter.getAttribute('id');
        outputHTML += `<tr>`;
        outputHTML += `<td>${chapterId}</td>`;
        outputHTML += `<td id="chapter-page-stat-${chapterId}"></td>`;
        outputHTML += `<td id="chapter-character-stat-${chapterId}"></td>`;
        outputHTML += `<td><div><canvas id="chart-transition-${chapterId}"></canvas></div></td>`;
        outputHTML += `<td><div><canvas id="chart-attention-${chapterId}"></canvas></div></td>`;
        outputHTML += `</tr>`;
    });

    outputHTML += `</tbody></table><hr>`;
    output.innerHTML = outputHTML;

    let overallOutputHTML = `<h2>Overall Statistics</h2>`;
    overallOutputHTML += `<div class="row">
        <div class="col-md-3"><canvas id="chart-overall-page-distribution"></canvas></div>
        <div class="col-md-3"><canvas id="chart-overall-panel-distribution"></canvas></div>
        <div class="col-md-3"><canvas id="chart-overall-transition"></canvas></div>
        <div class="col-md-3"><canvas id="chart-overall-attention"></canvas></div>
    </div>`;
    overallOutputHTML += `<div class="row">
        <div class="col-md-6"><canvas id="chart-overall-characters-panels"></canvas></div>
        <div class="col-md-6"><canvas id="chart-overall-characters-chapters"></canvas></div>
    </div>`;

    output.innerHTML += overallOutputHTML;

    chapters.forEach((chapter, index) => {
        const chapterId = chapter.getAttribute('id');
        const panelGrps = chapter.querySelectorAll('div[type="panelGrp"]');
        const panels = chapter.getElementsByTagName('cbml:panel');
        const balloons = chapter.getElementsByTagName('cbml:balloon');

        let anaDistribution = { attentionalFraming: {}, transition: {} };
        let characterStats = {};
        let totalPanels = panels.length;
        overallTotalPanels += totalPanels;

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
                overallCharacterStats[who].wordCount += wordCount;
            }
        });

        const pagesCount = panelGrps.length;
        const avgPanelsPerPage = (totalPanels / pagesCount).toFixed(2);

        document.getElementById(`chapter-page-stat-${chapterId}`).innerHTML = `
            <p>Number of Pages: ${pagesCount}</p>
            <p>Total Panels: ${totalPanels}</p>
            <p>Average Panels per Page: ${avgPanelsPerPage}</p>`;
        let _charStat =`
            <p>Number of Characters: ${Object.keys(characterStats).length}</p>
            <ul>`;
        for (const [char, stats] of Object.entries(characterStats)) {
            _charStat += `<li>${char}: Appears in ${stats.panels} panels, Word Count: ${stats.wordCount}</li>`;
        }
        _charStat += `</ul>
            <div><canvas id="chart-characters-${chapterId}"></canvas></div>
        </td>`;
        document.getElementById(`chapter-character-stat-${chapterId}`).innerHTML = _charStat;
        
        const attentionalFramingData = Array.from(chapter.querySelectorAll('cbml\\:panel')).reduce((acc, panel) => {
            const anaAttr = panel.getAttribute('ana');
            if (anaAttr) {
            anaAttr.split(' ').forEach(tag => {
                if (attentionalFramingTags.includes(tag)) {
                acc[tag] = (acc[tag] || 0) + 1;
                }
            });
            }
            return acc;
        }, {});
        const attentionalFramingPercentages = attentionalFramingTags.map(tag => parseFloat(((attentionalFramingData[tag] || 0) / panels.length * 100).toFixed(2)));

        const transitionData = Array.from(chapter.querySelectorAll('cbml\\:panel')).reduce((acc, panel) => {
            const anaAttr = panel.getAttribute('ana');
            if (anaAttr) {
            anaAttr.split(' ').forEach(tag => {
                if (transitionTags.includes(tag)) {
                acc[tag] = (acc[tag] || 0) + 1;
                }
            });
            }
            return acc;
        }, {});
        const transitionPercentages = transitionTags.map(tag => ((transitionData[tag] || 0) / panels.length * 100).toFixed(2));

        const characterLabels = Object.keys(characterStats).sort((a, b) => characterStats[b].panels - characterStats[a].panels);
        const characterPanelsData = characterLabels.map(char => ((characterStats[char].panels / totalPanels) * 100).toFixed(2));

        new Chart(document.getElementById(`chart-transition-${chapterId}`), {
            type: 'bar',
            data: {
            labels: transitionTags,
            datasets: [{
                label: `${chapterId} Transition (%)`,
                data: transitionPercentages,
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio:1
            }
        });

        new Chart(document.getElementById(`chart-attention-${chapterId}`), {
            type: 'bar',
            data: {
            labels: attentionalFramingTags,
            datasets: [{
                label: `${chapterId} Attentional Framing`,
                data: attentionalFramingPercentages,
                backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio:1
            }
        });

        new Chart(document.getElementById(`chart-characters-${chapterId}`), {
            type: 'bar',
            data: {
            labels: characterLabels,
            datasets: [{
                label: `${chapterId} Characters Appearance `,
                data: characterPanelsData,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
            }]
            },
            options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                beginAtZero: true,
                stacked: true
                },
                y: {
                stacked: true
                }
            }
            }
        });});

    const overallAttentionalFramingData = Object.values(overallAnaDistribution.attentionalFraming).map(count => (count / overallTotalPanels * 100).toFixed(2));
    const overallTransitionData = Object.values(overallAnaDistribution.transition).map(count => (count / overallTotalPanels * 100).toFixed(2));

    const pagesPerChapter = Array.from(chapters).map(chapter => chapter.querySelectorAll('div[type="panelGrp"]').length);
    const panelsPerChapter = Array.from(chapters).map(chapter => chapter.getElementsByTagName('cbml:panel').length);
    const chapterLabels = Array.from(chapters).map(chapter => chapter.getAttribute('id'));

    new Chart(document.getElementById('chart-overall-page-distribution'), {
        type: 'bar',
        data: {
            labels: chapterLabels,
            datasets: [{
                label: 'Pages per Chapter',
                data: pagesPerChapter,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });

    new Chart(document.getElementById('chart-overall-panel-distribution'), {
        type: 'bar',
        data: {
            labels: chapterLabels,
            datasets: [{
                label: 'Panels per Chapter',
                data: panelsPerChapter,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });

    new Chart(document.getElementById('chart-overall-transition'), {
        type: 'doughnut',
        data: {
            labels: transitionTags,
            datasets: [{
                label: 'Overall Transition Tag Presence (%)',
                data: overallTransitionData,
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    new Chart(document.getElementById('chart-overall-attention'), {
        type: 'doughnut',
        data: {
            labels: attentionalFramingTags,
            datasets: [{
                label: 'Overall Attentional Framing Tag Presence (%)',
                data: overallAttentionalFramingData,
                backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const overallCharacterLabels = Object.keys(overallCharacterStats);
    const overallCharacterPanelsData = overallCharacterLabels.map(char => ((overallCharacterStats[char].panels / overallTotalPanels) * 100).toFixed(2));
    const overallCharacterChaptersData = overallCharacterLabels.map(char => ((overallCharacterStats[char].chapters.size / chapters.length) * 100).toFixed(2));

    new Chart(document.getElementById('chart-overall-characters-panels'), {
        type: 'bar',
        data: {
            labels: overallCharacterLabels,
            datasets: [{
                label: 'Overall Character Appearance in Panels (%)',
                data: overallCharacterPanelsData,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });

    new Chart(document.getElementById('chart-overall-characters-chapters'), {
        type: 'bar',
        data: {
            labels: overallCharacterLabels,
            datasets: [{
                label: 'Overall Character Appearance in Chapters (%)',
                data: overallCharacterChaptersData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}
