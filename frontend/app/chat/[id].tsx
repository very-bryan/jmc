import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { conversationApi } from "../../src/api";
import { useAuthStore } from "../../src/store/authStore";
import { COLORS } from "../../src/constants/config";
import type { Message } from "../../src/types";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // polling for MVP
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await conversationApi.messages(Number(id));
      setMessages(res.data.messages.reverse());
    } catch {
      // ignore
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      await conversationApi.sendMessage(Number(id), input.trim());
      setInput("");
      fetchMessages();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isMine = item.sender_id === user?.id;
          return (
            <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
              <Text style={[styles.bubbleText, isMine && styles.mineText]}>
                {item.content}
              </Text>
              <Text style={[styles.time, isMine && styles.mineTime]}>
                {new Date(item.created_at).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          placeholderTextColor={COLORS.textLight}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  list: { padding: 12, paddingBottom: 4 },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  mineText: { color: "#fff" },
  time: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
  mineTime: { color: "rgba(255,255,255,0.7)" },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: COLORS.textLight },
  sendText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
