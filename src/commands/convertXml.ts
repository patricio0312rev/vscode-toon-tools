
import * as vscode from "vscode";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import * as path from "path";
import { encode, decode } from "@toon-format/toon";

export function registerXmlCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.xmlToToonFile", xmlToToonFile),
    vscode.commands.registerTextEditorCommand("toon.toonToXmlFile", toonToXmlFile)
  );
}

async function xmlToToonFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let data: any;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    data = parser.parse(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Invalid XML: ${err?.message}`);
    return;
  }

  let toon: string;
  try {
    toon = encode(data);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Encode failed: ${err?.message}`);
    return;
  }

  const newPath = getNewFilePath(editor.document.uri.fsPath, ".toon");
  await writeAndOpen(newPath, toon);
}

async function toonToXmlFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let value: unknown;
  try {
    value = decode(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Decode failed: ${err?.message}`);
    return;
  }

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
    indentBy: "  "
  });
  const xml = builder.build(value);
  
  const newPath = getNewFilePath(editor.document.uri.fsPath, ".xml");
  await writeAndOpen(newPath, xml);
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
