import * as vscode from "vscode";
import { encode, decode } from "@toon-format/toon";

let previewPanel: vscode.WebviewPanel | undefined;
let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
  // JSON -> TOON
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "toon.jsonToToon",
      async (editor) => {
        await convertJsonToToon(editor);
      }
    )
  );

  // TOON -> JSON
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "toon.toonToJson",
      async (editor) => {
        await convertToonToJson(editor);
      }
    )
  );

  // Live preview
  context.subscriptions.push(
    vscode.commands.registerCommand("toon.openPreview", () => {
      openPreview();
    })
  );
}

export function deactivate() {
  disposables.forEach((d) => d.dispose());
  disposables = [];
  previewPanel?.dispose();
}

/**
 * Get selected text or full document text + the range to replace.
 */
function getTargetTextAndRange(editor: vscode.TextEditor): {
  text: string;
  range: vscode.Range;
  isSelection: boolean;
} {
  const doc = editor.document;
  const selection = editor.selection;

  if (!selection.isEmpty) {
    return {
      text: doc.getText(selection),
      range: selection,
      isSelection: true
    };
  }

  const fullRange = new vscode.Range(
    new vscode.Position(0, 0),
    doc.lineAt(doc.lineCount - 1).range.end
  );

  return {
    text: doc.getText(fullRange),
    range: fullRange,
    isSelection: false
  };
}

async function convertJsonToToon(editor: vscode.TextEditor) {
  const { text, range } = getTargetTextAndRange(editor);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `JSON → TOON: invalid JSON: ${err?.message ?? String(err)}`
    );
    return;
  }

  let toon: string;
  try {
    toon = encode(parsed);
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `JSON → TOON: encode failed: ${err?.message ?? String(err)}`
    );
    return;
  }

  await editor.edit((builder) => {
    builder.replace(range, toon);
  });
}

async function convertToonToJson(editor: vscode.TextEditor) {
  const { text, range } = getTargetTextAndRange(editor);

  let value: unknown;
  try {
    value = decode(text); // TOON -> JS value
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `TOON → JSON: decode failed: ${err?.message ?? String(err)}`
    );
    return;
  }

  const json = JSON.stringify(value, null, 2);

  await editor.edit((builder) => {
    builder.replace(range, json);
  });
}

/* -------------------- Live Preview -------------------- */

function openPreview() {
  if (previewPanel) {
    previewPanel.reveal();
    updatePreviewForActiveEditor();
    return;
  }

  previewPanel = vscode.window.createWebviewPanel(
    "toonPreview",
    "TOON Preview",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true
    }
  );

  previewPanel.webview.html = getWebviewHtml();

  previewPanel.onDidDispose(
    () => {
      previewPanel = undefined;
    },
    null,
    disposables
  );

  // React to text changes
  disposables.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const active = vscode.window.activeTextEditor;
      if (!previewPanel || !active) return;
      if (event.document.uri.toString() !== active.document.uri.toString()) {
        return;
      }
      updatePreviewForDocument(event.document);
    })
  );

  // React to active editor changes
  disposables.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!previewPanel || !editor) return;
      updatePreviewForDocument(editor.document);
    })
  );

  updatePreviewForActiveEditor();
}

function updatePreviewForActiveEditor() {
  const editor = vscode.window.activeTextEditor;
  if (!previewPanel || !editor) return;
  updatePreviewForDocument(editor.document);
}

function updatePreviewForDocument(doc: vscode.TextDocument) {
  if (!previewPanel) return;

  const text = doc.getText();
  let jsonView = "";
  let toonView = "";
  let error = "";

  const isJson =
    doc.languageId === "json" || doc.fileName.toLowerCase().endsWith(".json");
  const isToon =
    doc.languageId === "toon" || doc.fileName.toLowerCase().endsWith(".toon");

  try {
    if (isJson) {
      const value = JSON.parse(text);
      jsonView = JSON.stringify(value, null, 2);
      toonView = encode(value);
    } else if (isToon) {
      const value = decode(text);
      jsonView = JSON.stringify(value, null, 2);
      toonView = encode(value);
    } else {
      // Try JSON, then TOON
      try {
        const value = JSON.parse(text);
        jsonView = JSON.stringify(value, null, 2);
        toonView = encode(value);
      } catch {
        const value = decode(text);
        jsonView = JSON.stringify(value, null, 2);
        toonView = encode(value);
      }
    }
  } catch (err: any) {
    error = err?.message ?? String(err);
  }

  previewPanel.webview.postMessage({
    json: jsonView,
    toon: toonView,
    error
  });
}

function getWebviewHtml(): string {
  const css = `
    body {
      font-family: var(--vscode-editor-font-family, monospace);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      margin: 0;
      padding: 0;
    }
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: 100vh;
    }
    .pane {
      border-left: 1px solid var(--vscode-editorGroup-border);
      padding: 8px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .pane:first-child {
      border-left: none;
    }
    h2 {
      margin: 0 0 4px;
      font-size: 12px;
      text-transform: uppercase;
      color: var(--vscode-editor-foreground);
      opacity: 0.7;
    }
    pre {
      margin: 0;
      padding: 4px;
      white-space: pre;
      overflow: auto;
      font-family: inherit;
      font-size: 12px;
      background: rgba(255,255,255,0.02);
      border-radius: 4px;
      flex: 1;
    }
    .error {
      color: var(--vscode-errorForeground);
      font-size: 11px;
      margin: 4px 8px;
      white-space: pre-wrap;
    }
  `;

  const script = `
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', (event) => {
      const { json, toon, error } = event.data;
      const jsonEl = document.getElementById('json');
      const toonEl = document.getElementById('toon');
      const errorEl = document.getElementById('error');
      if (jsonEl) jsonEl.textContent = json || '';
      if (toonEl) toonEl.textContent = toon || '';
      if (errorEl) errorEl.textContent = error || '';
    });
  `;

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <style>${css}</style>
    </head>
    <body>
      <div class="container">
        <div class="pane">
          <h2>JSON</h2>
          <pre id="json"></pre>
        </div>
        <div class="pane">
          <h2>TOON</h2>
          <pre id="toon"></pre>
        </div>
      </div>
      <div id="error" class="error"></div>
      <script>${script}</script>
    </body>
    </html>
  `;
}
