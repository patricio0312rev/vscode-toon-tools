import * as vscode from "vscode";

export function getTextAndRange(editor: vscode.TextEditor) {
  const doc = editor.document;
  const selection = editor.selection;

  if (!selection.isEmpty) {
    return {
      text: doc.getText(selection),
      range: selection,
    };
  }

  const fullRange = new vscode.Range(
    new vscode.Position(0, 0),
    doc.lineAt(doc.lineCount - 1).range.end
  );

  return {
    text: doc.getText(fullRange),
    range: fullRange,
  };
}
