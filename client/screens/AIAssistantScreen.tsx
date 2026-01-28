import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getSettings } from "@/lib/storage";
import type { EditorSettings } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Create a simple moving average crossover strategy",
  "Add RSI with overbought/oversold signals",
  "Build a Bollinger Bands indicator",
  "Create a volume profile indicator",
];

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const theme = Colors.dark;
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettingsState] = useState<EditorSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettingsState);
  }, []);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const baseUrl = getApiUrl();
      const apiKey = settings?.aiProvider === "google" ? settings?.geminiApiKey : undefined;
      const provider = settings?.aiProvider;
      
      const response = await fetch(new URL("/api/ai/chat", baseUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.content,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          apiKey,
          provider,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: fullContent }
                        : m
                    )
                  );
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: "Sorry, I encountered an error. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages]);

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCopyCode = async (content: string) => {
    const codeMatch = content.match(/```(?:pinescript)?\n?([\s\S]*?)```/);
    if (codeMatch) {
      await Clipboard.setStringAsync(codeMatch[1].trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === "user";
      const hasCode = item.content.includes("```");

      return (
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isUser
                  ? theme.buttonBackground
                  : theme.backgroundDefault,
              },
            ]}
          >
            {!isUser && (
              <View style={styles.aiHeader}>
                <Feather name="cpu" size={14} color={theme.primary} />
                <ThemedText style={[styles.aiLabel, { color: theme.primary }]}>
                  PineScript AI
                </ThemedText>
              </View>
            )}
            <ThemedText
              style={[
                styles.messageText,
                { color: isUser ? theme.buttonText : theme.text },
              ]}
            >
              {item.content || (isLoading && !isUser ? "Thinking..." : "")}
            </ThemedText>
            {hasCode && !isUser && (
              <Pressable
                onPress={() => handleCopyCode(item.content)}
                style={[styles.copyButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <Feather name="copy" size={14} color={theme.text} />
                <ThemedText style={styles.copyText}>Copy Code</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      );
    },
    [isLoading, theme]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.welcomeSection}>
        <View style={[styles.aiIconContainer, { backgroundColor: theme.primary + "20" }]}>
          <Feather name="cpu" size={32} color={theme.primary} />
        </View>
        <ThemedText style={styles.welcomeTitle}>PineScript AI</ThemedText>
        <ThemedText style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
          Your AI assistant for TradingView Pine Script
        </ThemedText>
      </View>

      <ThemedText style={[styles.suggestionsTitle, { color: theme.textSecondary }]}>
        Try asking:
      </ThemedText>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((suggestion, index) => (
          <Pressable
            key={index}
            onPress={() => handleSuggestion(suggestion)}
            style={[styles.suggestionChip, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="zap" size={14} color={theme.primary} />
            <ThemedText style={styles.suggestionText} numberOfLines={2}>
              {suggestion}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: Spacing.md,
          },
          messages.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about Pine Script..."
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
            },
          ]}
          multiline
          maxLength={2000}
          editable={!isLoading}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          style={[
            styles.sendButton,
            {
              backgroundColor:
                inputText.trim() && !isLoading
                  ? theme.buttonBackground
                  : theme.backgroundSecondary,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Feather
              name="send"
              size={20}
              color={inputText.trim() ? theme.buttonText : theme.textSecondary}
            />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  aiIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  suggestions: {
    gap: Spacing.sm,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  copyText: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
