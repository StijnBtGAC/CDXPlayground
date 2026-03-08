// ------------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
// ------------------------------------------------------------------------------------------------

/// <summary>
/// Control add-in that provides drag and drop functionality for file uploads
/// to Document Attachment factboxes.
/// </summary>
controladdin "DA Drag Drop Control"
{
    RequestedHeight = 35;
    MinimumHeight = 35;
    MaximumHeight = 35;
    HorizontalStretch = true;
    VerticalStretch = false;
    VerticalShrink = true;

    Scripts = 'src\DocumentAttachmentIntegration\Scripts\DADragDropControl.js';
    StyleSheets = 'src\DocumentAttachmentIntegration\Styles\DADragDropControl.css';
    StartupScript = 'src\DocumentAttachmentIntegration\Scripts\DADragDropStartup.js';

    /// <summary>
    /// Event triggered when files are dropped on the control.
    /// </summary>
    /// <param name="FileName">The name of the file.</param>
    /// <param name="FileContent">The base64 encoded content of the file.</param>
    event OnFilesDropped(FileName: Text; FileContent: Text);

    /// <summary>
    /// Event triggered when an error occurs during file processing.
    /// </summary>
    /// <param name="ErrorMessage">The error message.</param>
    event OnError(ErrorMessage: Text);

    /// <summary>
    /// Event triggered when the control add-in is ready.
    /// </summary>
    event ControlAddInReady();

    /// <summary>
    /// Procedure to initialize the control.
    /// </summary>
    procedure Initialize();

    /// <summary>
    /// Procedure to update the drop zone message.
    /// </summary>
    /// <param name="Message">The message to display.</param>
    procedure UpdateMessage(Message: Text);

    /// <summary>
    /// Procedure to set enabled/disabled state.
    /// </summary>
    /// <param name="IsEnabled">Whether the control is enabled.</param>
    procedure SetEnabled(IsEnabled: Boolean);
}
