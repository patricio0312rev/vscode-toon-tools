import * as vscode from "vscode";
import { decode } from "@toon-format/toon";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerValidator(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection("toon");
  context.subscriptions.push(diagnosticCollection);

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(validateDocument)
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      validateDocument(e.document);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(validateDocument)
  );

  if (vscode.window.activeTextEditor) {
    validateDocument(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("toon.validate", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        validateDocument(editor.document);
        vscode.window.showInformationMessage("TOON validation complete.");
      }
    })
  );
}

function validateDocument(document: vscode.TextDocument) {
  if (!document.fileName.endsWith(".toon")) {
    return;
  }

  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  try {
    decode(text);
    diagnosticCollection.set(document.uri, []);
  } catch (err: any) {
    const message = err?.message || String(err);
    
    let line = 0;
    const lineMatch = message.match(/line (\d+)/i);
    if (lineMatch) {
      line = parseInt(lineMatch[1]) - 1;
    }

    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(line, document.lineAt(line).text.length)
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      message,
      vscode.DiagnosticSeverity.Error
    );
    diagnostic.source = "TOON";

    diagnostics.push(diagnostic);
    diagnosticCollection.set(document.uri, diagnostics);
  }
}
