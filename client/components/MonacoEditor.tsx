import React, { useRef, useEffect, useCallback } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { WebView } from "react-native-webview";
import type { EditorSettings } from "@/types";

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  onFormat?: () => void;
}

export function MonacoEditor({
  value,
  language,
  onChange,
  settings,
  onFormat,
}: MonacoEditorProps) {
  const webViewRef = useRef<WebView>(null);

  const getMonacoHtml = useCallback(() => {
    const escapedValue = value
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      overflow: hidden; 
      background: #1E1E1E;
    }
    #container { 
      width: 100%; 
      height: 100%; 
    }
  </style>
</head>
<body>
  <div id="container"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js"></script>
  <script>
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
    
    require(['vs/editor/editor.main'], function() {
      monaco.languages.register({ id: 'pinescript' });
      
      monaco.languages.setMonarchTokensProvider('pinescript', {
        tokenizer: {
          root: [
            [/\\/\\/.*$/, 'comment'],
            [/\\/\\*/, 'comment', '@comment'],
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            [/\\b(strategy|indicator|library|if|else|for|while|switch|case|break|continue|return|import|export|var|varip|const|type|method|true|false|na|open|high|low|close|volume|time|hl2|hlc3|ohlc4|bar_index)\\b/, 'keyword'],
            [/\\b(plot|plotshape|plotchar|plotarrow|bgcolor|fill|hline|line|label|box|table|array|matrix|map|log|strategy\\.)\\w*/, 'function'],
            [/\\b(int|float|bool|string|color|line|label|box|table|array|matrix|map)\\b/, 'type'],
            [/\\b\\d+\\.?\\d*\\b/, 'number'],
            [/[{}()\\[\\]]/, 'bracket'],
            [/[=<>!&|+\\-*\\/^%]/, 'operator'],
          ],
          comment: [
            [/[^\\/*]+/, 'comment'],
            [/\\*\\//, 'comment', '@pop'],
            [/[\\/*]/, 'comment']
          ]
        }
      });
      
      monaco.editor.defineTheme('pinescript-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
          { token: 'function', foreground: '4EC9B0' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'comment', foreground: '6A9955' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'bracket', foreground: 'FFD700' },
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#D4D4D4',
          'editor.lineHighlightBackground': '#2D2D2D',
          'editorCursor.foreground': '#4EC9B0',
          'editor.selectionBackground': '#264F78',
          'editorLineNumber.foreground': '#858585',
          'editorLineNumber.activeForeground': '#C6C6C6',
        }
      });
      
      const editor = monaco.editor.create(document.getElementById('container'), {
        value: \`${escapedValue}\`,
        language: '${language === "pinescript" ? "pinescript" : language}',
        theme: '${settings.theme === "vs-dark" ? "pinescript-dark" : "vs"}',
        fontSize: ${settings.fontSize},
        tabSize: ${settings.tabSize},
        wordWrap: ${settings.wordWrap ? "'on'" : "'off'"},
        minimap: { enabled: ${settings.minimap} },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        padding: { top: 16 },
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontLigatures: true,
      });
      
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'change',
          value: value
        }));
      });
      
      window.formatCode = function() {
        editor.getAction('editor.action.formatDocument')?.run();
      };
      
      window.setValue = function(value) {
        editor.setValue(value);
      };
      
      window.getValue = function() {
        return editor.getValue();
      };
    });
  </script>
</body>
</html>
    `;
  }, [value, language, settings]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "change") {
          onChange(data.value);
        }
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    },
    [onChange]
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={getMonacoHtml()}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getMonacoHtml() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowFileAccess={true}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
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
