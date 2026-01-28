export interface FormatOptions {
  tabSize: number;
  insertSpaces: boolean;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
}

const DEFAULT_OPTIONS: FormatOptions = {
  tabSize: 2,
  insertSpaces: true,
  trimTrailingWhitespace: true,
  insertFinalNewline: true,
};

export function formatCode(code: string, options: Partial<FormatOptions> = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = code;

  result = fixIndentation(result, opts);
  
  if (opts.trimTrailingWhitespace) {
    result = trimTrailingWhitespace(result);
  }

  result = normalizeSpacing(result);

  if (opts.insertFinalNewline && !result.endsWith("\n")) {
    result += "\n";
  }

  return result;
}

function fixIndentation(code: string, options: FormatOptions): string {
  const lines = code.split("\n");
  const indent = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";
  let indentLevel = 0;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === "") {
      result.push("");
      continue;
    }

    if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    result.push(indent.repeat(indentLevel) + trimmed);

    const openBrackets = (trimmed.match(/[{[(]/g) || []).length;
    const closeBrackets = (trimmed.match(/[}\])]/g) || []).length;
    indentLevel += openBrackets - closeBrackets;
    indentLevel = Math.max(0, indentLevel);
  }

  return result.join("\n");
}

function trimTrailingWhitespace(code: string): string {
  return code
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
}

function normalizeSpacing(code: string): string {
  return code
    .replace(/\t/g, "  ")
    .replace(/  +/g, (match) => {
      const spaces = Math.ceil(match.length / 2) * 2;
      return " ".repeat(Math.min(spaces, match.length));
    });
}

export function formatPineScript(code: string, tabSize: number = 2): string {
  const lines = code.split("\n");
  const indent = " ".repeat(tabSize);
  let indentLevel = 0;
  const result: string[] = [];

  const increaseIndentKeywords = ["if", "else", "for", "while", "switch", "method", "type"];
  const singleLineDecreaseKeywords = ["else"];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      result.push("");
      continue;
    }

    let currentIndent = indentLevel;

    for (const keyword of singleLineDecreaseKeywords) {
      if (trimmed.startsWith(keyword)) {
        currentIndent = Math.max(0, currentIndent - 1);
        break;
      }
    }

    result.push(indent.repeat(currentIndent) + trimmed);

    let shouldIncrease = false;
    for (const keyword of increaseIndentKeywords) {
      if (trimmed.startsWith(keyword) && !trimmed.includes("=>")) {
        shouldIncrease = true;
        break;
      }
    }

    if (shouldIncrease) {
      indentLevel++;
    }

    if (trimmed.endsWith("=>") || (trimmed.includes("=>") && !trimmed.endsWith(")"))) {
      indentLevel++;
    }

    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    if (nextLine && !nextLine.startsWith("if") && !nextLine.startsWith("else") && 
        !nextLine.startsWith("for") && !nextLine.startsWith("while") &&
        trimmed.startsWith("if") || trimmed.startsWith("else") || 
        trimmed.startsWith("for") || trimmed.startsWith("while")) {
    }
  }

  return result.join("\n");
}
