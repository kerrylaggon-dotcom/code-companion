import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, Pressable, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, DrawerActions, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { DrawerParamList } from "@/navigation/DrawerNavigator";
import * as Haptics from "expo-haptics";

import { FileItem } from "@/components/FileItem";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getFiles,
  saveFile,
  deleteFile,
  getCurrentFile,
  setCurrentFile,
  generateId,
  detectLanguage,
} from "@/lib/storage";
import type { CodeFile } from "@/types";

type FileBrowserNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function FileBrowserScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FileBrowserNavigationProp>();
  const theme = Colors.dark;
  
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [currentFileId, setCurrentFileIdState] = useState<string | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    const [loadedFiles, currentId] = await Promise.all([
      getFiles(),
      getCurrentFile(),
    ]);
    setFiles(loadedFiles);
    setCurrentFileIdState(currentId);
    setIsLoading(false);
  };

  const handleFilePress = useCallback(
    async (file: CodeFile) => {
      await setCurrentFile(file.id);
      setCurrentFileIdState(file.id);
      navigation.dispatch(DrawerActions.closeDrawer());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [navigation]
  );

  const handleFileLongPress = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleCreateFile = useCallback(async () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.includes(".")
      ? newFileName
      : `${newFileName}.pine`;
    
    const newFile: CodeFile = {
      id: generateId(),
      name: fileName,
      content: `// ${fileName}\n//@version=5\n`,
      language: detectLanguage(fileName),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await saveFile(newFile);
    await setCurrentFile(newFile.id);
    setFiles((prev) => [...prev, newFile]);
    setCurrentFileIdState(newFile.id);
    setNewFileName("");
    setShowNewFileModal(false);
    navigation.dispatch(DrawerActions.closeDrawer());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newFileName, navigation]);

  const handleDeleteFile = useCallback(async () => {
    if (!selectedFileId) return;
    
    await deleteFile(selectedFileId);
    setFiles((prev) => prev.filter((f) => f.id !== selectedFileId));
    
    if (currentFileId === selectedFileId) {
      const remainingFiles = files.filter((f) => f.id !== selectedFileId);
      if (remainingFiles.length > 0) {
        await setCurrentFile(remainingFiles[0].id);
        setCurrentFileIdState(remainingFiles[0].id);
      } else {
        await setCurrentFile(null);
        setCurrentFileIdState(null);
      }
    }
    
    setSelectedFileId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectedFileId, currentFileId, files]);

  const renderItem = useCallback(
    ({ item }: { item: CodeFile }) => (
      <FileItem
        file={item}
        isActive={item.id === currentFileId}
        onPress={() => handleFilePress(item)}
        onLongPress={() => handleFileLongPress(item.id)}
      />
    ),
    [currentFileId, handleFilePress, handleFileLongPress]
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-files.png")}
      title="No files yet"
      description="Create your first PineScript file to get started"
      actionLabel="Create File"
      onAction={() => setShowNewFileModal(true)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.headerTitle}>Files</ThemedText>
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => setShowNewFileModal(true)}
            style={styles.headerButton}
          >
            <Feather name="plus" size={22} color={theme.primary} />
          </Pressable>
        </View>
      </View>
      
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          files.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
      />
      
      <Pressable
        onPress={() => {
          navigation.dispatch(DrawerActions.closeDrawer());
          navigation.navigate("AIAssistant");
        }}
        style={[styles.aiButton, { backgroundColor: theme.buttonBackground }]}
      >
        <Feather name="cpu" size={20} color={theme.buttonText} />
        <ThemedText style={[styles.settingsText, { color: theme.buttonText }]}>
          PineScript AI
        </ThemedText>
      </Pressable>
      
      <Pressable
        onPress={() => navigation.navigate("Settings")}
        style={[styles.settingsButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <Feather name="settings" size={20} color={theme.text} />
        <ThemedText style={styles.settingsText}>Settings</ThemedText>
      </Pressable>
      
      <Modal
        visible={showNewFileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewFileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>New File</ThemedText>
            <TextInput
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="filename.pine"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowNewFileModal(false);
                  setNewFileName("");
                }}
                style={styles.cancelButton}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Button onPress={handleCreateFile} style={styles.createButton}>
                Create
              </Button>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={!!selectedFileId}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFileId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>Delete File?</ThemedText>
            <ThemedText style={styles.modalMessage}>
              This action cannot be undone.
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setSelectedFileId(null)}
                style={styles.cancelButton}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleDeleteFile}
                style={[styles.deleteButton, { backgroundColor: theme.error }]}
              >
                <ThemedText style={{ color: theme.buttonText }}>Delete</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
  },
  headerButton: {
    padding: Spacing.sm,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing["5xl"],
  },
  emptyContainer: {
    flex: 1,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  settingsText: {
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.md,
  },
  createButton: {
    paddingHorizontal: Spacing.xl,
  },
  deleteButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
});
