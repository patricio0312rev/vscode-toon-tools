import * as vscode from "vscode";
import { registerConvertCommands } from "./commands/convert";
import { registerFileCommands } from "./commands/convertToFile";
import { registerMinifyCommand } from "./commands/minify";
import { registerPreviewCommand } from "./preview/preview";
import { registerTableViewerCommand } from "./table/tableViewer";
import { registerAnalyzerCommand } from "./analyzer/sizeAnalyzer";

export function activate(context: vscode.ExtensionContext) {
  registerConvertCommands(context);
  registerFileCommands(context);
  registerMinifyCommand(context);
  registerPreviewCommand(context);
  registerTableViewerCommand(context);
  registerAnalyzerCommand(context);
}

export function deactivate() {}
