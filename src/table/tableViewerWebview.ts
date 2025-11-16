export function getTableViewerContent(): string {
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
        padding: 16px;
      }
      .table-container {
        margin-bottom: 32px;
      }
      h2 {
        font-size: 16px;
        margin-bottom: 8px;
        color: var(--vscode-editor-foreground);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
        font-size: 13px;
      }
      th, td {
        text-align: left;
        padding: 8px 12px;
        border: 1px solid var(--vscode-panel-border);
      }
      th {
        background: var(--vscode-editor-selectionBackground);
        font-weight: 600;
        position: sticky;
        top: 0;
      }
      tr:nth-child(even) {
        background: rgba(255,255,255,0.02);
      }
      tr:hover {
        background: rgba(255,255,255,0.05);
      }
      .error {
        color: var(--vscode-errorForeground);
        padding: 16px;
        background: rgba(255,0,0,0.1);
        border-radius: 4px;
      }
      .no-tables {
        color: var(--vscode-descriptionForeground);
        padding: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="content"></div>
    
    <script>
      const vscode = acquireVsCodeApi();
  
      window.addEventListener('message', (e) => {
        const { tables, error } = e.data;
        const content = document.getElementById('content');
  
        if (error) {
          content.innerHTML = \`<div class="error">Error: \${error}</div>\`;
          return;
        }
  
        if (tables.length === 0) {
          content.innerHTML = '<div class="no-tables">No tabular data found in the document</div>';
          return;
        }
  
        let html = '';
        for (const table of tables) {
          html += \`<div class="table-container">\`;
          html += \`<h2>\${table.name}</h2>\`;
          html += renderTable(table.data);
          html += \`</div>\`;
        }
        content.innerHTML = html;
      });
  
      function renderTable(data) {
        if (!data || data.length === 0) return '';
  
        const keys = Object.keys(data[0]);
        
        let html = '<table>';
        html += '<thead><tr>';
        for (const key of keys) {
          html += \`<th>\${escapeHtml(key)}</th>\`;
        }
        html += '</tr></thead>';
        
        html += '<tbody>';
        for (const row of data) {
          html += '<tr>';
          for (const key of keys) {
            const value = row[key];
            const displayValue = typeof value === 'object' 
              ? JSON.stringify(value) 
              : String(value);
            html += \`<td>\${escapeHtml(displayValue)}</td>\`;
          }
          html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        
        return html;
      }
  
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    </script>
  </body>
  </html>
    `.trim();
}
