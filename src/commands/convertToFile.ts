import * as vscode from "vscode";
import * as path from "path";
import { encode, decode } from "@toon-format/toon";

export function registerFileCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.jsonToToonFile", jsonToToonFile),
    vscode.commands.registerTextEditorCommand("toon.toonToJsonFile", toonToJsonFile)
  );
}

async function jsonToToonFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Invalid JSON: ${err?.message}`);
    return;
  }

  let toon: string;
  try {
    toon = encode(parsed);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Encode failed: ${err?.message}`);
    return;
  }

  const newPath = getNewFilePath(editor.document.uri.fsPath, ".toon");
  await writeAndOpen(newPath, toon);
}

async function toonToJsonFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let value: unknown;
  try {
    value = decode(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Decode failed: ${err?.message}`);
    return;
  }

  const json = JSON.stringify(value, null, 2);
  const newPath = getNewFilePath(editor.document.uri.fsPath, ".json");
  await writeAndOpen(newPath, json);
}

function getNewFilePath(currentPath: string, newExt: string): string {
  const ext = path.extname(currentPath);
  const baseName = path.basename(currentPath, ext);
  const dirName = path.dirname(currentPath);
  return path.join(dirName, `${baseName}${newExt}`);
}

async function writeAndOpen(filePath: string, content: string) {
  const uri = vscode.Uri.file(filePath);
  const encoder = new TextEncoder();
  await vscode.workspace.fs.writeFile(uri, encoder.encode(content));

  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);

  const fileName = path.basename(filePath);
  vscode.window.showInformationMessage(`Created ${fileName}`);
}
