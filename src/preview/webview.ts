export function getWebviewContent(): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
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
      .pane-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      h2 {
        margin: 0;
        font-size: 12px;
        text-transform: uppercase;
        color: var(--vscode-editor-foreground);
        opacity: 0.7;
      }
      .copy-btn {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        border-radius: 2px;
      }
      .copy-btn:hover {
        background: var(--vscode-button-hoverBackground);
      }
      .copy-btn.copied {
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }
      pre {
        margin: 0;
        padding: 8px;
        white-space: pre;
        overflow: auto;
        font-family: inherit;
        font-size: 12px;
        background: rgba(255,255,255,0.02);
        border-radius: 4px;
        flex: 1;
        border: 1px solid transparent;
      }
      pre[contenteditable="true"] {
        border: 1px solid var(--vscode-focusBorder);
        outline: none;
      }
      pre[contenteditable="true"]:focus {
        background: rgba(255,255,255,0.04);
      }
      .editable-label {
        font-size: 10px;
        color: var(--vscode-descriptionForeground);
        margin-left: 8px;
        opacity: 0.6;
      }
      .error {
        color: var(--vscode-errorForeground);
        font-size: 11px;
        margin: 4px 8px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="pane">
        <div class="pane-header">
          <div>
            <h2>JSON</h2>
            <span class="editable-label">(editable)</span>
          </div>
          <button id="copy-json-btn" class="copy-btn">Copy</button>
        </div>
        <pre id="json" contenteditable="true" spellcheck="false"></pre>
      </div>
      <div class="pane">
        <div class="pane-header">
          <h2>TOON</h2>
          <button id="copy-toon-btn" class="copy-btn">Copy</button>
        </div>
        <pre id="toon"></pre>
      </div>
    </div>
    <div id="error" class="error"></div>
    
    <script>
      const vscode = acquireVsCodeApi();
      let jsonContent = '';
      let toonContent = '';
  
      window.addEventListener('message', (e) => {
        const { json, toon, error } = e.data;
        
        jsonContent = json || '';
        toonContent = toon || '';
        
        document.getElementById('json').textContent = jsonContent;
        document.getElementById('toon').textContent = toonContent;
        document.getElementById('error').textContent = error || '';
      });
  
      function copyText(text, btnId) {
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById(btnId);
          const orig = btn.textContent;
          btn.textContent = '✓ Copied';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove('copied');
          }, 2000);
        });
      }
  
      document.getElementById('copy-json-btn').addEventListener('click', () => {
        copyText(jsonContent, 'copy-json-btn');
      });
  
      document.getElementById('copy-toon-btn').addEventListener('click', () => {
        copyText(toonContent, 'copy-toon-btn');
      });
  
      let timeout;
      document.getElementById('json').addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          vscode.postMessage({
            type: 'updateJson',
            json: e.target.textContent
          });
        }, 500);
      });
    </script>
  </body>
  </html>
    `.trim();
}
