# Drag & Drop Document Attachments

This extension adds drag & drop functionality for document attachments in Business Central.

## Components

### 1. Control Add-in: `DA Drag Drop Control`
- **File**: `DADragDropControl.ControlAddin.al`
- **Purpose**: Provides the HTML5 drag & drop interface
- **Features**:
  - Drag files from desktop/folder to the control
  - Click to browse and select files
  - Visual feedback during drag operations
  - File size validation (150MB limit per BC constraints)
  - Base64 encoding for transfer to AL code

### 2. Page Extension: `Doc. Attach. Factbox Ext.` (50004)
- **File**: `DocAttachFactboxExt.PageExt.al`  
- **Extends**: Page 1178 "Document Attachment Factbox"
- **Purpose**: Adds drag & drop control directly to the standard factbox
- **Benefit**: Automatically available wherever the standard factbox is used

### 3. Page: `Doc. Attach. Drag Drop` (50003)
- **File**: `DocAttachFactboxDragDrop.PageExt.al`  
- **Type**: CardPart (can be used as factbox or page part)
- **Purpose**: Standalone container page for the drag & drop control
- **Use Case**: For custom pages or when you want a separate drag & drop area

### 4. Codeunit: `DA Drag Drop Helper` (50003)
- **File**: `DADragDropHelper.Codeunit.al`
- **Purpose**: Handles file processing and document attachment creation
- **Key Method**: `UploadFile(...)` - Creates document attachment records from uploaded files

## Usage

### Option 1: Automatic (Recommended)

The drag & drop control is **automatically added** to the standard "Document Attachment Factbox" (page 1178) through the page extension. This means:

✅ **It works everywhere** the standard factbox is used (Sales Orders, Purchase Orders, Items, Customers, etc.)  
✅ **No additional code needed** - just compile and deploy  
✅ **Drag & drop appears at the top** of the existing attachment list  

Simply use the factbox as you normally would, and the drag & drop zone will be visible at the top.

### Option 2: Custom Integration

To add a separate drag & drop control to your custom pages:

1. **Extend your target page** with the drag & drop factbox:

```al
pageextension 50011 "Sales Order with Drag Drop" extends "Sales Order"
{
    layout
    {
        addfirst(factboxes)
        {
            part(DragDropAttachments; "Doc. Attach. Drag Drop")
            {
                ApplicationArea = All;
                Caption = 'Drop Files Here';
            }
        }
    }

    trigger OnAfterGetCurrRecord()
    begin
        UpdateDragDropContext();
    end;

    local procedure UpdateDragDropContext()
    begin
        CurrPage.DragDropAttachments.PAGE.SetContext(
            DATABASE::"Sales Header", 
            Rec."No.", 
            Rec."Document Type".AsInteger(), 
            0  // 0 for header-level attachments
        );
    end;
}
```

2. **For different entity types**, adjust the SetContext parameters:

**Sales/Purchase Documents:**
```al
CurrPage.DragDropAttachments.PAGE.SetContext(
    DATABASE::"Sales Header",     // or DATABASE::"Purchase Header"
    Rec."No.", 
    Rec."Document Type".AsInteger(), 
    0
);
```

**Item Card:**
```al
CurrPage.DragDropAttachments.PAGE.SetContext(
    DATABASE::Item, 
    Rec."No.", 
    0,   // No document type
    0    // No line number
);
```

**Customer/Vendor Card:**
```al
CurrPage.DragDropAttachments.PAGE.SetContext(
    DATABASE::Customer,  // or DATABASE::Vendor
    Rec."No.", 
    0, 
    0
);
```

### Dependencies

This extension requires the **Base Application** dependency to extend the standard Document Attachment Factbox:

```json
"dependencies": [
  {
    "id": "437dbf0e-84ff-417a-965d-ed2bb9650972",
    "name": "Base Application",
    "publisher": "Microsoft",
    "version": "28.0.0.0"
  }
]
```

This dependency is already configured in [app.json](app.json).

## How It Works

### Automatic Integration

The page extension [DocAttachFactboxExt.PageExt.al](src/DocumentAttachmentIntegration/DocAttachFactboxExt.PageExt.al) extends page 1178 and:

1. **Adds the drag & drop control** at the top of the factbox
2. **Captures context automatically** from the current record displayed in the factbox
3. **Creates attachments** with the correct parent record information
4. **Refreshes the list** to show newly uploaded files

This works on **all pages** that use the standard factbox:
- Sales documents (Quote, Order, Invoice, Credit Memo, etc.)
- Purchase documents
- Item cards
- Customer/Vendor cards
- And any other entity that supports document attachments

### User Workflow

1. Navigate to any page with the Document Attachment Factbox visible
2. The drag & drop zone appears at the top of the factbox
3. Drag files from Windows Explorer onto the blue zone, or click to browse
4. Files are automatically attached to the current record
5. The attachment list refreshes to show the new files

## Features

```al
pageextension 50012 "Enhanced Sales Order" extends "Sales Order"
{
    layout
    {
        addfirst(factboxes)
        {
            // Add drag & drop control first
            part(DragDropFiles; "Doc. Attach. Drag Drop")
            {
                ApplicationArea = All;
                Caption = 'Drop Files Here';
            }
            
            // Standard factbox shows existing attachments
            // (If not already present, add it)
        }
    }

    trigger OnAfterGetCurrRecord()
    begin
        CurrPage.DragDropFiles.PAGE.SetContext(
            DATABASE::"Sales Header", 
            Rec."No.", 
            Rec."Document Type".AsInteger(), 
            0
        );
    end;
}
```

## Features

### User Experience
- **Drag files** from Windows Explorer directly onto the control
- **Click the control** to open a file browser dialog
- **Multiple files** can be uploaded in one operation
- **Visual feedback** with color changes during drag operations
- **Success messages** confirm each file upload

### Technical Features
- Base64 encoding for secure file transfer
- File size validation (150MB limit)
- Proper integration with BC Document Attachment system
- Support for all document attachment scenarios (sales, purchase, items, etc.)
- Support for header and line level attachments

### Styling
The control uses Microsoft-inspired colors:
- Default: Light blue background (#f3f9ff) with blue dashed border
- Hover: Darker blue background (#e6f3ff)
- Drag over: Solid border with bright blue (#cce5ff)
- Disabled: Gray with reduced opacity

## File Structure

```
src/DocumentAttachmentIntegration/
├── DADragDropControl.ControlAddin.al       # Control add-in definition
├── DocAttachFactboxExt.PageExt.al          # Extension of standard factbox (page 1178)
├── DocAttachFactboxDragDrop.PageExt.al     # Standalone page for custom use
├── DADragDropHelper.Codeunit.al            # File upload logic
├── ExampleIntegration.PageExt.al           # Example for custom integration
├── Scripts/
│   └── DADragDropControl.js                # JavaScript drag & drop logic
└── Styles/
    └── DADragDropControl.css               # Visual styling
```

## Technical Details

### Page Extension Strategy

The extension uses **page 1178 by ID** rather than by name:
```al
pageextension 50004 "Doc. Attach. Factbox Ext." extends 1178
```

This ensures compatibility across different localizations where the page name might vary.

### Context Management

When a record is displayed in the factbox, the extension captures:
- **Table ID**: Which table the attachment belongs to
- **No.**: The record identifier
- **Document Type**: For sales/purchase documents
- **Line No.**: For line-level attachments (0 for header)

These values are stored and used when files are dropped, ensuring attachments are created with the correct parent record reference.

## Notes

- Files are stored in the standard Document Attachment table
- Integrates seamlessly with external storage features (if configured)
- Respects BC's standard security and permissions for document attachments
- Works in both Web Client and Modern clients that support control add-ins

## Support

For issues or questions, refer to the main extension documentation or Business Central AL documentation for control add-ins and document attachments.
