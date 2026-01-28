import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

import { MonacoEditor } from "@/components/MonacoEditor";
import { Terminal } from "@/components/Terminal";
import { BottomSheet } from "@/components/BottomSheet";
import { FloatingButton } from "@/components/FloatingButton";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getFiles,
  saveFile,
  getCurrentFile,
  setCurrentFile,
  getSettings,
  generateId,
  detectLanguage,
} from "@/lib/storage";
import { formatCode, formatPineScript } from "@/lib/formatter";
import type { CodeFile, EditorSettings } from "@/types";

const SAMPLE_PINESCRIPT = `// Sample PineScript Strategy
//@version=5
strategy("Moving Average Crossover", overlay=true)

// Input parameters
fastLength = input.int(9, "Fast MA Length", minval=1)
slowLength = input.int(21, "Slow MA Length", minval=1)

// Calculate moving averages
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

// Plot moving averages
plot(fastMA, "Fast MA", color=color.blue)
plot(slowMA, "Slow MA", color=color.red)

// Trading logic
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

if longCondition
    strategy.entry("Long", strategy.long)

if shortCondition
    strategy.close("Long")
`;

type EditorNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditorScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<EditorNavigationProp>();
  const theme = Colors.dark;
  
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<EditorSettings | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentFile = files.find((f) => f.id === currentFileId);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedFiles, currentId, loadedSettings] = await Promise.all([
      getFiles(),
      getCurrentFile(),
      getSettings(),
    ]);
    
    if (loadedFiles.length === 0) {
      const newFile: CodeFile = {
        id: generateId(),
        name: "strategy.pine",
        content: SAMPLE_PINESCRIPT,
        language: "pinescript",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveFile(newFile);
      await setCurrentFile(newFile.id);
      setFiles([newFile]);
      setCurrentFileId(newFile.id);
    } else {
      setFiles(loadedFiles);
      setCurrentFileId(currentId || loadedFiles[0]?.id || null);
    }
    
    setSettingsState(loadedSettings);
  };

  const handleCodeChange = useCallback(
    async (value: string) => {
      if (!currentFile) return;
      
      const updatedFile = { ...currentFile, content: value, updatedAt: Date.now() };
      setFiles((prev) =>
        prev.map((f) => (f.id === currentFile.id ? updatedFile : f))
      );
      
      if (settings?.autoSave) {
        await saveFile(updatedFile);
      }
    },
    [currentFile, settings?.autoSave]
  );

  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    setIsSaving(true);
    await saveFile(currentFile);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(false);
  }, [currentFile]);

  const handleFormat = useCallback(async () => {
    if (!currentFile || !settings) return;
    
    let formattedContent: string;
    if (currentFile.language === "pinescript") {
      formattedContent = formatPineScript(currentFile.content, settings.tabSize);
    } else {
      formattedContent = formatCode(currentFile.content, { tabSize: settings.tabSize });
    }
    
    const updatedFile = { ...currentFile, content: formattedContent, updatedAt: Date.now() };
    setFiles((prev) =>
      prev.map((f) => (f.id === currentFile.id ? updatedFile : f))
    );
    await saveFile(updatedFile);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [currentFile, settings]);

  const handleCopyAll = useCallback(async () => {
    if (!currentFile) return;
    await Clipboard.setStringAsync(currentFile.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowMenu(false);
  }, [currentFile]);

  const handleTerminalCommand = useCallback(
    (command: string) => {
      switch (command) {
        case "format":
          handleFormat();
          break;
        case "save":
          handleSave();
          break;
        case "files":
          console.log("Files:", files.map((f) => f.name).join(", "));
          break;
      }
    },
    [handleFormat, handleSave, files]
  );

  const handleCreateFile = useCallback(async () => {
    const newFile: CodeFile = {
      id: generateId(),
      name: `untitled-${Date.now()}.pine`,
      content: "// New PineScript file\n//@version=5\n",
      language: "pinescript",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveFile(newFile);
    await setCurrentFile(newFile.id);
    setFiles((prev) => [...prev, newFile]);
    setCurrentFileId(newFile.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.headerButton}
        >
          <Feather name="menu" size={24} color={theme.text} />
        </Pressable>
        
        <View style={styles.headerTitle}>
          {currentFile ? (
            <>
              <Feather
                name="file-text"
                size={16}
                color={theme.primary}
                style={styles.fileIcon}
              />
              <ThemedText style={styles.fileName} numberOfLines={1}>
                {currentFile.name}
              </ThemedText>
              {isSaving && (
                <View style={[styles.savingDot, { backgroundColor: theme.warning }]} />
              )}
            </>
          ) : (
            <ThemedText style={styles.fileName}>Code Editor</ThemedText>
          )}
        </View>
        
        <Pressable onPress={() => setShowMenu(!showMenu)} style={styles.headerButton}>
          <Feather name="more-vertical" size={24} color={theme.text} />
        </Pressable>
      </View>
      
      {showMenu && (
        <View style={[styles.menu, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={handleSave}
            style={styles.menuItem}
          >
            <Feather name="save" size={18} color={theme.text} />
            <ThemedText style={styles.menuText}>Save</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleFormat}
            style={styles.menuItem}
          >
            <Feather name="align-left" size={18} color={theme.text} />
            <ThemedText style={styles.menuText}>Format Code</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleCopyAll}
            style={styles.menuItem}
          >
            <Feather name="copy" size={18} color={theme.text} />
            <ThemedText style={styles.menuText}>Copy All</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleCreateFile}
            style={styles.menuItem}
          >
            <Feather name="plus" size={18} color={theme.text} />
            <ThemedText style={styles.menuText}>New File</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowMenu(false);
              navigation.navigate("AIAssistant");
            }}
            style={styles.menuItem}
          >
            <Feather name="cpu" size={18} color={theme.primary} />
            <ThemedText style={[styles.menuText, { color: theme.primary }]}>
              PineScript AI
            </ThemedText>
          </Pressable>
        </View>
      )}
      
      {currentFile ? (
        <MonacoEditor
          value={currentFile.content}
          language={currentFile.language}
          onChange={handleCodeChange}
          settings={settings}
        />
      ) : (
        <EmptyState
          image={require("../../assets/images/empty-editor.png")}
          title="No file open"
          description="Open a file from the sidebar or create a new one to start coding"
          actionLabel="Create New File"
          onAction={handleCreateFile}
        />
      )}
      
      <FloatingButton
        icon="cpu"
        onPress={() => navigation.navigate("AIAssistant")}
        style={[
          styles.aiFloatingButton,
          { bottom: insets.bottom + Spacing.lg + 64 },
        ]}
        variant="secondary"
        size="small"
      />
      
      <FloatingButton
        icon="terminal"
        onPress={() => setIsTerminalOpen(true)}
        style={[
          styles.terminalButton,
          { bottom: insets.bottom + Spacing.lg },
        ]}
      />
      
      <BottomSheet
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      >
        <View style={styles.terminalHeader}>
          <ThemedText style={styles.terminalTitle}>Terminal</ThemedText>
          <Pressable
            onPress={() => setIsTerminalOpen(false)}
            style={styles.closeButton}
          >
            <Feather name="x" size={20} color={theme.text} />
          </Pressable>
        </View>
        <Terminal onCommand={handleTerminalCommand} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fileIcon: {
    marginRight: Spacing.xs,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
  },
  savingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  menu: {
    position: "absolute",
    top: 80,
    right: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuText: {
    marginLeft: Spacing.md,
    fontSize: 14,
  },
  aiFloatingButton: {
    position: "absolute",
    right: Spacing.lg,
  },
  terminalButton: {
    position: "absolute",
    right: Spacing.lg,
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  terminalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    padding: Spacing.xs,
  },
});
