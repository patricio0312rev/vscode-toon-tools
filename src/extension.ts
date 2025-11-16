import * as vscode from "vscode";
import { registerConvertCommands } from "./commands/convert";
import { registerFileCommands } from "./commands/convertToFile";
import { registerPreviewCommand } from "./preview/preview";

export function activate(context: vscode.ExtensionContext) {
  registerConvertCommands(context);
  registerFileCommands(context);
  registerPreviewCommand(context);
}

export function deactivate() {}
