// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

console.log('DADragDropControl main script loaded');

var DADragDropControl = {
    factboxContainer: null,
    dropZone: null,
    messageElement: null,
    filesCount: 0,
    isInitialized: false,
    isFactboxMode: false,
    originalBorder: '',
    originalBackground: '',

    /**
     * Initialize drag and drop - works in both factbox and standalone mode
     * This is called from AL after ControlAddInReady
     */
    Initialize: function() {
        console.log('Initialize() called');
        var self = this;

        if (self.isInitialized) {
            console.log('Already initialized');
            return;
        }

        try {
            // Try to find a factbox container first
            var parentDoc = window.parent.document;
            var iframes = parentDoc.querySelectorAll('iframe');
            console.log('Found', iframes.length, 'iframes in parent document');
            
            // Find the iframe that contains our control
            var ourIframe = null;
            for (var i = 0; i < iframes.length; i++) {
                try {
                    if (iframes[i].contentWindow === window) {
                        ourIframe = iframes[i];
                        console.log('Found our iframe at index', i);
                        break;
                    }
                } catch(e) {
                    // Cross-origin iframe, skip
                }
            }
            
            if (ourIframe) {
                // Walk up to find a parent with 'Document Attachment' in its control name
                var current = ourIframe.parentElement;
                var attempts = 0;
                while (current && attempts < 10) {
                    if (current.getAttribute && current.getAttribute('controlname')) {
                        var controlName = current.getAttribute('controlname');
                        console.log('Found control:', controlName);
                        // Check if this looks like a Document Attachment factbox
                        if (controlName.toLowerCase().indexOf('document') >= 0 || 
                            controlName.toLowerCase().indexOf('attachment') >= 0) {
                            self.factboxContainer = current;
                            self.isFactboxMode = true;
                            console.log('Detected factbox mode - will attach to parent container');
                            break;
                        }
                    }
                    current = current.parentElement;
                    attempts++;
                }
            }
            
            // Decide which mode to use
            if (self.isFactboxMode && self.factboxContainer) {
                // Factbox mode: attach to parent container
                console.log('Using factbox mode');
                self.originalBorder = self.factboxContainer.style.border;
                self.originalBackground = self.factboxContainer.style.background;
                self.setupFactboxDragDrop();
            } else {
                // Standalone mode: create visible drop zone
                console.log('Using standalone mode - creating visible drop zone');
                self.setupStandaloneDragDrop();
            }
            
            self.isInitialized = true;
            console.log('Drag and drop initialized successfully');
            
        } catch(e) {
            console.error('Error during initialization:', e);
        }
    },

    /**
     * Set up drag and drop for factbox mode (invisible control, parent attachment)
     */
    setupFactboxDragDrop: function() {
        var self = this;
        console.log('Setting up factbox drag and drop listeners');

        // Declare these at function scope so highlight/unhighlight can access them
        var hintBanner, icon, text;

        var preventDefaults = function(e) {
            e.preventDefault();
            e.stopPropagation();
        };

        var highlight = function(e) {
            preventDefaults(e);
            self.factboxContainer.style.border = '3px solid #0078d4';
            self.factboxContainer.style.background = 'linear-gradient(135deg, #e6f3ff 0%, #cce5ff 100%)';
            // Update hint banner during drag
            if (hintBanner) {
                hintBanner.style.background = '#0078d4';
                hintBanner.style.borderColor = '#005a9e';
                hintBanner.style.color = '#ffffff';
                text.textContent = 'Drop files now!';
                // Change icon color to white
                icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M11 15H13V9H16L12 4L8 9H11V15Z" fill="#ffffff"/>' +
                    '<path d="M20 18H4V11H2V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V11H20V18Z" fill="#ffffff"/>' +
                    '</svg>';
            }
        };

        var unhighlight = function(e) {
            preventDefaults(e);
            self.factboxContainer.style.border = self.originalBorder;
            self.factboxContainer.style.background = self.originalBackground;
            // Reset hint banner
            if (hintBanner) {
                hintBanner.style.background = 'linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%)';
                hintBanner.style.borderColor = '#0078d4';
                hintBanner.style.color = '#323130';
                text.textContent = 'Drop files here or click to browse';
                // Reset icon color
                icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<path d="M11 15H13V9H16L12 4L8 9H11V15Z" fill="#0078d4"/>' +
                    '<path d="M20 18H4V11H2V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V11H20V18Z" fill="#0078d4"/>' +
                    '</svg>';
            }
        };

        var handleDrop = function(e) {
            preventDefaults(e);
            unhighlight(e);
            
            var files = e.dataTransfer.files;
            console.log('Files dropped:', files.length);
            
            if (files.length > 0) {
                self.handleFiles(files);
            }
        };

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
            self.factboxContainer.addEventListener(eventName, preventDefaults, false);
            window.parent.document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight on drag enter/over
        ['dragenter', 'dragover'].forEach(function(eventName) {
            self.factboxContainer.addEventListener(eventName, highlight, false);
        });

        // Unhighlight on drag leave/drop
        ['dragleave', 'drop'].forEach(function(eventName) {
            self.factboxContainer.addEventListener(eventName, unhighlight, false);
        });

        // Handle drop
        self.factboxContainer.addEventListener('drop', handleDrop, false);
        
        // Add visible hint banner at the top
        hintBanner = window.parent.document.createElement('div');
        hintBanner.style.cssText = 'position: relative; width: 100%; padding: 8px 12px; ' +
            'background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%); ' +
            'border: 1px dashed #0078d4; border-radius: 4px; ' +
            'display: flex; align-items: center; gap: 8px; cursor: pointer; ' +
            'font-size: 12px; color: #323130; margin-bottom: 4px; ' +
            'transition: all 0.2s ease; box-sizing: border-box;';
        
        // Add upload icon SVG
        icon = window.parent.document.createElement('span');
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M11 15H13V9H16L12 4L8 9H11V15Z" fill="#0078d4"/>' +
            '<path d="M20 18H4V11H2V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V11H20V18Z" fill="#0078d4"/>' +
            '</svg>';
        icon.style.cssText = 'display: flex; flex-shrink: 0; line-height: 0;';
        
        text = window.parent.document.createElement('span');
        text.textContent = 'Drop files here or click to browse';
        text.style.cssText = 'flex: 1; user-select: none;';
        
        hintBanner.appendChild(icon);
        hintBanner.appendChild(text);
        
        // Hover effect
        hintBanner.addEventListener('mouseenter', function() {
            hintBanner.style.background = 'linear-gradient(135deg, #e6f3ff 0%, #cce5ff 100%)';
            hintBanner.style.borderColor = '#005a9e';
        });
        hintBanner.addEventListener('mouseleave', function() {
            hintBanner.style.background = 'linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%)';
            hintBanner.style.borderColor = '#0078d4';
        });
        
        // Click to browse
        hintBanner.addEventListener('click', function() {
            self.triggerFileBrowse();
        });
        
        // Insert at the top of the factbox
        self.factboxContainer.style.position = 'relative';
        self.factboxContainer.insertBefore(hintBanner, self.factboxContainer.firstChild);

        console.log('Factbox drag and drop ready');
    },

    /**
     * Set up drag and drop for standalone mode (visible drop zone)
     */
    setupStandaloneDragDrop: function() {
        var self = this;
        console.log('Setting up standalone drag and drop');

        // Ensure html and body take full space
        document.documentElement.style.height = '100%';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';

        // Create visible drop zone
        self.dropZone = document.createElement('div');
        self.dropZone.className = 'drag-drop-zone';
        self.dropZone.id = 'dragDropZone';
        
        // Add inline styles to ensure visibility even if CSS doesn't load
        self.dropZone.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'border: 3px dashed #0078d4; border-radius: 12px; ' +
            'background: linear-gradient(135deg, #f3f9ff 0%, #e6f3ff 100%); ' +
            'display: flex; flex-direction: column; align-items: center; justify-content: center; ' +
            'cursor: pointer; box-sizing: border-box; padding: 15px; text-align: center; ' +
            'box-shadow: 0 2px 8px rgba(0, 120, 212, 0.1);';

        // Create SVG icon
        var icon = document.createElement('div');
        icon.className = 'drop-icon';
        icon.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M11 15H13V9H16L12 4L8 9H11V15Z" fill="#0078d4"/>' +
            '<path d="M20 18H4V11H2V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V11H20V18Z" fill="#0078d4"/>' +
            '</svg>';

        // Create message
        self.messageElement = document.createElement('div');
        self.messageElement.className = 'drop-message';
        self.messageElement.innerHTML = '<strong>Drop files here</strong> or click to browse';
        self.messageElement.style.cssText = 'font-size: 16px; color: #323130; margin-bottom: 4px; z-index: 1;';

        // Create secondary message
        var secondaryMessage = document.createElement('div');
        secondaryMessage.className = 'drop-secondary-message';
        secondaryMessage.textContent = 'Maximum file size: 150MB';
        secondaryMessage.style.cssText = 'font-size: 12px; color: #605e5c; z-index: 1;';

        // Assemble UI
        self.dropZone.appendChild(icon);
        self.dropZone.appendChild(self.messageElement);
        self.dropZone.appendChild(secondaryMessage);

        // Add to page
        document.body.appendChild(self.dropZone);
        console.log('Drop zone created and added to page');
        console.log('Drop zone element:', self.dropZone);
        console.log('Drop zone computed style:', window.getComputedStyle(self.dropZone));

        // Set up event listeners
        var preventDefaults = function(e) {
            e.preventDefault();
            e.stopPropagation();
        };

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
            self.dropZone.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight on drag enter/over
        ['dragenter', 'dragover'].forEach(function(eventName) {
            self.dropZone.addEventListener(eventName, function(e) {
                preventDefaults(e);
                self.dropZone.classList.add('drag-over');
            }, false);
        });

        // Unhighlight on drag leave/drop
        ['dragleave', 'drop'].forEach(function(eventName) {
            self.dropZone.addEventListener(eventName, function(e) {
                preventDefaults(e);
                if (e.target === self.dropZone || eventName === 'drop') {
                    self.dropZone.classList.remove('drag-over');
                }
            }, false);
        });

        // Handle drop
        self.dropZone.addEventListener('drop', function(e) {
            preventDefaults(e);
            var files = e.dataTransfer.files;
            console.log('Files dropped:', files.length);
            if (files.length > 0) {
                self.handleFiles(files);
            }
        }, false);

        // Handle click to browse
        self.dropZone.addEventListener('click', function() {
            self.triggerFileBrowse();
        });

        console.log('Standalone drag and drop ready');
    },

    /**
     * Trigger file browse dialog
     */
    triggerFileBrowse: function() {
        var self = this;
        console.log('Opening file browser');
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.onchange = function(e) {
            var files = e.target.files;
            console.log('Files selected via browse:', files.length);
            if (files.length > 0) {
                self.handleFiles(files);
            }
        };
        fileInput.click();
    },

    /**
     * Handle dropped/selected files
     */
    handleFiles: function(files) {
        var self = this;
        self.filesCount = files.length;
        console.log('Processing', self.filesCount, 'files');
        
        for (var i = 0; i < files.length; i++) {
            self.uploadFile(files[i], i);
        }
    },

    /**
     * Upload a single file
     */
    uploadFile: function(file, index) {
        var self = this;
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Index:', index);

        // Check file size (150MB limit)
        var maxSize = 150 * 1024 * 1024;
        if (file.size > maxSize) {
            console.error('File too large:', file.name);
            Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnError', 
                ['File "' + file.name + '" exceeds maximum size of 150MB']);
            return;
        }

        var reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                var dataUrl = e.target.result; // This includes the data:type;base64, prefix
                var isLastFile = (index === self.filesCount - 1);
                
                console.log('File loaded:', file.name);
                console.log('Data URL length:', dataUrl.length);
                console.log('Data URL prefix:', dataUrl.substring(0, 50));
                console.log('Invoking OnFilesDropped');
                
                // Send to AL code (AL will strip the data: prefix)
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnFilesDropped', 
                    [file.name, dataUrl]);
                    
                console.log('OnFilesDropped invoked successfully');
            } catch(error) {
                console.error('Error processing file:', error);
                Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnError', 
                    ['Error processing file: ' + error.message]);
            }
        };

        reader.onerror = function() {
            console.error('Failed to read file:', file.name);
            Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('OnError', 
                ['Failed to read file: ' + file.name]);
        };

        // Read as Data URL (includes the base64 prefix)
        reader.readAsDataURL(file);
    },

    /**
     * Update message - works in both modes
     */
    UpdateMessage: function(message) {
        console.log('UpdateMessage:', message);
        if (this.messageElement) {
            this.messageElement.innerHTML = '<strong>' + message + '</strong>';
        }
    },

    /**
     * Set enabled/disabled state - works in both modes
     */
    SetEnabled: function(isEnabled) {
        console.log('SetEnabled:', isEnabled);
        if (this.isFactboxMode && this.factboxContainer) {
            // Factbox mode
            if (isEnabled) {
                this.factboxContainer.style.opacity = '1';
                this.factboxContainer.style.pointerEvents = 'auto';
            } else {
                this.factboxContainer.style.opacity = '0.5';
                this.factboxContainer.style.pointerEvents = 'none';
            }
        } else if (this.dropZone) {
            // Standalone mode
            if (isEnabled) {
                this.dropZone.classList.remove('disabled');
                if (this.messageElement) {
                    this.messageElement.innerHTML = '<strong>Drop files here</strong> or click to browse';
                }
            } else {
                this.dropZone.classList.add('disabled');
                if (this.messageElement) {
                    this.messageElement.innerHTML = '<strong>Drop zone disabled</strong>';
                }
            }
        }
    }
};

// Expose functions globally so BC can call them via CurrPage.ControlName.FunctionName()
window.Initialize = function() {
    console.log('Global Initialize() wrapper called');
    DADragDropControl.Initialize();
};

window.UpdateMessage = function(message) {
    console.log('Global UpdateMessage() wrapper called');
    DADragDropControl.UpdateMessage(message);
};

window.SetEnabled = function(isEnabled) {
    console.log('Global SetEnabled() wrapper called');
    DADragDropControl.SetEnabled(isEnabled);
};

console.log('DADragDropControl script ready');
