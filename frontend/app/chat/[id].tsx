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

      {/* Progress bar accent */}
      <View style={styles.progressBar} />
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachBtn}><Text style={styles.attachIcon}>＋</Text></TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn}><Text style={styles.attachIcon}>🖼</Text></TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={COLORS.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendIcon}>🎤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9FE" },
  list: { padding: 14, paddingBottom: 4 },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EFF5",
    borderBottomLeftRadius: 6,
  },
  bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  mineText: { color: "#fff" },
  time: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
  mineTime: { color: "rgba(255,255,255,0.6)" },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 14,
    backgroundColor: COLORS.background,
    alignItems: "center",
    gap: 6,
  },
  progressBar: {
    height: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 1,
    opacity: 0.3,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  attachIcon: { fontSize: 16 },
  inputWrap: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#F5F5F8",
    paddingHorizontal: 14,
  },
  input: {
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: { fontSize: 18 },
  sendBtnDisabled: { backgroundColor: COLORS.textLight },
  sendText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
