import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Keyboard,
  Animated,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { conversationApi } from "../../src/api";
import { useAuthStore } from "../../src/store/authStore";
import { trackEvent, EVENTS } from "../../src/api/analytics";
import { COLORS } from "../../src/constants/config";
import type { Message } from "../../src/types";

// Dummy messages for testing when chat is empty
const DUMMY_MESSAGES: Message[] = [
  {
    id: 9001,
    sender_id: 0,
    content: "안녕하세요! 프로필 보고 관심이 갔어요 :)",
    message_type: "text",
    is_mine: false,
    read: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 9002,
    sender_id: -1,
    content: "감사합니다! 저도 프로필 인상 깊게 봤어요",
    message_type: "text",
    is_mine: true,
    read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 9003,
    sender_id: 0,
    content: "주말에 혹시 시간 되시면 커피 한잔 어떠세요?",
    message_type: "text",
    is_mine: false,
    read: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useDummy, setUseDummy] = useState(false);
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
      if (reversed.length === 0) {
        setUseDummy(true);
      } else {
        setUseDummy(false);
        setMessages(reversed);
        checkMilestones(reversed);
      }
    } catch {
      setUseDummy(true);
    }
  };

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    if (useDummy) {
      // 더미 모드: 로컬에서 바로 추가
      const newMsg: Message = {
        id: Date.now(),
        content: text,
        message_type: "text",
        sender_id: user?.id || -1,
        is_mine: true,
        read: false,
        created_at: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, newMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    setLoading(true);
    try {
      const isFirstMessage = messages.filter((m) => m.sender_id === user?.id).length === 0;

      await conversationApi.sendMessage(Number(id), text);
      trackEvent(EVENTS.DM_SEND, { conversation_id: Number(id) });

      if (isFirstMessage) {
        trackEvent(EVENTS.DM_START, { conversation_id: Number(id) });
      }

      fetchMessages();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const displayMessages = useDummy ? [...DUMMY_MESSAGES, ...localMessages] : messages;

  const isMine = (msg: Message) => {
    if (useDummy) return msg.sender_id === -1;
    return msg.sender_id === user?.id;
  };

  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? 250 : 100,
        useNativeDriver: false,
      }).start();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === "ios" ? 200 : 100,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerContainer, { paddingBottom: keyboardHeight }]}>
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const mine = isMine(item);
          return (
            <View style={[styles.msgRow, mine && styles.msgRowMine]}>
              {!mine && (
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                  style={styles.msgAvatar}
                />
              )}
              <View>
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.bubbleText, mine && styles.mineText]}>
                    {item.content}
                  </Text>
                </View>
                <Text style={[styles.time, mine && styles.timeMine]}>
                  {new Date(item.created_at).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
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
        <TouchableOpacity style={styles.attachBtn}>
          <MaterialIcons name="add-circle-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn}>
          <MaterialIcons name="image" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="메시지 입력..."
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
          <MaterialIcons name={input.trim() ? "send" : "mic"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9FE" },
  innerContainer: { flex: 1 },
  list: { padding: 14, paddingBottom: 4 },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  msgRowMine: {
    flexDirection: "row-reverse",
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  bubble: {
    maxWidth: 260,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  mineText: { color: "#fff" },
  time: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
    marginLeft: 4,
  },
  timeMine: {
    textAlign: "right",
    marginRight: 4,
    marginLeft: 0,
  },
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
  attachIcon: { fontSize: 16, color: COLORS.textSecondary },
  inputWrap: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
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
  sendIcon: { fontSize: 18, color: "#fff", fontWeight: "700" },
  sendBtnDisabled: { backgroundColor: COLORS.textLight },
});
