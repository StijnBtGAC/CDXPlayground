// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

// Startup script - notify AL that we're ready
console.log('DADragDropControl startup script loaded');

// Check if main object loaded and initialize
if (typeof DADragDropControl !== 'undefined') {
    // Try calling Initialize directly to ensure it works
    try {
        DADragDropControl.Initialize();
    } catch(e) {
        console.error('Initialize failed:', e);
    }
} else {
    console.error('DADragDropControl object NOT found!');
}

try {
    Microsoft.Dynamics.NAV.InvokeExtensibilityMethod('ControlAddInReady', []);
    console.log('ControlAddInReady invoked');
} catch(e) {
    console.error('Error invoking ControlAddInReady:', e);
}
