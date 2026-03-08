# Drag & Drop Control - Troubleshooting Guide

## Current Status

The drag & drop control has been completely rewritten with extensive debugging and diagnostics.

## What Was Fixed

### 1. File Path Issues
- **Changed paths from forward slashes to backslashes**: `src\DocumentAttachmentIntegration\...`
- **Added StartupScript**: Creates a visible element immediately when the control loads
- **Improved path handling**: All paths are now relative to the workspace root

### 2. JavaScript Issues
- **Complete rewrite**: Simpler, more robust initialization
- **Extensive console logging**: Every action is logged to the browser console
- **Startup script**: Creates a visible "Loading..." message immediately
- **Better error handling**: All errors are caught and logged

### 3. Visual Improvements
- **Immediate visibility**: The control creates a visible element on startup
- **Debug messages**: AL code now shows messages at each step

## Testing Steps

### Step 1: Test on the Test Page

1. **Open the test page**: Search for "Drag & Drop Test Page" in Business Central
2. **You should see**:
   - Instructions at the top
   - A message "Control add-in ready!" when it loads
   - A blue dashed border box (the drag & drop area)
   - Another message "Initialize() completed"

3. **Open browser console** (Press F12):
   - Look for console messages like:
     - "DADragDropControl startup script loaded"
     - "DADragDropControl main script loading..."
     - "Control element found..."
     - "Initialization complete"

4. **Try dropping a file**:
   - You should see "SUCCESS! File dropped..." message
   - Console will log: "drop event", "Processing file:", etc.

### Step 2: Check the Customer Card

1. Open a Customer Card (e.g., customer 10000)
2. Click on the "Attachments (0)" tab
3. Look for the drag & drop area at the top
4. You should see messages:
   - "Control add-in is ready!"
   - "Initialize() called"

## Debugging Checklist

### If you see a blank rectangle:

- [ ] **Open browser console (F12)** - Do you see ANY JavaScript console messages?
  - If NO: The JavaScript files are not loading
  - If YES: What messages do you see?

- [ ] **Check for errors in the console**
  - Look for red error messages
  - Screenshot and share them

- [ ] **Test on the standalone test page first** (Page 50005)
  - This isolates the control from the factbox complexity

### If you see "Loading drag & drop..." but nothing else:

- The startup script loaded but the main script didn't initialize
- Check console for errors
- The ControlAddInReady event might not be firing

### If files don't trigger events:

- [ ] **Check console when dropping file** - Do you see "drop event" logged?
  - If YES: JavaScript works, but AL event isn't firing
  - If NO: Event listeners aren't attached

- [ ] **Try clicking the area** instead of dropping
  - Does the file browser open?
  - Can you select a file that way?

## Console Commands for Debugging

Open browser console (F12) and try these:

```javascript
// Check if the control object exists
console.log(DADragDropControl);

// Check if it's initialized
console.log('Initialized:', DADragDropControl.isInitialized);

// Check if the drop zone element exists
console.log('Drop zone:', DADragDropControl.dropZone);

// Manually trigger initialization
DADragDropControl.Initialize();
```

## Common Issues and Solutions

### Issue: "controlAddInId is not defined"
**Solution**: The BC environment isn't ready yet. This is normal during initial load.

### Issue: No console messages at all
**Solution**: 
1. Check if the extension is properly deployed
2. Verify the JavaScript files are in the correct location
3. Try uninstalling and reinstalling the extension

### Issue: Control shows but events don't fire
**Solution**:
1. Check if `Microsoft.Dynamics.NAV` is available in console
2. Try the test page instead of the factbox
3. Check AL code debugging messages

### Issue: "Loading drag & drop..." never changes
**Solution**:
1. The ControlAddInReady event isn't firing
2. Check if AL code shows "Control add-in is ready!" message
3. The Initialize() method might not be getting called

## Files to Check

1. **JavaScript location**: `src\DocumentAttachmentIntegration\Scripts\DADragDropControl.js`
2. **Startup script**: `src\DocumentAttachmentIntegration\Scripts\DADragDropStartup.js`
3. **CSS location**: `src\DocumentAttachmentIntegration\Styles\DADragDropControl.css`
4. **Control definition**: `src\DocumentAttachmentIntegration\DADragDropControl.ControlAddin.al`

## What to Share for Support

If it still doesn't work, provide:

1. **Browser console output** (F12 → Console tab)
   - Copy all messages including errors
   
2. **Screenshots showing**:
   - The page with the blank/broken control
   - The browser console messages
   - Any AL messages that appeared

3. **Test results**:
   - Does the test page (50005) work?
   - Does the Customer Card factbox show the control?
   - Do you see ANY messages (AL or JavaScript)?

## Next Steps

1. **Rebuild the extension**: Ctrl+Shift+B in VS Code
2. **Test on the test page first** (Page 50005)
3. **Share console output** if it still doesn't work
