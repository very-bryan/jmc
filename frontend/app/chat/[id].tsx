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
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { COLORS } from "../../src/constants/config";
import type { Message } from "../../src/types";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const trackedMilestones = useRef<Set<string>>(new Set());

  useEffect(() => {
    trackEvent(EVENTS.DM_CONVERSATION_OPEN, { conversation_id: Number(id) });
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkMilestones = (msgs: Message[]) => {
    if (!user) return;

    // 내가 보낸 메시지 수 (턴 계산)
    const myMessages = msgs.filter((m) => m.sender_id === user.id);
    const otherMessages = msgs.filter((m) => m.sender_id !== user.id);
    const turns = Math.min(myMessages.length, otherMessages.length);

    if (turns >= 5 && !trackedMilestones.current.has("5turns")) {
      trackedMilestones.current.add("5turns");
      trackEvent(EVENTS.DM_5_TURNS, { conversation_id: Number(id), total_messages: msgs.length });
    }
    if (turns >= 10 && !trackedMilestones.current.has("10turns")) {
      trackedMilestones.current.add("10turns");
      trackEvent(EVENTS.DM_10_TURNS, { conversation_id: Number(id), total_messages: msgs.length });
    }

    // 2일 이상 이어진 대화 체크
    if (msgs.length >= 2 && !trackedMilestones.current.has("multiday")) {
      const first = new Date(msgs[0].created_at);
      const last = new Date(msgs[msgs.length - 1].created_at);
      const daysDiff = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 2) {
        trackedMilestones.current.add("multiday");
        trackEvent(EVENTS.DM_MULTI_DAY, { conversation_id: Number(id), days: Math.floor(daysDiff) });
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await conversationApi.messages(Number(id));
      const reversed = res.data.messages.reverse();
      setMessages(reversed);
      checkMilestones(reversed);
    } catch {
      // ignore
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const isFirstMessage = messages.filter((m) => m.sender_id === user?.id).length === 0;

      await conversationApi.sendMessage(Number(id), input.trim());
      trackEvent(EVENTS.DM_SEND, { conversation_id: Number(id) });

      if (isFirstMessage) {
        trackEvent(EVENTS.DM_START, { conversation_id: Number(id) });
      }

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
