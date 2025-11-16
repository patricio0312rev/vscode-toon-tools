import * as vscode from "vscode";
import { registerConvertCommands } from "./commands/convert";
import { registerFileCommands } from "./commands/convertToFile";
import { registerMinifyCommand } from "./commands/minify";
import { registerPrettifyCommand } from "./commands/prettify";
import { registerPreviewCommand } from "./preview/preview";
import { registerTableViewerCommand } from "./table/tableViewer";
import { registerAnalyzerCommand } from "./analyzer/sizeAnalyzer";
import { registerStatusBar } from "./statusBar/statusBar";

export function activate(context: vscode.ExtensionContext) {
  registerConvertCommands(context);
  registerFileCommands(context);
  registerMinifyCommand(context);
  registerPrettifyCommand(context);
  registerPreviewCommand(context);
  registerTableViewerCommand(context);
  registerAnalyzerCommand(context);
  registerStatusBar(context);
}

export function deactivate() {}
