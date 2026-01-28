import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, ScrollView, Modal, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";

import { SettingsItem } from "@/components/SettingsItem";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getSettings, saveSettings } from "@/lib/storage";
import type { EditorSettings } from "@/types";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const theme = Colors.dark;
  
  const [settings, setSettingsState] = useState<EditorSettings | null>(null);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showTabSizeModal, setShowTabSizeModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [editingProvider, setEditingProvider] = useState<"google" | "huggingface">("google");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getSettings();
    setSettingsState(loaded);
  };

  const updateSetting = useCallback(
    async <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
      if (!settings) return;
      const updated = { ...settings, [key]: value };
      setSettingsState(updated);
      await saveSettings(updated);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [settings]
  );

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]} />
    );
  }

  const fontSizeOptions = [12, 14, 16, 18, 20];
  const tabSizeOptions = [2, 4, 8];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.sectionTitle}>Editor</ThemedText>
        
        <SettingsItem
          icon="type"
          title="Font Size"
          subtitle="Adjust code font size"
          value={`${settings.fontSize}px`}
          type="select"
          onPress={() => setShowFontSizeModal(true)}
        />
        
        <SettingsItem
          icon="hash"
          title="Tab Size"
          subtitle="Spaces per tab"
          value={`${settings.tabSize} spaces`}
          type="select"
          onPress={() => setShowTabSizeModal(true)}
        />
        
        <SettingsItem
          icon="align-justify"
          title="Word Wrap"
          subtitle="Wrap long lines"
          value={settings.wordWrap}
          type="toggle"
          onPress={() => updateSetting("wordWrap", !settings.wordWrap)}
        />
        
        <SettingsItem
          icon="sidebar"
          title="Minimap"
          subtitle="Show code minimap"
          value={settings.minimap}
          type="toggle"
          onPress={() => updateSetting("minimap", !settings.minimap)}
        />
        
        <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Behavior
        </ThemedText>
        
        <SettingsItem
          icon="save"
          title="Auto Save"
          subtitle="Automatically save changes"
          value={settings.autoSave}
          type="toggle"
          onPress={() => updateSetting("autoSave", !settings.autoSave)}
        />
        
        <SettingsItem
          icon="align-left"
          title="Auto Format"
          subtitle="Format code on save"
          value={settings.autoFormat}
          type="toggle"
          onPress={() => updateSetting("autoFormat", !settings.autoFormat)}
        />
        
        <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          AI Provider
        </ThemedText>
        
        <SettingsItem
          icon="cpu"
          title="AI Provider"
          subtitle={
            settings.aiProvider === "replit"
              ? "Replit AI (uses Replit credits)"
              : settings.aiProvider === "google"
              ? "Google Gemini (your API key)"
              : "HuggingFace (your API key)"
          }
          value={settings.aiProvider}
          type="select"
          onPress={() => setShowProviderModal(true)}
        />
        
        <SettingsItem
          icon="key"
          title="Google Gemini API Key"
          subtitle={settings.geminiApiKey ? "API key configured" : "Not configured"}
          type="action"
          onPress={() => {
            setEditingProvider("google");
            setTempApiKey(settings.geminiApiKey || "");
            setShowApiKeyModal(true);
          }}
        />
        
        <SettingsItem
          icon="key"
          title="HuggingFace API Key"
          subtitle={settings.huggingfaceApiKey ? "API key configured" : "Not configured"}
          type="action"
          onPress={() => {
            setEditingProvider("huggingface");
            setTempApiKey(settings.huggingfaceApiKey || "");
            setShowApiKeyModal(true);
          }}
        />
        
        <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          PineScript
        </ThemedText>
        
        <SettingsItem
          icon="trending-up"
          title="Language Server"
          subtitle="PineScript Language Server v1.0.0"
          type="action"
        />
        
        <SettingsItem
          icon="check-circle"
          title="Syntax Highlighting"
          subtitle="Enabled for .pine files"
          type="action"
        />
        
        <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          About
        </ThemedText>
        
        <SettingsItem
          icon="info"
          title="Version"
          subtitle="Code Editor v1.0.0"
          type="action"
        />
        
        <SettingsItem
          icon="github"
          title="Source Code"
          subtitle="View on GitHub"
          type="action"
        />
      </ScrollView>
      
      <Modal
        visible={showFontSizeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFontSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>Font Size</ThemedText>
            {fontSizeOptions.map((size) => (
              <Pressable
                key={size}
                onPress={() => {
                  updateSetting("fontSize", size);
                  setShowFontSizeModal(false);
                }}
                style={[
                  styles.optionItem,
                  settings.fontSize === size && {
                    backgroundColor: theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText style={styles.optionText}>{size}px</ThemedText>
                {settings.fontSize === size && (
                  <View style={[styles.checkmark, { backgroundColor: theme.primary }]} />
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowFontSizeModal(false)}
              style={styles.closeModalButton}
            >
              <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showTabSizeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTabSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>Tab Size</ThemedText>
            {tabSizeOptions.map((size) => (
              <Pressable
                key={size}
                onPress={() => {
                  updateSetting("tabSize", size);
                  setShowTabSizeModal(false);
                }}
                style={[
                  styles.optionItem,
                  settings.tabSize === size && {
                    backgroundColor: theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText style={styles.optionText}>{size} spaces</ThemedText>
                {settings.tabSize === size && (
                  <View style={[styles.checkmark, { backgroundColor: theme.primary }]} />
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowTabSizeModal(false)}
              style={styles.closeModalButton}
            >
              <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showProviderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>AI Provider</ThemedText>
            {(["replit", "google", "huggingface"] as const).map((provider) => (
              <Pressable
                key={provider}
                onPress={() => {
                  updateSetting("aiProvider", provider);
                  setShowProviderModal(false);
                }}
                style={[
                  styles.optionItem,
                  settings.aiProvider === provider && {
                    backgroundColor: theme.backgroundSecondary,
                  },
                ]}
              >
                <View>
                  <ThemedText style={styles.optionText}>
                    {provider === "replit"
                      ? "Replit AI"
                      : provider === "google"
                      ? "Google Gemini"
                      : "HuggingFace"}
                  </ThemedText>
                  <ThemedText style={styles.optionSubtext}>
                    {provider === "replit"
                      ? "Uses Replit credits"
                      : provider === "google"
                      ? "Uses your Google API key"
                      : "Uses your HuggingFace API key"}
                  </ThemedText>
                </View>
                {settings.aiProvider === provider && (
                  <View style={[styles.checkmark, { backgroundColor: theme.primary }]} />
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowProviderModal(false)}
              style={styles.closeModalButton}
            >
              <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.modalTitle}>
              {editingProvider === "google" ? "Google Gemini" : "HuggingFace"} API Key
            </ThemedText>
            <ThemedText style={styles.apiKeyHint}>
              {editingProvider === "google"
                ? "Get your API key from Google AI Studio"
                : "Get your API key from HuggingFace settings"}
            </ThemedText>
            <TextInput
              value={tempApiKey}
              onChangeText={setTempApiKey}
              placeholder="Enter your API key"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.apiKeyInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />
            <View style={styles.apiKeyButtons}>
              <Pressable
                onPress={() => {
                  setShowApiKeyModal(false);
                  setTempApiKey("");
                }}
                style={styles.cancelButton}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (editingProvider === "google") {
                    updateSetting("geminiApiKey", tempApiKey);
                  } else {
                    updateSetting("huggingfaceApiKey", tempApiKey);
                  }
                  setShowApiKeyModal(false);
                  setTempApiKey("");
                }}
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={{ color: theme.backgroundRoot, fontWeight: "600" }}>
                  Save
                </ThemedText>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
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
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  optionText: {
    fontSize: 16,
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  closeModalButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  optionSubtext: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  apiKeyHint: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  apiKeyInput: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  apiKeyButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  saveButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
});
