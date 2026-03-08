// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

/// <summary>
/// Extends the standard Document Attachment Factbox (page 1178) with drag and drop functionality.
/// Adds a drag and drop control at the top of the factbox for easy file uploads.
/// </summary>
pageextension 50004 "Doc. Attach. Factbox Ext." extends "Doc. Attachment List Factbox" // Document Attachment Factbox
{
    layout
    {
        addfirst(content)
        {
            usercontrol(DragDropControl; "DA Drag Drop Control")
            {
                ApplicationArea = All;

                trigger OnFilesDropped(FileName: Text; FileContent: Text)
                begin
                    HandleFileUpload(FileName, FileContent);
                end;

                trigger OnError(ErrorMessage: Text)
                begin
                    Message('Error: %1', ErrorMessage);
                end;

                trigger ControlAddInReady()
                begin
                    ControlIsReady := true;
                    CurrPage.DragDropControl.Initialize();
                end;
            }
        }
    }

    var
        ContextTableID: Integer;
        ContextNo: Code[20];
        ContextDocumentType: Integer;
        ContextLineNo: Integer;
        ControlIsReady: Boolean;

    trigger OnAfterGetRecord()
    begin
        // Capture the context from the current record for file uploads
        if Rec."Table ID" <> 0 then begin
            ContextTableID := Rec."Table ID";
            ContextNo := Rec."No.";
            ContextDocumentType := Rec."Document Type".AsInteger();
            ContextLineNo := Rec."Line No.";
        end;
    end;

    trigger OnAfterGetCurrRecord()
    begin
        // Try to capture context from current record
        if Rec."Table ID" <> 0 then begin
            ContextTableID := Rec."Table ID";
            ContextNo := Rec."No.";
            ContextDocumentType := Rec."Document Type".AsInteger();
            ContextLineNo := Rec."Line No.";
        end;
    end;

    trigger OnOpenPage()
    begin
        // Capture context from filters on open (important when factbox is empty)
        TryGetContextFromFilters();
    end;

    local procedure HandleFileUpload(FileName: Text; FileContent: Text)
    var
        DADragDropHelper: Codeunit "DA Drag Drop Helper";
        DocumentAttachment: Record "Document Attachment";
    begin
        // If no context captured yet, try to get it from the page filters
        if ContextTableID = 0 then
            TryGetContextFromFilters();

        // Use the captured context for the upload
        DADragDropHelper.UploadFile(ContextTableID, ContextNo, ContextDocumentType, ContextLineNo, FileName, FileContent);

        // Refresh the page to show the new attachment
        CurrPage.Update(true);
    end;

    local procedure TryGetContextFromFilters()
    var
        FilterText: Text;
    begin
        // Try to get context from the page filters
        if Rec.GetFilter("Table ID") <> '' then
            Evaluate(ContextTableID, Rec.GetFilter("Table ID"));
        if Rec.GetFilter("No.") <> '' then begin
            FilterText := Rec.GetFilter("No.");
            // Remove quotes and CONST() wrapper if present
            FilterText := DelChr(FilterText, '=', '''');
            if FilterText.StartsWith('CONST(') then
                FilterText := CopyStr(FilterText, 7, StrLen(FilterText) - 7);
            ContextNo := CopyStr(FilterText, 1, MaxStrLen(ContextNo));
        end;
        if Rec.GetFilter("Document Type") <> '' then
            Evaluate(ContextDocumentType, Rec.GetFilter("Document Type"));
    end;
}
