import React, { useRef, useCallback, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { WebView } from "react-native-webview";

interface TerminalProps {
  onCommand?: (command: string) => void;
}

export function Terminal({ onCommand }: TerminalProps) {
  const webViewRef = useRef<WebView>(null);
  const [history, setHistory] = useState<string[]>([
    "Code Editor Terminal v1.0.0",
    "Type 'help' for available commands",
    "",
  ]);

  const getXtermHtml = useCallback(() => {
    const historyText = history.join("\\n");
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      overflow: hidden; 
      background: #1E1E1E;
    }
    #terminal { 
      width: 100%; 
      height: 100%;
      padding: 8px;
    }
    .xterm { 
      padding: 8px; 
    }
  </style>
</head>
<body>
  <div id="terminal"></div>
  <script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.min.js"></script>
  <script>
    const term = new Terminal({
      theme: {
        background: '#1E1E1E',
        foreground: '#D4D4D4',
        cursor: '#4EC9B0',
        cursorAccent: '#1E1E1E',
        selectionBackground: '#264F78',
        black: '#1E1E1E',
        red: '#F44747',
        green: '#4EC9B0',
        yellow: '#CE9178',
        blue: '#569CD6',
        magenta: '#C586C0',
        cyan: '#4EC9B0',
        white: '#D4D4D4',
        brightBlack: '#858585',
        brightRed: '#F44747',
        brightGreen: '#4EC9B0',
        brightYellow: '#CE9178',
        brightBlue: '#569CD6',
        brightMagenta: '#C586C0',
        brightCyan: '#4EC9B0',
        brightWhite: '#FFFFFF',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'bar',
    });
    
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(document.getElementById('terminal'));
    fitAddon.fit();
    
    window.addEventListener('resize', () => fitAddon.fit());
    
    let currentLine = '';
    const prompt = '\\x1b[32m$\\x1b[0m ';
    
    term.writeln('\\x1b[36mCode Editor Terminal v1.0.0\\x1b[0m');
    term.writeln("Type 'help' for available commands");
    term.writeln('');
    term.write(prompt);
    
    const commands = {
      help: () => {
        term.writeln('\\x1b[33mAvailable commands:\\x1b[0m');
        term.writeln('  help     - Show this help message');
        term.writeln('  clear    - Clear the terminal');
        term.writeln('  version  - Show version info');
        term.writeln('  format   - Format current file');
        term.writeln('  save     - Save current file');
        term.writeln('  files    - List open files');
      },
      clear: () => {
        term.clear();
      },
      version: () => {
        term.writeln('\\x1b[36mCode Editor v1.0.0\\x1b[0m');
        term.writeln('Monaco Editor v0.45.0');
        term.writeln('xterm.js v5.3.0');
      },
      format: () => {
        term.writeln('\\x1b[32mFormatting current file...\\x1b[0m');
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'command', command: 'format' }));
      },
      save: () => {
        term.writeln('\\x1b[32mSaving current file...\\x1b[0m');
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'command', command: 'save' }));
      },
      files: () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'command', command: 'files' }));
      },
    };
    
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      
      if (domEvent.keyCode === 13) {
        term.writeln('');
        const trimmedLine = currentLine.trim();
        if (trimmedLine) {
          if (commands[trimmedLine]) {
            commands[trimmedLine]();
          } else {
            term.writeln('\\x1b[31mCommand not found: ' + trimmedLine + '\\x1b[0m');
          }
        }
        currentLine = '';
        term.write(prompt);
      } else if (domEvent.keyCode === 8) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\\b \\b');
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });
    
    window.writeOutput = function(text) {
      term.writeln(text);
      term.write(prompt);
    };
  </script>
</body>
</html>
    `;
  }, [history]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "command" && onCommand) {
          onCommand(data.command);
        }
      } catch (e) {
        console.error("Error parsing terminal message:", e);
      }
    },
    [onCommand]
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={getXtermHtml()}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getXtermHtml() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  webview: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
});
