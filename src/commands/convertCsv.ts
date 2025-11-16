import * as vscode from "vscode";
import * as Papa from "papaparse";
import * as path from "path";
import { encode, decode } from "@toon-format/toon";

export function registerCsvCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.csvToToonFile", csvToToonFile),
    vscode.commands.registerTextEditorCommand("toon.toonToCsvFile", toonToCsvFile)
  );
}

async function csvToToonFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let data: any;
  try {
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }
    data = result.data;
  } catch (err: any) {
    vscode.window.showErrorMessage(`Invalid CSV: ${err?.message}`);
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

async function toonToCsvFile(editor: vscode.TextEditor) {
  const text = editor.document.getText();

  let value: unknown;
  try {
    value = decode(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Decode failed: ${err?.message}`);
    return;
  }

  const tableData = extractTableData(value);
  
  if (tableData.length === 0) {
    vscode.window.showErrorMessage("No tabular data found to convert to CSV");
    return;
  }

  const csv = Papa.unparse(tableData);
  const newPath = getNewFilePath(editor.document.uri.fsPath, ".csv");
  await writeAndOpen(newPath, csv);
}

function extractTableData(value: any): any[] {
  if (Array.isArray(value) && value.length > 0 && isSimpleObject(value[0])) {
    return value;
  }

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    for (const key in value) {
      const item = value[key];
      if (Array.isArray(item) && item.length > 0 && isSimpleObject(item[0])) {
        return item;
      }
    }
  }

  if (Array.isArray(value)) {
    return value.map(item => flattenObject(item));
  }

  return [flattenObject(value)];
}

function isSimpleObject(obj: any): boolean {
  if (typeof obj !== "object" || obj === null) return false;
  
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "object" && val !== null) {
      if (Array.isArray(val)) {
        if (val.some(v => typeof v === "object" && v !== null)) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
}

function flattenObject(obj: any, prefix = ""): any {
  const flattened: any = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = "";
    } else if (Array.isArray(value)) {
      flattened[newKey] = value.join("; ");
    } else if (typeof value === "object") {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
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
