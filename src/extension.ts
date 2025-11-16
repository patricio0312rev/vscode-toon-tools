import * as vscode from "vscode";
import { registerConvertCommands } from "./commands/convert";
import { registerFileCommands } from "./commands/convertToFile";
import { registerMinifyCommand } from "./commands/minify";
import { registerPrettifyCommand } from "./commands/prettify";
import { registerYamlCommands } from "./commands/convertYaml";
import { registerCsvCommands } from "./commands/convertCsv";
import { registerXmlCommands } from "./commands/convertXml";
import { registerPreviewCommand } from "./preview/preview";
import { registerTableViewerCommand } from "./table/tableViewer";
import { registerAnalyzerCommand } from "./analyzer/sizeAnalyzer";
import { registerStatusBar } from "./statusBar/statusBar";
import { registerValidator } from "./validator/validator";

export function activate(context: vscode.ExtensionContext) {
  registerConvertCommands(context);
  registerFileCommands(context);
  registerMinifyCommand(context);
  registerPrettifyCommand(context);
  registerYamlCommands(context);
  registerCsvCommands(context);
  registerXmlCommands(context);
  registerPreviewCommand(context);
  registerTableViewerCommand(context);
  registerAnalyzerCommand(context);
  registerStatusBar(context);
  registerValidator(context);
}

export function deactivate() {}
