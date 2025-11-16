import * as vscode from "vscode";
import { encode, decode } from "@toon-format/toon";
import { getWebviewContent } from "./webview";

let panel: vscode.WebviewPanel | undefined;
let disposables: vscode.Disposable[] = [];

export function registerPreviewCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("toon.openPreview", openPreview)
  );
}

function openPreview() {
  if (panel) {
    panel.reveal();
    updatePreview();
    return;
  }

  panel = vscode.window.createWebviewPanel(
    "toonPreview",
    "TOON Preview",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  panel.webview.html = getWebviewContent();

  panel.webview.onDidReceiveMessage(
    (msg) => {
      if (msg.type === "updateJson") {
        handleJsonEdit(msg.json);
      }
    },
    null,
    disposables
  );

  panel.onDidDispose(() => {
    panel = undefined;
    disposables.forEach((d) => d.dispose());
    disposables = [];
  });

  disposables.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      const active = vscode.window.activeTextEditor;
      if (!panel || !active) return;
      if (e.document.uri.toString() !== active.document.uri.toString()) return;
      updatePreview(e.document);
    })
  );

  disposables.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!panel || !editor) return;
      updatePreview(editor.document);
    })
  );

  updatePreview();
}

function updatePreview(doc?: vscode.TextDocument) {
  if (!panel) return;

  if (!doc) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    doc = editor.document;
  }

  const text = doc.getText();
  let jsonView = "";
  let toonView = "";
  let error = "";

  const isJson = doc.languageId === "json" || doc.fileName.endsWith(".json");
  const isToon = doc.languageId === "toon" || doc.fileName.endsWith(".toon");

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

  panel.webview.postMessage({ json: jsonView, toon: toonView, error });
}

function handleJsonEdit(jsonText: string) {
  if (!panel) return;

  let toonView = "";
  let error = "";

  try {
    const value = JSON.parse(jsonText);
    toonView = encode(value);
  } catch (err: any) {
    error = err?.message ?? String(err);
  }

  panel.webview.postMessage({ json: jsonText, toon: toonView, error });
}
