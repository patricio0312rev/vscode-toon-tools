import * as vscode from "vscode";
import { encode, decode } from "@toon-format/toon";
import { getTextAndRange } from "../utils/editor";

export function registerPrettifyCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("toon.prettify", prettifyToon)
  );
}

async function prettifyToon(editor: vscode.TextEditor) {
  const { text, range } = getTextAndRange(editor);

  let value: unknown;
  let toonError: Error | null = null;
  let jsonError: Error | null = null;

  try {
    value = decode(text);
  } catch (err: any) {
    toonError = err;
    
    try {
      value = JSON.parse(text);
    } catch (err2: any) {
      jsonError = err2;
    }
  }

  if (!value) {
    if (toonError && jsonError) {
      vscode.window.showErrorMessage(
        `Parse failed: Not valid TOON or JSON. TOON error: ${toonError.message}`
      );
    } else if (toonError) {
      vscode.window.showErrorMessage(`TOON parse failed: ${toonError.message}`);
    } else if (jsonError) {
      vscode.window.showErrorMessage(`JSON parse failed: ${jsonError.message}`);
    }
    return;
  }

  const encoded = encode(value);
  const prettified = prettifyToonString(encoded);

  await editor.edit((builder) => builder.replace(range, prettified));
  
  const originalLines = text.split("\n").filter(l => l.trim()).length;
  const prettifiedLines = prettified.split("\n").length;
  
  vscode.window.showInformationMessage(
    `Prettified! ${originalLines} → ${prettifiedLines} lines`
  );
}

function prettifyToonString(toon: string): string {
  const lines = toon.split("\n");
  const result: string[] = [];
  let indent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.endsWith(":")) {
      const originalIndent = line.search(/\S/);
      
      if (originalIndent === 0 && indent > 0) {
        indent = 0;
      } else if (originalIndent >= 0 && indent > 0) {
        const levels = Math.floor(originalIndent / 2);
        indent = levels;
      }

      result.push("  ".repeat(indent) + trimmed);
      indent++;
    } else {
      result.push("  ".repeat(indent) + trimmed);
    }
  }

  return result.join("\n");
}
