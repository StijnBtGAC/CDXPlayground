// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

/// <summary>
/// Helper codeunit for drag and drop document attachment functionality.
/// Handles the file upload and attachment creation process.
/// </summary>
codeunit 50003 "DA Drag Drop Helper"
{
    Access = Public;

    /// <summary>
    /// Uploads a file and creates a document attachment record.
    /// </summary>
    /// <param name="TableID">The Table ID of the parent record.</param>
    /// <param name="DocNo">The No. of the parent record.</param>
    /// <param name="DocumentType">The Document Type enum value.</param>
    /// <param name="LineNo">The Line No. (0 for header-level attachments).</param>
    /// <param name="FileName">The name of the file being uploaded.</param>
    /// <param name="FileContent">The base64 encoded content of the file.</param>
    procedure UploadFile(TableID: Integer; DocNo: Code[20]; DocumentType: Integer; LineNo: Integer; FileName: Text; FileContent: Text)
    var
        DocumentAttachment: Record "Document Attachment";
        DocumentAttachmentMgmt: Codeunit "Document Attachment Mgmt";
        TempBlob: Codeunit "Temp Blob";
        InStr: InStream;
        OutStr: OutStream;
        RecRef: RecordRef;
        SuccessMsg: Label '%1 has been attached successfully.', Comment = '%1 = file name';
        NoRecordSelectedMsg: Label 'Please select a record before attaching files.';
        ErrorAttachingMsg: Label 'An error occurred while attaching the file: %1', Comment = '%1 = error message';
    begin
        // Validate input
        if TableID = 0 then begin
            Message(NoRecordSelectedMsg);
            exit;
        end;

        if FileName = '' then
            exit;

        if FileContent = '' then
            exit;

        // Strip data URL prefix if present (e.g., "data:image/png;base64,ABC123")
        if FileContent.Contains(',') then begin
            // IndexOf is 1-based in AL, so +1 gets position right after the comma
            FileContent := CopyStr(FileContent, FileContent.IndexOf(',') + 1);
        end;

        // Convert base64 to blob with error handling
        TempBlob.CreateOutStream(OutStr);
        if not TryConvertBase64(FileContent, OutStr) then begin
            Message(ErrorAttachingMsg, GetLastErrorText());
            exit;
        end;
        TempBlob.CreateInStream(InStr);

        // Create a temporary document attachment record with key fields to get the parent RecRef
        // This mimics the factbox record that GetRefTable expects
        Clear(DocumentAttachment);
        DocumentAttachment."Table ID" := TableID;
        DocumentAttachment."No." := DocNo;
        DocumentAttachment."Document Type" := Enum::"Attachment Document Type".FromInteger(DocumentType);
        DocumentAttachment."Line No." := LineNo;

        // Get RecordRef to the parent record (e.g., Customer, Vendor, etc.)
        if not DocumentAttachmentMgmt.GetRefTable(RecRef, DocumentAttachment) then begin
            Message(ErrorAttachingMsg, 'Unable to find parent record');
            exit;
        end;

        // Create a new document attachment and save using the standard method
        Clear(DocumentAttachment);
        DocumentAttachment.Init();
        DocumentAttachment.Validate("Table ID", TableID);
        DocumentAttachment.Validate("No.", DocNo);
        DocumentAttachment."Document Type" := Enum::"Attachment Document Type".FromInteger(DocumentType);
        DocumentAttachment.Validate("Line No.", LineNo);
        
        // Save the attachment using the standard method (pass full filename, not just extension)
        DocumentAttachment.SaveAttachmentFromStream(InStr, RecRef, FileName);
        DocumentAttachment.Modify(true);

        Message(SuccessMsg, FileName);
    end;

    [TryFunction]
    local procedure TryConvertBase64(Base64Text: Text; var OutStr: OutStream)
    var
        Base64Convert: Codeunit "Base64 Convert";
    begin
        Base64Convert.FromBase64(Base64Text, OutStr);
    end;
}
