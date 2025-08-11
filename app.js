// Modern CBML Generator Application
class CBMLApp {
    constructor() {
        this.currentPage = 'about';
        this.panelGrpCount = 1;
        this.panelCount = 0;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.showPage('about');
        this.setupEventListeners();
    }

    setupNavigation() {
        const nav = document.querySelector('.nav-pills');
        nav.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            }
        });
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));

        // Show selected page
        document.getElementById(page).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        
        this.currentPage = page;

        // Initialize page-specific functionality
        if (page === 'analysis') {
            this.initAnalysisPage();
        }
    }

    setupEventListeners() {
        // Annotate page event listeners
        const storyIdInput = document.getElementById('storyid');
        if (storyIdInput) {
            storyIdInput.addEventListener('input', () => this.generateXML());
        }

        // Add Panel Group button
        const addPanelGrpBtn = document.getElementById('addPanelGrpBtn');
        if (addPanelGrpBtn) {
            addPanelGrpBtn.addEventListener('click', () => this.addPanelGrp());
        }

        // Copy XML button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyXML());
        }

        // Save XML button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveXML());
        }
    }

    addPanelGrp() {
        const storyid = document.getElementById("storyid").value;
        if (!storyid) {
            this.showAlert("Please enter a story ID.", "warning");
            return;
        }

        const panelGrpContainer = document.getElementById("panelGrpContainer");
        const panelGrp = document.createElement("div");
        panelGrp.className = "panelGrp bg-white p-3 mb-3 shadow-sm rounded";
        panelGrp.id = `panelGrp_${this.panelGrpCount++}`;

        panelGrp.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="panelGrp-label me-3"><strong>PanelGrp ${storyid}_${this.panelGrpCount - 1}</strong></div>
                <div class="element-attribute flex-grow-1">
                    <input type="text" id="panelGrpAttributes_${panelGrp.id}" class="form-control form-control-sm small-print" placeholder="Enter custom attributes">
                </div>
                <button class="btn btn-sm btn-outline-secondary ms-2" onclick="app.toggleCollapse('${panelGrp.id}')">
                    <i class="bi bi-chevron-up" id="chevron_${panelGrp.id}"></i>
                </button>
            </div>
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removePanelGrp('${panelGrp.id}')">
                <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <div id="panelContainer_${panelGrp.id}" class="mt-3 collapsible-content">
                <div class="panelInnerContainer"></div>
                <button class="btn btn-info btn-sm mb-2" onclick="app.addPanel('${panelGrp.id}')"><i class="bi bi-plus-circle me-1"></i>Add Panel</button>
            </div>
        `;

        panelGrpContainer.appendChild(panelGrp);
        
        // Add event listener for the attributes input
        const attributesInput = panelGrp.querySelector(`#panelGrpAttributes_${panelGrp.id}`);
        attributesInput.addEventListener('input', () => this.generateXML());

        this.generateXML();
    }

    removePanelGrp(panelGrpId) {
        const panelGrp = document.getElementById(panelGrpId);
        if (panelGrp) {
            panelGrp.remove();
            this.generateXML();
        }
    }

    addPanel(panelGrpId) {
        const panelContainer = document.getElementById(`panelContainer_${panelGrpId}`);
        const panel = document.createElement("div");
        panel.className = "panel bg-light p-3 mb-3 border rounded";
        panel.id = `panel_${this.panelCount++}`;

        // Calculate panel number within this panelGrp
        const existingPanels = panelContainer.querySelectorAll('.panel').length;
        const panelNumber = existingPanels + 1;

        panel.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="panel-label me-3">Panel ${panelNumber}</div>
                <div class="element-attribute flex-grow-1">
                    <input type="text" id="panelAttributes_${panel.id}" class="form-control form-control-sm small-print" placeholder="Enter custom attributes">
                </div>
                <button class="btn btn-sm btn-outline-secondary ms-2" onclick="app.toggleCollapsePanel('${panel.id}')">
                    <i class="bi bi-chevron-up" id="chevron_panel_${panel.id}"></i>
                </button>
            </div>
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removePanel('${panel.id}')">
                <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <div id="panelContent_${panel.id}" class="collapsible-content">
                <div class="row mt-3">
                    <div class="col-12 mb-2">
                        <label for="characters_${panel.id}" class="form-label small-print fw-bold">Characters</label>
                        <input type="text" id="characters_${panel.id}" class="form-control form-control-sm small-print" placeholder="Characters">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-2">
                        <input type="text" id="n_${panel.id}" class="form-control form-control-sm small-print" placeholder="n" value="${panelNumber}">
                    </div>
                    <div class="col-md-5">
                        <select id="ana1_${panel.id}" class="form-select form-select-sm small-print dropdown-select">
                            <option value="" title="NULL">ana: Transition</option>
                            <option value="#moment-to-moment" title="Moment-to-Moment">Moment-to-Moment</option>
                            <option value="#action-to-action" title="Action-to-Action">Action-to-Action</option>
                            <option value="#subject-to-subject" title="Subject-to-Subject">Subject-to-Subject</option>
                            <option value="#scene-to-scene" title="Scene-to-Scene">Scene-to-Scene</option>
                            <option value="#aspect-to-aspect" title="Aspect-to-Aspect">Aspect-to-Aspect</option>
                            <option value="#non-sequitur" title="Non-Sequitur">Non-Sequitur</option>
                        </select>
                    </div>
                    <div class="col-md-5">
                        <select id="ana2_${panel.id}" class="form-select form-select-sm small-print dropdown-select">
                            <option value="" title="NULL">ana: Attentional Framing</option>
                            <option value="#macro">#macro</option>
                            <option value="#mono">#mono</option>
                            <option value="#micro">#micro</option>
                            <option value="#amorphic">#amorphic</option>
                        </select>
                    </div>
                </div>
                <hr class="my-3"/>
                <div class="elements"></div>
                <div class="element-buttons">
                    <button class="btn btn-outline-info btn-sm me-2" onclick="app.addBalloon(this)">
                        <i class="bi bi-chat-dots me-1"></i>Balloon
                    </button>
                    <button class="btn btn-outline-info btn-sm me-2" onclick="app.addCaption(this)">
                        <i class="bi bi-card-text me-1"></i>Caption
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="app.addCustomElement(this)">
                        <i class="bi bi-plus-circle me-1"></i>Custom Element
                    </button>
                </div>
            </div>
        `;

        panelContainer.getElementsByClassName('panelInnerContainer')[0].appendChild(panel);

        // Add event listeners
        const inputs = panel.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.generateXML());
            input.addEventListener('change', () => this.generateXML());
        });

        this.generateXML();
    }

    removePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.remove();
            this.generateXML();
        }
    }

    addBalloon(button) {
        const panel = button.closest('.panel');
        const charactersInput = panel.querySelector(`#characters_${panel.id}`);
        const characterList = charactersInput.value.split(' ').map(c => c.trim()).filter(c => c);

        const elementsDiv = panel.querySelector('.elements');
        const balloon = document.createElement("div");
        balloon.className = "balloon bg-white p-3 mb-3 border rounded shadow-sm";
        
        balloon.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="balloon-label me-3">Balloon</div>
                <div class="element-attribute flex-grow-1">
                    <input type="text" class="form-control form-control-sm small-print" placeholder="Enter custom attributes">
                </div>
            </div>
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removeElement(this)">
                <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <div class="balloon-container mt-3">
                <div class="row">
                    <div class="col-md-3 mb-2">
                        <select class="form-select form-select-sm small-print dropdown-select">
                            ${characterList.map(char => `<option value="${char}">${char}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-3 mb-2">
                        <select class="form-select form-select-sm small-print dropdown-select">
                            <option value="speech">Speech</option>
                            <option value="thought">Thought</option>
                            <option value="audio">Audio</option>
                            <option value="telepathy">Telepathy</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <textarea class="form-control small-print" placeholder="Balloon text" rows="2"></textarea>
                    </div>
                </div>
            </div>
        `;

        elementsDiv.appendChild(balloon);

        // Add event listeners
        const inputs = balloon.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.generateXML());
            input.addEventListener('change', () => this.generateXML());
        });

        this.generateXML();
    }

    addCaption(button) {
        const panel = button.closest('.panel');
        const elementsDiv = panel.querySelector('.elements');
        const caption = document.createElement("div");
        caption.className = "caption bg-white p-3 mb-3 border rounded shadow-sm";
        
        caption.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="caption-label me-3">Caption</div>
                <div class="element-attribute flex-grow-1">
                    <input type="text" class="form-control form-control-sm small-print" placeholder="Enter custom attributes">
                </div>
            </div>
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removeElement(this)">
                <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <div class="mt-3">
                <textarea class="form-control small-print" placeholder="Caption text" rows="3"></textarea>
            </div>
        `;

        elementsDiv.appendChild(caption);

        // Add event listeners
        const inputs = caption.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.generateXML());
        });

        this.generateXML();
    }

    addCustomElement(button) {
        const panel = button.closest('.panel');
        const elementsDiv = panel.querySelector('.elements');
        const element = document.createElement("div");
        element.className = "custom-element bg-white p-3 mb-3 border rounded shadow-sm";
        
        element.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="custom-element-label me-3">Custom Element</div>
            </div>    
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removeElement(this)">
                <i class="bi bi-x-circle-fill text-danger"></i>
            </div>
            <div class="mt-3">
                <textarea class="form-control form-control-sm small-print" rows="2" placeholder="Element, e.g. &lt;sound&gt;SPLASH!!&lt;/sound&gt;"></textarea>
            </div>
        `;

        elementsDiv.appendChild(element);

        // Add event listener
        const textarea = element.querySelector('textarea');
        textarea.addEventListener('input', () => this.generateXML());

        this.generateXML();
    }

    removeElement(span) {
        span.parentElement.remove();
        this.generateXML();
    }

    toggleCollapse(panelGrpId) {
        const container = document.getElementById(`panelContainer_${panelGrpId}`);
        const chevron = document.getElementById(`chevron_${panelGrpId}`);
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            chevron.className = 'bi bi-chevron-up';
        } else {
            container.style.display = 'none';
            chevron.className = 'bi bi-chevron-down';
        }
    }

    toggleCollapsePanel(panelId) {
        const container = document.getElementById(`panelContent_${panelId}`);
        const chevron = document.getElementById(`chevron_panel_${panelId}`);
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            chevron.className = 'bi bi-chevron-up';
        } else {
            container.style.display = 'none';
            chevron.className = 'bi bi-chevron-down';
        }
    }

    saveXML() {
        const codeElement = document.getElementById("output").querySelector("code");
        const xmlContent = codeElement.textContent;
        
        if (!xmlContent || xmlContent.trim() === '<!-- Your CBML XML will appear here -->') {
            this.showAlert('No XML content to save. Please create some annotations first.', 'warning');
            return;
        }

        const storyId = document.getElementById("storyid").value || 'cbml_export';
        const filename = `${storyId}.xml`;
        
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showAlert(`XML saved as ${filename}`, 'success');
    }

    generateXML() {
        const storyid = document.getElementById("storyid").value;
        if (!storyid) {
            return;
        }

        const panelGrpContainer = document.getElementById("panelGrpContainer");
        const panelGrps = panelGrpContainer.getElementsByClassName("panelGrp");
        let xmlOutput = `<div type="chapter" id="${storyid}">\n`;

        for (let i = 0; i < panelGrps.length; i++) {
            const panelGrp = panelGrps[i];
            const panelGrpAttributes = panelGrp.querySelector(`#panelGrpAttributes_${panelGrp.id}`).value;
            let space = panelGrpAttributes ? ' ' : '';
            xmlOutput += `<div type="panelGrp" id="${storyid}_${i + 1}"${space}${panelGrpAttributes}>\n`;

            const panels = panelGrp.querySelectorAll(".panel");
            for (let j = 0; j < panels.length; j++) {
                const panel = panels[j];
                const characters = panel.querySelector(`#characters_${panel.id}`).value;
                const n = panel.querySelector(`#n_${panel.id}`).value;
                const ana1 = panel.querySelector(`#ana1_${panel.id}`).value;
                const ana2 = panel.querySelector(`#ana2_${panel.id}`).value;
                const panelAttributes = panel.querySelector(`#panelAttributes_${panel.id}`).value;
                let space = panelAttributes ? ' ' : '';
                const ana = `${ana1} ${ana2}`.trim();
                xmlOutput += `   <cbml:panel ana="${ana}" characters="${characters}" n="${n}"${space}${panelAttributes}>\n`;

                const elements = panel.getElementsByClassName("elements")[0].children;
                for (let k = 0; k < elements.length; k++) {
                    const element = elements[k];
                    if (element.className.includes("balloon")) {
                        const who = element.querySelector("select").value;
                        const text = element.querySelector("textarea").value;
                        const balloonType = element.querySelectorAll("select")[1].value;
                        const balloonAttributes = element.querySelector(".element-attribute input").value;
                        let space = balloonAttributes ? ' ' : '';
                        xmlOutput += `      <cbml:balloon type="${balloonType}" who="${who}"${space}${balloonAttributes}>\n         ${text}\n      </cbml:balloon>\n`;
                    } else if (element.className.includes("caption")) {
                        const text = element.querySelector("textarea").value;
                        const captionAttributes = element.querySelector(".element-attribute input").value;
                        let space = captionAttributes ? ' ' : '';
                        xmlOutput += `      <cbml:caption${space}${captionAttributes}>\n         ${text}\n      </cbml:caption>\n`;
                    } else if (element.className.includes("custom-element")) {
                        const text = element.querySelector("textarea").value;
                        xmlOutput += `      ${text}\n`;
                    }
                }

                xmlOutput += `   </cbml:panel>\n`;
            }

            xmlOutput += `</div>\n`;
        }

        xmlOutput += `</div>`;
        const codeElement = document.getElementById("output").querySelector("code");
        codeElement.textContent = xmlOutput.trim();
        if (window.Prism) {
            Prism.highlightElement(codeElement);
        }
    }

    copyXML() {
        const codeElement = document.getElementById("output").querySelector("code");
        
        // Modern approach using Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(codeElement.textContent).then(() => {
                this.showAlert('XML copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(codeElement.textContent);
            });
        } else {
            this.fallbackCopyTextToClipboard(codeElement.textContent);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showAlert('XML copied to clipboard!', 'success');
            } else {
                this.showAlert('Failed to copy XML. Please try again.', 'error');
            }
        } catch (err) {
            this.showAlert('Failed to copy XML. Please try again.', 'error');
        }

        document.body.removeChild(textArea);
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    // Analysis page functionality
    initAnalysisPage() {
        // The analysis functionality is handled by the analyzer object
        // which is loaded separately in analysis.js
        console.log('Analysis page initialized');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CBMLApp();
});
