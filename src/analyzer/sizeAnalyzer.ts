import * as vscode from "vscode";
import { encode, decode } from "@toon-format/toon";

export function registerAnalyzerCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("toon.analyzeSize", analyzeSize)
  );
}

function analyzeSize() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const text = editor.document.getText();
  const fileName = editor.document.fileName;

  try {
    let jsonText: string;
    let toonText: string;

    if (fileName.endsWith(".json")) {
      const value = JSON.parse(text);
      jsonText = JSON.stringify(value);
      toonText = encode(value);
    } else {
      const value = decode(text);
      jsonText = JSON.stringify(value);
      toonText = encode(value);
    }

    const jsonSize = new TextEncoder().encode(jsonText).length;
    const toonSize = new TextEncoder().encode(toonText).length;
    const jsonTokens = estimateTokens(jsonText);
    const toonTokens = estimateTokens(toonText);
    
    const sizeDiff = jsonSize - toonSize;
    const tokenDiff = jsonTokens - toonTokens;
    const compressionRatio = ((1 - toonSize / jsonSize) * 100).toFixed(1);

    const panel = vscode.window.createWebviewPanel(
      "toonAnalyzer",
      "TOON Size Analysis",
      vscode.ViewColumn.Beside,
      { enableScripts: false }
    );

    panel.webview.html = getAnalyzerContent({
      jsonSize,
      toonSize,
      jsonTokens,
      toonTokens,
      sizeDiff,
      tokenDiff,
      compressionRatio,
    });
  } catch (err: any) {
    vscode.window.showErrorMessage(`Analysis failed: ${err?.message}`);
  }
}

function estimateTokens(text: string): number {
  // Simple token estimation: ~4 characters per token (GPT-style)
  return Math.ceil(text.length / 4);
}

function getAnalyzerContent(stats: any): string {
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getDiffColor = (diff: number) => {
    return diff > 0 ? "var(--vscode-charts-green)" : "var(--vscode-charts-red)";
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-editor-foreground);
      background-color: var(--vscode-editor-background);
      margin: 0;
      padding: 24px;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 24px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 16px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 600;
    }
    .stat-sub {
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }
    .comparison {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .comparison h2 {
      font-size: 14px;
      margin-bottom: 12px;
      color: var(--vscode-editor-foreground);
    }
    .comparison-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .comparison-row:last-child {
      border-bottom: none;
    }
    .highlight {
      font-weight: 600;
      font-size: 18px;
      text-align: center;
      padding: 16px;
      background: rgba(0,255,0,0.1);
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <h1>📊 Format Analysis</h1>
  
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-label">JSON Size</div>
      <div class="stat-value">${formatBytes(stats.jsonSize)}</div>
      <div class="stat-sub">${stats.jsonTokens} tokens</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-label">TOON Size</div>
      <div class="stat-value">${formatBytes(stats.toonSize)}</div>
      <div class="stat-sub">${stats.toonTokens} tokens</div>
    </div>
  </div>

  <div class="comparison">
    <h2>Comparison</h2>
    <div class="comparison-row">
      <span>Size Reduction</span>
      <span style="color: ${getDiffColor(stats.sizeDiff)}">
        ${stats.sizeDiff > 0 ? "-" : "+"}${formatBytes(Math.abs(stats.sizeDiff))} (${stats.compressionRatio}%)
      </span>
    </div>
    <div class="comparison-row">
      <span>Token Reduction</span>
      <span style="color: ${getDiffColor(stats.tokenDiff)}">
        ${stats.tokenDiff > 0 ? "-" : "+"}${Math.abs(stats.tokenDiff)} tokens
      </span>
    </div>
  </div>

  <div class="highlight">
    ${stats.sizeDiff > 0 
      ? `TOON is ${stats.compressionRatio}% more efficient.` 
      : `JSON is ${Math.abs(parseFloat(stats.compressionRatio))}% more efficient.`
    }
  </div>
</body>
</html>
  `.trim();
}
