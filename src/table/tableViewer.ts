import * as vscode from "vscode";
import { decode } from "@toon-format/toon";
import { getTableViewerContent } from "./tableViewerWebview";

let panel: vscode.WebviewPanel | undefined;

export function registerTableViewerCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("toon.openTableViewer", openTableViewer)
  );
}

function openTableViewer() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  if (panel) {
    panel.reveal();
  } else {
    panel = vscode.window.createWebviewPanel(
      "toonTable",
      "TOON Table Viewer",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    panel.onDidDispose(() => {
      panel = undefined;
    });
  }

  panel.webview.html = getTableViewerContent();
  updateTableView(editor.document);
}

function updateTableView(doc: vscode.TextDocument) {
  if (!panel) return;

  const text = doc.getText();
  let data: any;
  let error = "";

  try {
    if (doc.fileName.endsWith(".json")) {
      data = JSON.parse(text);
    } else {
      data = decode(text);
    }

    const tables = extractTables(data);
    panel.webview.postMessage({ tables, error: "" });
  } catch (err: any) {
    error = err?.message ?? String(err);
    panel.webview.postMessage({ tables: [], error });
  }
}

function extractTables(data: any, path: string = ""): any[] {
  const tables: any[] = [];

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    tables.push({
      name: path || "Root Array",
      data: data,
    });
  } else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      const value = data[key];
      const newPath = path ? `${path}.${key}` : key;

      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        tables.push({
          name: newPath,
          data: value,
        });
      } else if (typeof value === "object" && value !== null) {
        tables.push(...extractTables(value, newPath));
      }
    }
  }

  return tables;
}
