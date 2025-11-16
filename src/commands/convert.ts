import * as vscode from "vscode";
import { encode, decode } from "@toon-format/toon";
import { getTextAndRange } from "../utils/editor";

export function registerConvertCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.jsonToToon", jsonToToon),
    vscode.commands.registerTextEditorCommand("toon.toonToJson", toonToJson)
  );
}

async function jsonToToon(editor: vscode.TextEditor) {
  const { text, range } = getTextAndRange(editor);

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

  await editor.edit((builder) => builder.replace(range, toon));
}

async function toonToJson(editor: vscode.TextEditor) {
  const { text, range } = getTextAndRange(editor);

  let value: unknown;
  try {
    value = decode(text);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Decode failed: ${err?.message}`);
    return;
  }

  const json = JSON.stringify(value, null, 2);
  await editor.edit((builder) => builder.replace(range, json));
}
