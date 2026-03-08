// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

/// <summary>
/// Standalone page with drag and drop functionality for document attachments.
/// Can be used as a factbox or embedded part in pages that support document attachments.
/// </summary>
page 50003 "Doc. Attach. Drag Drop"
{
    PageType = CardPart;
    ApplicationArea = All;
    UsageCategory = None;
    Caption = 'Drag & Drop Files';

    layout
    {
        area(Content)
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
                    Message(ErrorMessage);
                end;
            }
        }
    }

    var
        ContextTableID: Integer;
        ContextNo: Code[20];
        ContextDocumentType: Integer;
        ContextLineNo: Integer;

    /// <summary>
    /// Sets the context for the document attachment (which record to attach files to).
    /// </summary>
    /// <param name="TableID">The Table ID of the parent record.</param>
    /// <param name="DocNo">The No. of the parent record.</param>
    /// <param name="DocumentType">The Document Type enum value.</param>
    /// <param name="LineNo">The Line No. (0 for header-level attachments).</param>
    procedure SetContext(TableID: Integer; DocNo: Code[20]; DocumentType: Integer; LineNo: Integer)
    begin
        ContextTableID := TableID;
        ContextNo := DocNo;
        ContextDocumentType := DocumentType;
        ContextLineNo := LineNo;
    end;

    local procedure HandleFileUpload(FileName: Text; FileContent: Text)
    var
        DADragDropHelper: Codeunit "DA Drag Drop Helper";
    begin
        DADragDropHelper.UploadFile(ContextTableID, ContextNo, ContextDocumentType, ContextLineNo, FileName, FileContent);
    end;
}
