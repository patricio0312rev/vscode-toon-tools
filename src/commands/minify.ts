import * as vscode from "vscode";
import { encode, decode } from "@toon-format/toon";
import { getTextAndRange } from "../utils/editor";

export function registerMinifyCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.minify", minifyToon),
    vscode.commands.registerTextEditorCommand("toon.minifyToFile", minifyToonToFile)
  );
}

async function minifyToon(editor: vscode.TextEditor) {
  const { text, range } = getTextAndRange(editor);

  let value: unknown;
  try {
    try {
      value = decode(text);
    } catch {
      value = JSON.parse(text);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`Parse failed: ${err?.message}`);
    return;
  }

  const encoded = encode(value);
  const minified = minifyToonString(encoded);

  await editor.edit((builder) => builder.replace(range, minified));
  
  const originalSize = new TextEncoder().encode(text).length;
  const minifiedSize = new TextEncoder().encode(minified).length;
  const saved = originalSize - minifiedSize;
  const percent = ((saved / originalSize) * 100).toFixed(1);
  
  vscode.window.showInformationMessage(
    `Minified! Saved ${saved} bytes (${percent}%)`
  );
}

async function minifyToonToFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let value: unknown;
  try {
    try {
      value = decode(text);
    } catch {
      value = JSON.parse(text);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`Parse failed: ${err?.message}`);
    return;
  }

  const minified = minifyToonString(encode(value));

  const currentPath = editor.document.uri.fsPath;
  const lastDot = currentPath.lastIndexOf(".");
  const basePath = lastDot > -1 ? currentPath.substring(0, lastDot) : currentPath;
  const newPath = `${basePath}.min.toon`;

  const uri = vscode.Uri.file(newPath);
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(uri, encoder.encode(minified));

  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);

  vscode.window.showInformationMessage(
    `Created minified file.`
  );
}

function minifyToonString(toon: string): string {
  return toon
    .split("\n")
    .filter(line => line.trim().length > 0)
    .map(line => line.trimEnd())
    .join("\n");
}
