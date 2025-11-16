import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem;

export function registerStatusBar(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.tooltip = "TOON Tools: File size and estimated tokens";
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBar)
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && e.document === editor.document) {
        updateStatusBar();
      }
    })
  );

  updateStatusBar();
}

function updateStatusBar() {
  const editor = vscode.window.activeTextEditor;
  
  if (!editor) {
    statusBarItem.hide();
    return;
  }

  const doc = editor.document;
  const isToon = doc.fileName.endsWith(".toon");
  const isJson = doc.fileName.endsWith(".json");

  if (!isToon && !isJson) {
    statusBarItem.hide();
    return;
  }

  const text = doc.getText();
  const bytes = new TextEncoder().encode(text).length;
  const tokens = estimateTokens(text);
  const lines = doc.lineCount;

  const icon = isToon ? "$(file-code)" : "$(json)";
  statusBarItem.text = `${icon} ${formatBytes(bytes)} • ${tokens} tokens • ${lines} lines`;
  statusBarItem.show();
}

function estimateTokens(text: string): number {
  // Simple token estimation: ~4 characters per token (GPT-style)
  return Math.ceil(text.length / 4);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}
