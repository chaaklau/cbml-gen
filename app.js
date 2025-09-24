// Modern CBML Generator Application
class CBMLApp {
    constructor() {
        this.currentPage = 'about';
        this.panelGrpCount = 1;
        this.panelCount = 0;
        this.characters = [];
        this.teiHeader = {
            title: 'Doraemon',
            author: 'Fujiko F Fujio',
            encoder: 'Doe, John',
            encoderId: 'eduhk.9999999',
            sourceDesc: 'Selected Doraemon stories.'
        };
        this.anaSchemas = [
            {
                id: 'transition',
                displayName: 'Transition',
                options: [
                    { value: '', label: 'ana: Transition', description: 'NULL' },
                    { value: '#moment-to-moment', label: 'Moment-to-Moment', description: 'Moment-to-Moment' },
                    { value: '#action-to-action', label: 'Action-to-Action', description: 'Action-to-Action' },
                    { value: '#subject-to-subject', label: 'Subject-to-Subject', description: 'Subject-to-Subject' },
                    { value: '#scene-to-scene', label: 'Scene-to-Scene', description: 'Scene-to-Scene' },
                    { value: '#aspect-to-aspect', label: 'Aspect-to-Aspect', description: 'Aspect-to-Aspect' },
                    { value: '#non-sequitur', label: 'Non-Sequitur', description: 'Non-Sequitur' }
                ]
            },
            {
                id: 'framing',
                displayName: 'Attentional Framing',
                options: [
                    { value: '', label: 'ana: Attentional Framing', description: 'NULL' },
                    { value: '#macro', label: '#macro', description: '#macro' },
                    { value: '#mono', label: '#mono', description: '#mono' },
                    { value: '#micro', label: '#micro', description: '#micro' },
                    { value: '#amorphic', label: '#amorphic', description: '#amorphic' }
                ]
            }
        ];
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
        // File choice buttons
        const newFileBtn = document.getElementById('newFileBtn');
        if (newFileBtn) {
            newFileBtn.addEventListener('click', () => this.startNewProject());
        }

        const uploadFileBtn = document.getElementById('uploadFileBtn');
        if (uploadFileBtn) {
            uploadFileBtn.addEventListener('click', () => this.loadXML());
        }

        // TEI Header editing
        const editHeaderBtn = document.getElementById('editHeaderBtn');
        if (editHeaderBtn) {
            editHeaderBtn.addEventListener('click', () => this.toggleHeaderEditing());
        }

        // Character management
        const editCharactersBtn = document.getElementById('editCharactersBtn');
        if (editCharactersBtn) {
            editCharactersBtn.addEventListener('click', () => this.showCharacterEditor());
        }

        const saveCharactersBtn = document.getElementById('saveCharactersBtn');
        if (saveCharactersBtn) {
            saveCharactersBtn.addEventListener('click', () => this.saveCharacters());
        }

        const cancelCharactersBtn = document.getElementById('cancelCharactersBtn');
        if (cancelCharactersBtn) {
            cancelCharactersBtn.addEventListener('click', () => this.hideCharacterEditor());
        }

        // Schema management
        const editSchemasBtn = document.getElementById('editSchemasBtn');
        if (editSchemasBtn) {
            editSchemasBtn.addEventListener('click', () => this.showSchemaEditor());
        }

        const addSchemaBtn = document.getElementById('addSchemaBtn');
        if (addSchemaBtn) {
            addSchemaBtn.addEventListener('click', () => this.addNewSchema());
        }

        const saveSchemasBtn = document.getElementById('saveSchemasBtn');
        if (saveSchemasBtn) {
            saveSchemasBtn.addEventListener('click', () => this.saveSchemas());
        }

        const cancelSchemasBtn = document.getElementById('cancelSchemasBtn');
        if (cancelSchemasBtn) {
            cancelSchemasBtn.addEventListener('click', () => this.hideSchemaEditor());
        }

        // TEI Header save
        const saveTeiHeaderBtn = document.getElementById('saveTeiHeaderBtn');
        if (saveTeiHeaderBtn) {
            saveTeiHeaderBtn.addEventListener('click', () => this.saveTeiHeader());
        }

        // Story config save
        const saveStoryConfigBtn = document.getElementById('saveStoryConfigBtn');
        if (saveStoryConfigBtn) {
            saveStoryConfigBtn.addEventListener('click', () => this.saveStoryConfig());
        }

        // Download TEI button
        const downloadTeiBtn = document.getElementById('downloadTeiBtn');
        if (downloadTeiBtn) {
            downloadTeiBtn.addEventListener('click', () => this.saveXML());
        }

        // Annotate page event listeners
        const storyIdInput = document.getElementById('storyid');
        if (storyIdInput) {
            storyIdInput.addEventListener('input', () => this.generateXML());
        }

        // TEI header inputs
        const teiInputs = ['teiTitle', 'teiAuthor', 'teiEncoder', 'teiEncoderId', 'teiSourceDesc'];
        teiInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateTeiHeader());
            }
        });

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

        // Load XML button
        const loadBtn = document.getElementById('loadBtn');
        if (loadBtn) {
        }
    }

    startNewProject() {
        // Hide file choice and show configuration header
        document.getElementById('fileChoiceSection').style.display = 'none';
        document.getElementById('configurationHeader').style.display = 'block';
        document.getElementById('addPanelGrpSection').style.display = 'block';
        document.getElementById('downloadTeiBtn').style.display = 'inline-block';
        
        // Clear any existing content
        document.getElementById('panelGrpContainer').innerHTML = '';
        this.panelGrpCount = 1;
        this.panelCount = 0;
        
        // Clear story ID
        document.getElementById('storyid').value = '';
        
        // Reset characters
        this.characters = [];
        this.updateCharacterButton();
        
        // Show required configuration sections for new projects
        document.getElementById('teiHeaderSection').style.display = 'block';
        document.getElementById('storyConfigSection').style.display = 'block';
        
        // Update status indicators
        this.updateConfigurationStatus();
    }

    startAnnotation() {
        // Hide configuration sections and show annotation area
        document.getElementById('teiHeaderSection').style.display = 'none';
        document.getElementById('storyConfigSection').style.display = 'none';
        document.getElementById('anaSchemaSection').style.display = 'none';
        
        // Show the annotation panels
        document.getElementById('annotationPanelsRow').style.display = 'block';
        
        // Update configuration status to show proper icons
        this.updateConfigurationStatus();
        
        // Show the first panel group if not already present
        if (this.panelGrpCount === 1 && document.getElementById('panelGrpContainer').children.length === 0) {
            this.addPanelGrp();
        }
        
        // Generate initial XML
        this.generateXML();
    }

    resetProject() {
        // Show confirmation dialog
        if (confirm('Are you sure you want to reset the project? All current work will be lost.')) {
            // Reset all UI sections
            document.getElementById('fileChoiceSection').style.display = 'block';
            document.getElementById('configurationHeader').style.display = 'none';
            document.getElementById('teiHeaderSection').style.display = 'none';
            document.getElementById('storyConfigSection').style.display = 'none';
            document.getElementById('anaSchemaSection').style.display = 'none';
            document.getElementById('addPanelGrpSection').style.display = 'none';
            document.getElementById('annotationPanelsRow').style.display = 'none';
            document.getElementById('downloadTeiBtn').style.display = 'none';
            
            // Clear panel container
            document.getElementById('panelGrpContainer').innerHTML = '';
            
            // Reset counters
            this.panelGrpCount = 1;
            this.panelCount = 0;
            
            // Clear story ID
            document.getElementById('storyid').value = '';
            
            // Reset characters
            this.characters = [];
            this.updateCharacterButton();
            
            // Clear output
            const codeElement = document.getElementById("output").querySelector("code");
            codeElement.textContent = '<!-- Your CBML XML will appear here -->';
            
            // Reset TEI header to defaults
            this.teiHeader = {
                title: 'Doraemon',
                author: 'Fujiko F Fujio',
                encoder: 'Doe, John',
                encoderId: 'eduhk.9999999',
                sourceDesc: 'Selected Doraemon stories.'
            };
            
            // Update TEI inputs with defaults
            document.getElementById('teiTitle').value = this.teiHeader.title;
            document.getElementById('teiAuthor').value = this.teiHeader.author;
            document.getElementById('teiEncoder').value = this.teiHeader.encoder;
            document.getElementById('teiEncoderId').value = this.teiHeader.encoderId;
            document.getElementById('teiSourceDesc').value = this.teiHeader.sourceDesc;
            
            // Re-enable header editing
            this.enableHeaderEditing();
            
            // Update status
            this.updateConfigurationStatus();
        }
    }

    toggleHeaderEditing() {
        const isReadonly = document.getElementById('teiTitle').hasAttribute('readonly');
        if (isReadonly) {
            this.enableHeaderEditing();
        } else {
            this.disableHeaderEditing();
        }
    }

    enableHeaderEditing() {
        const teiInputs = ['teiTitle', 'teiAuthor', 'teiEncoder', 'teiEncoderId', 'teiSourceDesc'];
        teiInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.removeAttribute('readonly');
                input.classList.remove('form-control-plaintext');
                input.classList.add('form-control');
            }
        });
        document.getElementById('editHeaderBtn').innerHTML = '<i class="bi bi-check"></i> Done';
    }

    disableHeaderEditing() {
        const teiInputs = ['teiTitle', 'teiAuthor', 'teiEncoder', 'teiEncoderId', 'teiSourceDesc'];
        teiInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.setAttribute('readonly', true);
                input.classList.remove('form-control');
                input.classList.add('form-control-plaintext');
            }
        });
        const editHeaderBtn = document.getElementById('editHeaderBtn');
        if (editHeaderBtn) {
            editHeaderBtn.innerHTML = '<i class="bi bi-pencil"></i> Edit';
        }
        this.updateTeiHeader();
    }

    updateTeiHeader() {
        const titleEl = document.getElementById('teiTitle');
        const authorEl = document.getElementById('teiAuthor');
        const encoderEl = document.getElementById('teiEncoder');
        const encoderIdEl = document.getElementById('teiEncoderId');
        const sourceDescEl = document.getElementById('teiSourceDesc');
        
        this.teiHeader = {
            title: titleEl ? titleEl.value : this.teiHeader.title,
            author: authorEl ? authorEl.value : this.teiHeader.author,
            encoder: encoderEl ? encoderEl.value : this.teiHeader.encoder,
            encoderId: encoderIdEl ? encoderIdEl.value : this.teiHeader.encoderId,
            sourceDesc: sourceDescEl ? sourceDescEl.value : this.teiHeader.sourceDesc
        };
    }

    showCharacterEditor() {
        document.getElementById('charactersList').style.display = 'block';
        // Show characters without # prefix for editing
        const charactersForEditing = this.characters.map(char => char.startsWith('#') ? char.substring(1) : char);
        document.getElementById('charactersInput').value = charactersForEditing.join('\n');
        document.getElementById('editCharactersBtn').style.display = 'none';
    }

    hideCharacterEditor() {
        document.getElementById('charactersList').style.display = 'none';
        document.getElementById('editCharactersBtn').style.display = 'block';
    }

    saveCharacters() {
        const charactersText = document.getElementById('charactersInput').value;
        this.characters = charactersText
            .split('\n')
            .map(char => char.trim())
            .filter(char => char.length > 0)
            .map(char => char.startsWith('#') ? char : `#${char}`); // Add # prefix if not present
        
        this.updateCharacterButton();
        this.hideCharacterEditor();
        this.showAlert('Character list updated successfully!', 'success');
    }

    updateCharacterButton() {
        const btn = document.getElementById('editCharactersBtn');
        if (this.characters.length > 0) {
            const displayChars = this.characters.map(char => char.startsWith('#') ? char.substring(1) : char);
            btn.innerHTML = `<i class="bi bi-people me-1"></i>Characters: ${displayChars.slice(0, 3).join(', ')}${this.characters.length > 3 ? '...' : ''}`;
        } else {
            btn.innerHTML = '<i class="bi bi-people me-1"></i>Edit Character List';
        }
    }

    toggleConfigSection(section) {
        const sections = {
            'teiHeader': 'teiHeaderSection',
            'anaSchema': 'anaSchemaSection', 
            'storyConfig': 'storyConfigSection'
        };
        
        const sectionElement = document.getElementById(sections[section]);
        if (sectionElement.style.display === 'none') {
            // Hide all other sections
            Object.values(sections).forEach(id => {
                document.getElementById(id).style.display = 'none';
            });
            // Show the selected section
            sectionElement.style.display = 'block';
        } else {
            sectionElement.style.display = 'none';
        }
    }

    updateConfigurationStatus() {
        // TEI Header status
        const teiHeaderIcon = document.getElementById('teiHeaderIcon');
        const teiHeaderStatus = document.getElementById('teiHeaderStatus');
        if (this.teiHeader.title && this.teiHeader.title.trim() !== '') {
            teiHeaderIcon.classList.add('configured');
            teiHeaderStatus.innerHTML = '<i class="bi bi-check-circle-fill text-success" title="Configured"></i>';
        } else {
            teiHeaderIcon.classList.remove('configured');
            teiHeaderStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning" title="Not configured"></i>';
        }

        // Story config status
        const storyId = document.getElementById('storyid').value;
        const storyConfigIcon = document.getElementById('storyConfigIcon');
        const storyConfigStatus = document.getElementById('storyConfigStatus');
        if (storyId) {
            storyConfigIcon.classList.add('configured');
            storyConfigStatus.innerHTML = '<i class="bi bi-check-circle-fill text-success" title="Configured"></i>';
        } else {
            storyConfigIcon.classList.remove('configured');
            storyConfigStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning" title="Not configured"></i>';
        }

        // Ana schema status
        const anaSchemaIcon = document.getElementById('anaSchemaIcon');
        const anaSchemaStatus = document.getElementById('anaSchemaStatus');
        if (this.anaSchemas.length > 0) {
            anaSchemaIcon.classList.add('configured');
            anaSchemaStatus.innerHTML = '<i class="bi bi-check-circle-fill text-success" title="2 schemas configured"></i>';
        } else {
            anaSchemaIcon.classList.remove('configured');
            anaSchemaStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning" title="No schemas configured"></i>';
        }
    }

    saveTeiHeader() {
        this.updateTeiHeader();
        this.toggleConfigSection('teiHeader');
        this.updateConfigurationStatus();
        this.showAlert('TEI Header saved successfully!', 'success');
    }

    saveStoryConfig() {
        // Validate that Story ID is provided
        const storyId = document.getElementById('storyid').value.trim();
        if (!storyId) {
            this.showAlert('Please enter a Story ID before saving.', 'danger');
            return;
        }
        
        this.updateConfigurationStatus();
        this.toggleConfigSection('storyConfig');
        this.showAlert('Chapter setup saved successfully!', 'success');
        this.generateXML();
    }

    updateSchemaDisplay() {
        const schemasList = document.getElementById('schemasList');
        if (!schemasList) return;
        
        schemasList.innerHTML = this.anaSchemas.map((schema, index) => 
            `<div class="schema-summary mb-2">
                <strong>${schema.displayName}:</strong> ${schema.options.length} options
            </div>`
        ).join('');
    }

    showSchemaEditor() {
        document.getElementById('schemasEditor').style.display = 'block';
        document.getElementById('editSchemasBtn').style.display = 'none';
        
        // Generate dynamic editors for all schemas
        const container = document.getElementById('schemaEditorsContainer');
        container.innerHTML = '';
        
        this.anaSchemas.forEach((schema, index) => {
            const editorDiv = document.createElement('div');
            editorDiv.className = 'col-md-6 mb-3';
            
            const optionsText = schema.options.map(opt => 
                `${opt.value}|${opt.label}|${opt.description}`
            ).join('\n');
            
            editorDiv.innerHTML = `
                <div class="border rounded p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6>Schema ${index + 1}</h6>
                        ${this.anaSchemas.length > 2 ? `<button type="button" class="btn btn-sm btn-outline-danger" onclick="app.removeSchema(${index})"><i class="bi bi-trash"></i></button>` : ''}
                    </div>
                    <div class="mb-2">
                        <label class="form-label small">Display Name:</label>
                        <input type="text" id="schema${index}Name" class="form-control form-control-sm" value="${schema.displayName}">
                    </div>
                    <div class="mb-2">
                        <label class="form-label small">Options (value|label|description, one per line):</label>
                        <textarea id="schema${index}Options" class="form-control form-control-sm" rows="6" placeholder="value|label|description">${optionsText}</textarea>
                    </div>
                </div>
            `;
            
            container.appendChild(editorDiv);
        });
    }

    hideSchemaEditor() {
        document.getElementById('schemasEditor').style.display = 'none';
        document.getElementById('editSchemasBtn').style.display = 'block';
    }

    saveSchemas() {
        try {
            const newSchemas = [];
            
            // Parse all schemas dynamically
            this.anaSchemas.forEach((schema, index) => {
                const nameInput = document.getElementById(`schema${index}Name`);
                const optionsInput = document.getElementById(`schema${index}Options`);
                
                if (nameInput && optionsInput) {
                    const schemaName = nameInput.value.trim();
                    const schemaOptionsText = optionsInput.value.trim();
                    const schemaOptions = schemaOptionsText.split('\n').map(line => {
                        const parts = line.split('|');
                        return {
                            value: parts[0] ? parts[0].trim() : '',
                            label: parts[1] ? parts[1].trim() : parts[0] ? parts[0].trim() : '',
                            description: parts[2] ? parts[2].trim() : parts[1] ? parts[1].trim() : parts[0] ? parts[0].trim() : ''
                        };
                    }).filter(opt => opt.value || opt.label);

                    newSchemas.push({
                        id: schema.id,
                        displayName: schemaName || `Schema ${index + 1}`,
                        options: schemaOptions
                    });
                }
            });

            // Update schemas
            this.anaSchemas = newSchemas;

            this.updateSchemaDisplay();
            this.hideSchemaEditor();
            this.showAlert('Schema configuration saved successfully!', 'success');
            
            // Refresh any existing panels to use new schemas
            this.refreshPanelSchemas();
            
        } catch (error) {
            this.showAlert('Error saving schemas. Please check the format.', 'error');
        }
    }

    addNewSchema() {
        const newSchema = {
            id: `schema${this.anaSchemas.length + 1}`,
            displayName: `Schema ${this.anaSchemas.length + 1}`,
            options: [
                { value: '', label: `ana: Schema ${this.anaSchemas.length + 1}`, description: 'Schema label' }
            ]
        };
        
        this.anaSchemas.push(newSchema);
        this.updateSchemaDisplay();
        this.showAlert('New schema added! Click "Edit All" to configure it.', 'success');
        this.updateConfigurationStatus();
    }

    removeSchema(index) {
        if (index >= 2 && index < this.anaSchemas.length) {
            this.anaSchemas.splice(index, 1);
            this.showSchemaEditor(); // Refresh the editor display
        }
    }

    refreshPanelSchemas() {
        // Update all existing panel dropdowns with new schema options
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            const ana1Select = panel.querySelector('[id^="ana1_"]');
            const ana2Select = panel.querySelector('[id^="ana2_"]');
            
            if (ana1Select) {
                const currentValue = ana1Select.value;
                ana1Select.innerHTML = this.generateAnaOptions(0);
                ana1Select.value = currentValue;
            }
            
            if (ana2Select) {
                const currentValue = ana2Select.value;
                ana2Select.innerHTML = this.generateAnaOptions(1);
                ana2Select.value = currentValue;
            }
        });
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
                <i class="bi bi-trash3 text-muted remove-icon"></i>
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

        // Generate character checkboxes
        const characterCheckboxes = this.characters.map(char => 
            `<div class="form-check form-check-inline">
                <input class="form-check-input character-checkbox" type="checkbox" value="${char}" id="char_${panel.id}_${char.replace(/[^a-zA-Z0-9]/g, '_')}">
                <label class="form-check-label small-print" for="char_${panel.id}_${char.replace(/[^a-zA-Z0-9]/g, '_')}">${char}</label>
            </div>`
        ).join('');

        panel.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="panel-label me-3">Panel ${panelNumber}</div>
                <div class="element-attribute flex-grow-1">
                    <input type="text" id="panelAttributes_${panel.id}" class="form-control form-control-sm small-print" placeholder="Enter custom attributes">
                </div>
                <div class="panel-move-buttons ms-2">
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="app.movePanelUp('${panel.id}')" title="Move Up">
                        <i class="bi bi-arrow-up"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="app.movePanelDown('${panel.id}')" title="Move Down">
                        <i class="bi bi-arrow-down"></i>
                    </button>
                </div>
                <button class="btn btn-sm btn-outline-secondary ms-2" onclick="app.toggleCollapsePanel('${panel.id}')">
                    <i class="bi bi-chevron-up" id="chevron_panel_${panel.id}"></i>
                </button>
            </div>
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removePanel('${panel.id}')">
                <i class="bi bi-trash3 text-muted remove-icon"></i>
            </div>
            <div id="panelContent_${panel.id}" class="collapsible-content">
                <div class="row mt-3">
                    <div class="col-12 mb-2">
                        <label class="form-label small-print fw-bold">Characters</label>
                        <div id="characterDisplay_${panel.id}" class="character-display mb-2">
                            <div class="d-flex align-items-center">
                                <span id="characterList_${panel.id}" class="character-list me-2">None selected</span>
                                <button class="btn btn-outline-secondary btn-sm" onclick="app.toggleCharacterEditor('${panel.id}')">
                                    <i class="bi bi-pencil-square"></i> Edit
                                </button>
                            </div>
                        </div>
                        <div id="characterEditor_${panel.id}" class="character-editor" style="display: none;">
                            ${this.characters.length > 0 ? 
                                `<div class="character-checkboxes mb-2">${characterCheckboxes}</div>` : 
                                '<p class="text-muted small-print">No characters defined. <a href="#" onclick="app.showCharacterEditor()">Add characters</a></p>'
                            }
                            <input type="text" id="characters_${panel.id}" class="form-control form-control-sm small-print mb-2" placeholder="Additional characters (space-separated, e.g., #dog #cat)">
                            <div class="text-end">
                                <button class="btn btn-success btn-sm me-1" onclick="app.saveCharacterSelection('${panel.id}')">Save</button>
                                <button class="btn btn-secondary btn-sm" onclick="app.toggleCharacterEditor('${panel.id}')">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <input type="hidden" id="n_${panel.id}" value="${panelNumber}">
                    ${this.generateAnaDropdowns(panel.id)}
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
                    <button class="btn btn-outline-info btn-sm me-2" onclick="app.addSound(this)">
                        <i class="bi bi-volume-up me-1"></i>Sound
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="app.addCustomElement(this)">
                        <i class="bi bi-plus-circle me-1"></i>Custom Element
                    </button>
                </div>
            </div>
        `;

        panelContainer.getElementsByClassName('panelInnerContainer')[0].appendChild(panel);

        // Add event listeners for character checkboxes
        const checkboxes = panel.querySelectorAll('.character-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateCharacterDisplay(panel.id));
        });

        // Add event listeners for ana dropdowns
        const anaSelects = panel.querySelectorAll('[id^="ana"]');
        anaSelects.forEach(select => {
            select.addEventListener('change', () => this.generateXML());
        });

        // Add event listener for panel attributes input
        const panelAttributesInput = panel.querySelector(`#panelAttributes_${panel.id}`);
        if (panelAttributesInput) {
            panelAttributesInput.addEventListener('input', () => this.generateXML());
        }

        // Initialize character display
        this.updateCharacterDisplay(panel.id);
    }

    toggleCharacterEditor(panelId) {
        const display = document.getElementById(`characterDisplay_${panelId}`);
        const editor = document.getElementById(`characterEditor_${panelId}`);
        
        if (editor.style.display === 'none') {
            display.style.display = 'none';
            editor.style.display = 'block';
        } else {
            display.style.display = 'block';
            editor.style.display = 'none';
        }
    }

    saveCharacterSelection(panelId) {
        this.updateCharacterDisplay(panelId);
        this.toggleCharacterEditor(panelId);
    }

    updateCharacterDisplay(panelId) {
        const panel = document.getElementById(panelId);
        const checkedCharacters = Array.from(panel.querySelectorAll('.character-checkbox:checked')).map(cb => cb.value);
        const charactersInput = panel.querySelector(`#characters_${panelId}`);
        
        if (charactersInput) {
            // Remove checked characters from the text input to avoid duplicates
            const additionalCharacters = charactersInput.value.split(' ')
                .map(c => c.trim())
                .filter(c => c && !checkedCharacters.includes(c)); // Filter out duplicates
            
            // Update the text input to remove duplicates
            charactersInput.value = additionalCharacters.join(' ');
            
            // Combine all characters (no duplicates now)
            const allCharacters = [...checkedCharacters, ...additionalCharacters];
            
            const characterListSpan = document.getElementById(`characterList_${panelId}`);
            if (characterListSpan) {
                characterListSpan.textContent = allCharacters.length > 0 ? allCharacters.join(' ') : 'None selected';
            }
        }
        
        // Also update the old updateCharacterString for compatibility
        this.updateCharacterString(panelId);
    }

    toggleCharacterEditor(panelId) {
        const display = document.getElementById(`characterDisplay_${panelId}`);
        const editor = document.getElementById(`characterEditor_${panelId}`);
        
        if (editor.style.display === 'none') {
            display.style.display = 'none';
            editor.style.display = 'block';
        } else {
            display.style.display = 'block';
            editor.style.display = 'none';
        }
    }

    saveCharacterSelection(panelId) {
        this.updateCharacterDisplay(panelId);
        this.toggleCharacterEditor(panelId);
    }

    updateCharacterString(panelId) {
        const panel = document.getElementById(panelId);
        const checkboxes = panel.querySelectorAll('.character-checkbox:checked');
        const additionalInput = document.getElementById(`characters_${panelId}`);
        
        const checkedCharacters = Array.from(checkboxes).map(cb => cb.value);
        const additionalCharacters = additionalInput.value.split(' ').map(c => c.trim()).filter(c => c);
        
        const allCharacters = [...checkedCharacters, ...additionalCharacters];
        
        // Store the complete character string for XML generation (space-delimited)
        const charactersString = allCharacters.join(' ');
        
        // Store the complete character string for XML generation
        panel.dataset.charactersString = charactersString;
        
        this.generateXML();
    }

    generateAnaDropdowns(panelId) {
        const colClass = this.anaSchemas.length === 1 ? 'col-12' : 
                        this.anaSchemas.length === 2 ? 'col-md-6' : 
                        this.anaSchemas.length === 3 ? 'col-md-4' : 'col-md-3';
        
        return this.anaSchemas.map((schema, index) => 
            `<div class="${colClass}">
                <select id="ana${index + 1}_${panelId}" class="form-select form-select-sm small-print dropdown-select">
                    ${this.generateAnaOptions(index)}
                </select>
            </div>`
        ).join('');
    }

    generateAnaOptions(schemaIndex) {
        if (!this.anaSchemas[schemaIndex]) return '';
        
        const schema = this.anaSchemas[schemaIndex];
        return schema.options.map((option, index) => {
            if (index === 0) {
                // First option is selectable but in red to indicate selection needed
                return `<option value="" class="text-danger" style="color: red !important;">${option.label}</option>`;
            }
            return `<option value="${option.value}" title="${option.description}">${option.label}</option>`;
        }).join('');
    }

    movePanelUp(panelId) {
        const panel = document.getElementById(panelId);
        const previousPanel = panel.previousElementSibling;
        
        if (previousPanel && previousPanel.classList.contains('panel')) {
            panel.parentNode.insertBefore(panel, previousPanel);
            this.updatePanelNumbers(panel.closest('[id^="panelContainer_"]'));
            this.generateXML();
        }
    }

    movePanelDown(panelId) {
        const panel = document.getElementById(panelId);
        const nextPanel = panel.nextElementSibling;
        
        if (nextPanel && nextPanel.classList.contains('panel')) {
            panel.parentNode.insertBefore(nextPanel, panel);
            this.updatePanelNumbers(panel.closest('[id^="panelContainer_"]'));
            this.generateXML();
        }
    }

    updatePanelNumbers(panelContainer) {
        const panels = panelContainer.querySelectorAll('.panel');
        panels.forEach((panel, index) => {
            const panelNumber = index + 1;
            const label = panel.querySelector('.box-label > .panel-label');
            if (label) {
                label.textContent = `Panel ${panelNumber}`;
            }
            const nInput = panel.querySelector(`input[id^="n_"]`);
            if (nInput) {
                nInput.value = panelNumber;
            }
        });
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
        
        // Get characters from both checkboxes and additional input
        const checkedCharacters = Array.from(panel.querySelectorAll('.character-checkbox:checked')).map(cb => cb.value);
        const charactersInput = panel.querySelector(`#characters_${panel.id}`);
        const additionalCharacters = charactersInput.value.split(' ').map(c => c.trim()).filter(c => c);
        const characterList = [...checkedCharacters, ...additionalCharacters];

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
                <i class="bi bi-trash3 text-muted remove-icon"></i>
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
                <i class="bi bi-trash3 text-muted remove-icon"></i>
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

    addSound(button) {
        const panel = button.closest('.panel');
        const elementsDiv = panel.querySelector('.elements');
        const sound = document.createElement("div");
        sound.className = "sound bg-white p-3 mb-3 border rounded shadow-sm";
        
        sound.innerHTML = `
            <div class="box-label element-container d-flex align-items-center">
                <div class="sound-label me-3">Sound</div>
                <div class="element-attribute flex-grow-1">
                    <input type="text" class="form-control form-control-sm small-print" placeholder="Enter custom attributes">
                </div>
            </div>
            <div class="remove position-absolute top-0 end-0 p-2" onclick="app.removeElement(this)">
                <i class="bi bi-trash3 text-muted remove-icon"></i>
            </div>
            <div class="mt-3">
                <textarea class="form-control form-control-sm small-print" rows="2" placeholder="Sound text, e.g., SPLASH!!"></textarea>
            </div>
        `;

        elementsDiv.appendChild(sound);

        // Add event listeners
        const inputs = sound.querySelectorAll('input, textarea');
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
                <i class="bi bi-trash3 text-muted remove-icon"></i>
            </div>
            <div class="mt-3">
                <textarea class="form-control form-control-sm small-print" rows="2" placeholder="Custom XML element, e.g. &lt;note&gt;Author's note&lt;/note&gt;"></textarea>
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

        const prefix = `<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:cbml="http://www.cbml.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>${this.teiHeader.title}</title>
        <author>${this.teiHeader.author}</author>
        <respStmt xml:id="${this.teiHeader.encoderId}">
          <persName>${this.teiHeader.encoder}</persName>
          <resp>encoder</resp>
        </respStmt>
      </titleStmt>
      <publicationStmt>
        <p>Unpublished</p>
      </publicationStmt>
      <sourceDesc>
        <p>${this.teiHeader.sourceDesc}</p>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>`;
        const suffix = `</body>
  </text>
</TEI>`;
        const blob = new Blob([prefix + xmlContent + suffix], { type: 'application/xml' });
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

    loadXML() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(e.target.result, 'application/xml');
                        this.parseAndLoadXML(xmlDoc);
                    } catch (error) {
                        this.showAlert('Error parsing XML file. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    parseAndLoadXML(xmlDoc) {
        console.log('Starting XML parsing...');
        console.log('XML Document:', xmlDoc);
        
        // Show the interface sections
        document.getElementById('fileChoiceSection').style.display = 'none';
        document.getElementById('configurationHeader').style.display = 'block';
        document.getElementById('teiHeaderSection').style.display = 'block';
        document.getElementById('storyConfigSection').style.display = 'block';
        document.getElementById('anaSchemaSection').style.display = 'none';
        document.getElementById('addPanelGrpSection').style.display = 'block';
        document.getElementById('downloadTeiBtn').style.display = 'inline-block';
        
        // Extract TEI header information from the loaded XML (keep editing enabled)
        this.extractTeiHeaderFromXML(xmlDoc);
        
        // Initialize schema display
        this.updateSchemaDisplay();
        
        // Clear existing content
        const panelGrpContainer = document.getElementById("panelGrpContainer");
        panelGrpContainer.innerHTML = '';
        
        // Reset counters
        this.panelGrpCount = 1;
        this.panelCount = 0;

        // Find the chapter - handle both TEI and standalone formats
        console.log('Looking for chapter...');
        let chapter = xmlDoc.querySelector('div[type="chapter"]');
        console.log('Direct chapter search result:', chapter);
        
        // If not found directly, try looking inside TEI structure
        if (!chapter) {
            console.log('No direct chapter found, searching within TEI structure...');
            const teiBody = xmlDoc.querySelector('TEI text body, text body, body');
            console.log('TEI body found:', teiBody);
            if (teiBody) {
                chapter = teiBody.querySelector('div[type="chapter"]');
                console.log('Chapter found in TEI body:', chapter);
            }
        }
        
        if (!chapter) {
            console.error('No chapter found in XML file.');
            this.showAlert('No chapter found in XML file. Please ensure the XML contains a div with type="chapter".', 'warning');
            return;
        }

        console.log('Chapter found:', chapter);
        console.log('Chapter ID:', chapter.getAttribute('id'));

        // Set story ID
        const storyId = chapter.getAttribute('id');
        if (storyId) {
            document.getElementById('storyid').value = storyId;
            console.log('Story ID set to:', storyId);
        }

        // Extract characters from all panels and create character list
        console.log('Extracting characters from panels...');
        const allCharacters = new Set();
        
        // Helper function to get panels regardless of namespace
        const getPanels = (element) => {
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
                    console.log(`Found ${found.length} panels with selector: ${selector}`);
                    panels = panels.concat(Array.from(found));
                }
            }
            
            return panels.filter((panel, index, self) => 
                self.findIndex(p => p === panel) === index
            );
        };
        
        const panels = getPanels(chapter);
        console.log('Total panels found:', panels.length);
        panels.forEach(panel => {
            const characters = panel.getAttribute('characters');
            if (characters) {
                characters.split(' ').forEach(char => {
                    const trimmed = char.trim();
                    if (trimmed && trimmed.startsWith('#')) {
                        allCharacters.add(trimmed);
                    }
                });
            }
        });
        this.characters = Array.from(allCharacters);
        this.updateCharacterButton();

        // Load panel groups
        const panelGrps = chapter.querySelectorAll('div[type="panelGrp"]');
        console.log('Panel groups found:', panelGrps.length);
        
        panelGrps.forEach((panelGrp, index) => {
            console.log(`Processing panel group ${index + 1}:`, panelGrp);
            console.log(`Panel group ID: ${panelGrp.getAttribute('id')}`);
            
            this.addPanelGrp();
            
            // Get the created panel group
            const createdPanelGrp = document.getElementById(`panelGrp_${this.panelGrpCount - 1}`);
            console.log('Created panel group:', createdPanelGrp);
            
            // Set panel group attributes
            const attributesInput = createdPanelGrp.querySelector(`#panelGrpAttributes_panelGrp_${this.panelGrpCount - 1}`);
            
            // Extract custom attributes (exclude type and id)
            const attrs = Array.from(panelGrp.attributes)
                .filter(attr => attr.name !== 'type' && attr.name !== 'id')
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(' ');
            if (attributesInput && attrs) {
                attributesInput.value = attrs;
                console.log('Set panel group attributes:', attrs);
            }

            // Load panels
            const panels = getPanels(panelGrp);
            console.log(`Panels in this group: ${panels.length}`);
            panels.forEach((panel, panelIndex) => {
                console.log(`Processing panel ${panelIndex + 1} in group ${index + 1}:`, panel);
                
                this.addPanel(`panelGrp_${this.panelGrpCount - 1}`);
                
                // Get the created panel
                const createdPanel = createdPanelGrp.querySelector(`.panel:last-child`);
                const panelId = createdPanel.id;
                console.log('Created panel with ID:', panelId);
                
                // Set panel attributes
                const characters = panel.getAttribute('characters') || '';
                const n = panel.getAttribute('n') || '';
                const ana = panel.getAttribute('ana') || '';
                
                console.log(`Panel attributes - characters: "${characters}", n: "${n}", ana: "${ana}"`);
                
                // Parse ana attribute for transition and attentional framing
                const anaTokens = ana.split(' ').filter(token => token.trim());
                const transitionTags = ['#moment-to-moment', '#action-to-action', '#subject-to-subject', '#scene-to-scene', '#aspect-to-aspect', '#non-sequitur'];
                const framingTags = ['#macro', '#mono', '#micro', '#amorphic'];
                
                let ana1 = '';
                let ana2 = '';
                const otherAnaValues = [];
                
                anaTokens.forEach(token => {
                    if (transitionTags.includes(token)) {
                        ana1 = token;
                    } else if (framingTags.includes(token)) {
                        ana2 = token;
                    } else {
                        // Collect any other ana values that don't match the standard categories
                        otherAnaValues.push(token);
                    }
                });

                // Set form values
                document.getElementById(`characters_${panelId}`).value = characters;
                if (document.getElementById(`n_${panelId}`)) {
                    document.getElementById(`n_${panelId}`).value = n;
                }
                document.getElementById(`ana1_${panelId}`).value = ana1;
                document.getElementById(`ana2_${panelId}`).value = ana2;
                
                // Set additional ana values if they exist
                if (otherAnaValues.length > 0) {
                    otherAnaValues.forEach((anaValue, index) => {
                        const anaSelect = document.getElementById(`ana${index + 3}_${panelId}`);
                        if (anaSelect) {
                            anaSelect.value = anaValue;
                        }
                    });
                }
                
                // Set panel custom attributes
                const panelAttrs = Array.from(panel.attributes)
                    .filter(attr => !['ana', 'characters', 'n'].includes(attr.name))
                    .map(attr => `${attr.name}="${attr.value}"`)
                    .join(' ');
                if (panelAttrs) {
                    document.getElementById(`panelAttributes_${panelId}`).value = panelAttrs;
                }

                // Check character checkboxes based on loaded characters
                if (characters) {
                    const characterTokens = characters.split(' ').map(c => c.trim()).filter(c => c);
                    characterTokens.forEach(character => {
                        const checkbox = createdPanel.querySelector(`input[value="${character}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                }

                // Update character display to reflect loaded data
                this.updateCharacterDisplay(panelId);

                // Load balloons and captions
                const balloons = panel.querySelectorAll('cbml\\:balloon, balloon');
                balloons.forEach(balloon => {
                    this.addBalloon(createdPanel.querySelector('.element-buttons button'));
                    const balloonElement = createdPanel.querySelector('.balloon:last-child');
                    
                    const who = balloon.getAttribute('who') || '';
                    const type = balloon.getAttribute('type') || 'speech';
                    const text = balloon.textContent.trim();
                    
                    balloonElement.querySelector('select').value = who;
                    balloonElement.querySelectorAll('select')[1].value = type;
                    balloonElement.querySelector('textarea').value = text;
                    
                    // Set balloon custom attributes
                    const balloonAttrs = Array.from(balloon.attributes)
                        .filter(attr => !['who', 'type'].includes(attr.name))
                        .map(attr => `${attr.name}="${attr.value}"`)
                        .join(' ');
                    if (balloonAttrs) {
                        balloonElement.querySelector('.element-attribute input').value = balloonAttrs;
                    }
                });

                const captions = panel.querySelectorAll('cbml\\:caption, caption');
                captions.forEach(caption => {
                    this.addCaption(createdPanel.querySelector('.element-buttons button[onclick*="addCaption"]'));
                    const captionElement = createdPanel.querySelector('.caption:last-child');
                    
                    const text = caption.textContent.trim();
                    captionElement.querySelector('textarea').value = text;
                    
                    // Set caption custom attributes
                    const captionAttrs = Array.from(caption.attributes)
                        .map(attr => `${attr.name}="${attr.value}"`)
                        .join(' ');
                    if (captionAttrs) {
                        captionElement.querySelector('.element-attribute input').value = captionAttrs;
                    }
                });

                const sounds = panel.querySelectorAll('cbml\\:sound, sound');
                sounds.forEach(sound => {
                    this.addSound(createdPanel.querySelector('.element-buttons button[onclick*="addSound"]'));
                    const soundElement = createdPanel.querySelector('.sound:last-child');
                    
                    const text = sound.textContent.trim();
                    soundElement.querySelector('textarea').value = text;
                    
                    // Set sound custom attributes
                    const soundAttrs = Array.from(sound.attributes)
                        .map(attr => `${attr.name}="${attr.value}"`)
                        .join(' ');
                    if (soundAttrs) {
                        soundElement.querySelector('.element-attribute input').value = soundAttrs;
                    }
                });

                // Load other elements as custom elements
                const otherElements = Array.from(panel.childNodes).filter(node => 
                    node.nodeType === Node.ELEMENT_NODE && 
                    !node.tagName.includes('balloon') && 
                    !node.tagName.includes('caption') &&
                    !node.tagName.includes('sound')
                );
                
                otherElements.forEach(element => {
                    this.addCustomElement(createdPanel.querySelector('.element-buttons button[onclick*="addCustomElement"]'));
                    const customElement = createdPanel.querySelector('.custom-element:last-child');
                    customElement.querySelector('textarea').value = element.outerHTML;
                });
            });
        });

        this.generateXML();
        this.showAlert('XML file loaded successfully!', 'success');
    }

    generateXML() {
        const storyid = document.getElementById("storyid").value;
        if (!storyid) {
            return;
        }

        const panelGrpContainer = document.getElementById("panelGrpContainer");
        const panelGrps = panelGrpContainer.getElementsByClassName("panelGrp");
        let xmlOutput = `<div type="chapter" id="${storyid}">`;

        for (let i = 0; i < panelGrps.length; i++) {
            const panelGrp = panelGrps[i];
            const panelGrpAttributes = panelGrp.querySelector(`#panelGrpAttributes_${panelGrp.id}`).value;
            let space = panelGrpAttributes ? ' ' : '';
            xmlOutput += `\n  <div type="panelGrp" id="${storyid}_${i + 1}"${space}${panelGrpAttributes}>`;

            const panels = panelGrp.querySelectorAll(".panel");
            for (let j = 0; j < panels.length; j++) {
                const panel = panels[j];
                
                // Get characters from checkboxes and additional input
                const checkedCharacters = Array.from(panel.querySelectorAll('.character-checkbox:checked')).map(cb => cb.value);
                const additionalCharacters = panel.querySelector(`#characters_${panel.id}`).value.split(' ').map(c => c.trim()).filter(c => c);
                const allCharacters = [...checkedCharacters, ...additionalCharacters].join(' ');
                
                const n = panel.querySelector(`#n_${panel.id}`).value;
                
                // Collect all ana values dynamically
                const anaValues = this.anaSchemas.map((schema, index) => {
                    const anaSelect = panel.querySelector(`#ana${index + 1}_${panel.id}`);
                    return anaSelect ? anaSelect.value : '';
                }).filter(value => value).join(' ');
                
                const panelAttributes = panel.querySelector(`#panelAttributes_${panel.id}`).value;
                let space = panelAttributes ? ' ' : '';
                xmlOutput += `\n    <cbml:panel ana="${anaValues}" characters="${allCharacters}" n="${n}"${space}${panelAttributes}>`;

                const elements = panel.getElementsByClassName("elements")[0].children;
                for (let k = 0; k < elements.length; k++) {
                    const element = elements[k];
                    if (element.className.includes("balloon")) {
                        const who = element.querySelector("select").value;
                        const text = element.querySelector("textarea").value;
                        const balloonType = element.querySelectorAll("select")[1].value;
                        const balloonAttributes = element.querySelector(".element-attribute input").value;
                        let space = balloonAttributes ? ' ' : '';
                        xmlOutput += `\n      <cbml:balloon type="${balloonType}" who="${who}"${space}${balloonAttributes}>${text}</cbml:balloon>`;
                    } else if (element.className.includes("caption")) {
                        const text = element.querySelector("textarea").value;
                        const captionAttributes = element.querySelector(".element-attribute input").value;
                        let space = captionAttributes ? ' ' : '';
                        xmlOutput += `\n      <cbml:caption${space}${captionAttributes}>${text}</cbml:caption>`;
                    } else if (element.className.includes("sound")) {
                        const text = element.querySelector("textarea").value;
                        const soundAttributes = element.querySelector(".element-attribute input").value;
                        let space = soundAttributes ? ' ' : '';
                        xmlOutput += `\n      <cbml:sound${space}${soundAttributes}>${text}</cbml:sound>`;
                    } else if (element.className.includes("custom-element")) {
                        const text = element.querySelector("textarea").value;
                        xmlOutput += `\n      ${text}`;
                    }
                }

                xmlOutput += `\n    </cbml:panel>`;
            }

            xmlOutput += `\n  </div>`;
        }

        xmlOutput += `\n</div>`;
        const codeElement = document.getElementById("output").querySelector("code");
        codeElement.textContent = xmlOutput;
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

    extractTeiHeaderFromXML(xmlDoc) {
        console.log('Extracting TEI header information...');
        
        // Try to find TEI header elements
        const teiHeader = xmlDoc.querySelector('teiHeader');
        
        if (teiHeader) {
            // Extract title
            const titleStmt = teiHeader.querySelector('titleStmt title');
            const title = titleStmt ? titleStmt.textContent.trim() : '';
            
            // Extract author
            const authorEl = teiHeader.querySelector('titleStmt author');
            const author = authorEl ? authorEl.textContent.trim() : '';
            
            // Extract encoder information
            const respStmt = teiHeader.querySelector('titleStmt respStmt');
            let encoder = '';
            let encoderId = '';
            
            if (respStmt) {
                // Get encoder name from persName element
                const persNameEl = respStmt.querySelector('persName');
                if (persNameEl) {
                    encoder = persNameEl.textContent.trim();
                }
                // Get encoder ID from xml:id attribute of respStmt
                encoderId = respStmt.getAttribute('xml:id') || '';
            }
            
            // Extract source description
            const sourceDesc = teiHeader.querySelector('sourceDesc p');
            const sourceDescText = sourceDesc ? sourceDesc.textContent.trim() : '';
            
            // Update the TEI header object only if values were found
            if (title) {
                this.teiHeader.title = title;
                document.getElementById('teiTitle').value = title;
            }
            if (author) {
                this.teiHeader.author = author;
                document.getElementById('teiAuthor').value = author;
            }
            if (encoder) {
                this.teiHeader.encoder = encoder;
                document.getElementById('teiEncoder').value = encoder;
            }
            if (encoderId) {
                this.teiHeader.encoderId = encoderId;
                document.getElementById('teiEncoderId').value = encoderId;
            }
            if (sourceDescText) {
                this.teiHeader.sourceDesc = sourceDescText;
                document.getElementById('teiSourceDesc').value = sourceDescText;
            }
            
            console.log('Extracted TEI header:', this.teiHeader);
        } else {
            console.log('No TEI header found in XML, trying to extract basic information...');
            // If no TEI header is found, try to extract basic information from document structure
            const title = xmlDoc.querySelector('title');
            if (title) {
                this.teiHeader.title = title.textContent.trim();
                document.getElementById('teiTitle').value = this.teiHeader.title;
                console.log('Found title in document:', this.teiHeader.title);
            }
        }
        
        // Update the TEI header object and status
        this.updateTeiHeader();
        this.updateConfigurationStatus();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CBMLApp();
});
