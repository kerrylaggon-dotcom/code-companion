import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ExtensionCard } from "@/components/ExtensionCard";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getExtensions, updateExtension } from "@/lib/storage";
import type { Extension } from "@/types";

type FilterType = "all" | "installed" | "language" | "formatter" | "utility" | "theme";

export default function ExtensionsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const theme = Colors.dark;
  
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExtensions();
  }, []);

  const loadExtensions = async () => {
    setIsLoading(true);
    const loaded = await getExtensions();
    setExtensions(loaded);
    setIsLoading(false);
  };

  const handleToggleInstall = useCallback(
    async (extension: Extension) => {
      const updated = { ...extension, installed: !extension.installed };
      await updateExtension(updated);
      setExtensions((prev) =>
        prev.map((e) => (e.id === extension.id ? updated : e))
      );
      Haptics.notificationAsync(
        updated.installed
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    },
    []
  );

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case "installed":
        return ext.installed;
      case "language":
      case "formatter":
      case "utility":
      case "theme":
        return ext.category === filter;
      default:
        return true;
    }
  });

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "installed", label: "Installed" },
    { key: "language", label: "Languages" },
    { key: "formatter", label: "Formatters" },
  ];

  const renderItem = useCallback(
    ({ item }: { item: Extension }) => (
      <ExtensionCard
        extension={item}
        onToggleInstall={() => handleToggleInstall(item)}
      />
    ),
    [handleToggleInstall]
  );

  const renderEmpty = () => (
    <EmptyState
      title={filter === "installed" ? "No installed extensions" : "No extensions found"}
      description={
        filter === "installed"
          ? "Browse the available extensions and install the ones you need"
          : "Try adjusting your search or filter"
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search extensions..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>
        
        <View style={styles.filterContainer}>
          {filterButtons.map((btn) => (
            <Pressable
              key={btn.key}
              onPress={() => {
                setFilter(btn.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === btn.key
                      ? theme.buttonBackground
                      : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === btn.key ? theme.buttonText : theme.text,
                  },
                ]}
              >
                {btn.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        
        <FlatList
          data={filteredExtensions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filteredExtensions.length === 0 && styles.emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },
  emptyContainer: {
    flex: 1,
  },
});
