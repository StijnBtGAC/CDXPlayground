// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

/// <summary>
/// Test page for the drag and drop control.
/// Use this to test the control add-in independently.
/// </summary>
page 50005 "DA Drag Drop Test"
{
    PageType = Card;
    ApplicationArea = All;
    UsageCategory = Administration;
    Caption = 'Drag & Drop Test Page';

    layout
    {
        area(Content)
        {
            group(Instructions)
            {
                Caption = 'Test Instructions';
                field(Instruction1; 'Open browser console (F12) to see debug messages')
                {
                    ApplicationArea = All;
                    Editable = false;
                    ShowCaption = false;
                }
                field(Instruction2; 'The control should appear below with a blue dashed border')
                {
                    ApplicationArea = All;
                    Editable = false;
                    ShowCaption = false;
                }
                field(Instruction3; 'Try dropping a file or clicking to browse')
                {
                    ApplicationArea = All;
                    Editable = false;
                    ShowCaption = false;
                }
            }

            group(ControlArea)
            {
                Caption = 'Drag & Drop Control';

                usercontrol(TestControl; "DA Drag Drop Control")
                {
                    ApplicationArea = All;

                    trigger OnFilesDropped(FileName: Text; FileContent: Text)
                    begin
                        Message('SUCCESS! File dropped: %1\\Content length: %2 characters', FileName, StrLen(FileContent));
                    end;

                    trigger OnError(ErrorMessage: Text)
                    begin
                        Message('ERROR: %1', ErrorMessage);
                    end;

                    trigger ControlAddInReady()
                    begin
                        Message('Control add-in ready! Calling Initialize()...');
                        CurrPage.TestControl.Initialize();
                        Message('Initialize() completed');
                    end;
                }
            }

            group(Status)
            {
                Caption = 'Status';
                field(StatusMsg; 'If you see messages above, the control is working!')
                {
                    ApplicationArea = All;
                    Editable = false;
                    ShowCaption = false;
                }
            }
        }
    }
}
