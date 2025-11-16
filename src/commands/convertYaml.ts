import * as vscode from "vscode";
import * as yaml from "js-yaml";
import * as path from "path";
import { encode, decode } from "@toon-format/toon";
import { getTextAndRange } from "../utils/editor";

export function registerYamlCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.yamlToToon", yamlToToon),
    vscode.commands.registerTextEditorCommand("toon.toonToYaml", toonToYaml),
    vscode.commands.registerTextEditorCommand("toon.yamlToToonFile", yamlToToonFile),
    vscode.commands.registerTextEditorCommand("toon.toonToYamlFile", toonToYamlFile)
  );
}

async function yamlToToon(editor: vscode.TextEditor) {
  const { text, range } = getTextAndRange(editor);

  let value: unknown;
  try {
    value = yaml.load(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Invalid YAML: ${err?.message}`);
    return;
  }

  let toon: string;
  try {
    toon = encode(value);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Encode failed: ${err?.message}`);
    return;
  }

  await editor.edit((builder) => builder.replace(range, toon));
}

async function toonToYaml(editor: vscode.TextEditor) {
  const { text, range } = getTextAndRange(editor);

  let value: unknown;
  try {
    value = decode(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Decode failed: ${err?.message}`);
    return;
  }

  const yamlText = yaml.dump(value, { indent: 2 });
  await editor.edit((builder) => builder.replace(range, yamlText));
}

async function yamlToToonFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let value: unknown;
  try {
    value = yaml.load(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Invalid YAML: ${err?.message}`);
    return;
  }

  let toon: string;
  try {
    toon = encode(value);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Encode failed: ${err?.message}`);
    return;
  }

  const newPath = getNewFilePath(editor.document.uri.fsPath, ".toon");
  await writeAndOpen(newPath, toon);
}

async function toonToYamlFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let value: unknown;
  try {
    value = decode(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Decode failed: ${err?.message}`);
    return;
  }

  const yamlText = yaml.dump(value, { indent: 2 });
  const newPath = getNewFilePath(editor.document.uri.fsPath, ".yaml");
  await writeAndOpen(newPath, yamlText);
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
