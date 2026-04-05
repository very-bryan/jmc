import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { conversationApi, relationshipApi } from "../../src/api";
import { trackEvent } from "../../src/api/analytics";
import { ConfirmModal } from "../../src/components/ConfirmModal";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import type { Conversation } from "../../src/types";

export default function GraduationSelectScreen() {
  const router = useRouter();
  const C = useThemeColors();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSoloConfirm, setShowSoloConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    conversationApi.list()
      .then((res) => setConversations(res.data?.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (conv: Conversation) => {
    setSelected(conv);
    setShowConfirm(true);
  };

  const handleGraduation = async () => {
    if (!selected) return;
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await relationshipApi.create(selected.user.id, "graduated");
      trackEvent("graduation_request", { partner_id: selected.user.id });
      router.replace({
        pathname: "/graduation/pending",
        params: { nickname: selected.user.nickname },
      } as any);
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert("오류", err.response?.data?.error || "졸업 신청에 실패했습니다");
    }
  };

  const handleSoloGraduation = async () => {
    setShowSoloConfirm(false);
    setSubmitting(true);
    try {
      await relationshipApi.soloGraduation();
      trackEvent("solo_graduation", {});
      router.replace("/graduation/complete" as any);
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert("오류", err.response?.data?.error || "졸업 처리에 실패했습니다");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: C.text }]}>졸업 신청</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.headerSection}>
        <View style={[styles.iconCircle, { backgroundColor: C.primaryLight }]}>
          <MaterialIcons name="school" size={32} color={C.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: C.text }]}>
          함께 졸업할 분을 선택하세요
        </Text>
        <Text style={[styles.headerDesc, { color: C.textSecondary }]}>
          상대방이 수락하면 졸업이 완료됩니다
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { borderBottomColor: C.border }]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.user.profile_image_url || `https://i.pravatar.cc/150?img=${(item.user.id % 10) + 1}` }}
                style={[styles.avatar, { backgroundColor: C.surface }]}
              />
              <View style={styles.info}>
                <Text style={[styles.nickname, { color: C.text }]}>{item.user.nickname}</Text>
                <Text style={[styles.meta, { color: C.textSecondary }]}>
                  {item.user.age}세 · {item.user.region}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={C.textLight} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="chat-bubble-outline" size={40} color={C.textLight} />
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                아직 대화 상대가 없습니다
              </Text>
            </View>
          }
        />
      )}

      {/* 다른 곳에서 만난 분 */}
      <View style={[styles.soloSection, { borderTopColor: C.border }]}>
        <Text style={[styles.soloHint, { color: C.textLight }]}>
          진만추가 아닌 다른 곳에서 만나셨나요?
        </Text>
        <TouchableOpacity
          style={[styles.soloBtn, { borderColor: C.border }]}
          onPress={() => setShowSoloConfirm(true)}
        >
          <Text style={[styles.soloBtnText, { color: C.textSecondary }]}>
            혼자 졸업하기
          </Text>
        </TouchableOpacity>
      </View>

      {/* 상대 지정 졸업 확인 */}
      <ConfirmModal
        visible={showConfirm}
        icon="school"
        iconColor={C.primary}
        title={`${selected?.user.nickname}님에게\n졸업을 신청하시겠습니까?`}
        message={"상대방이 수락하면 졸업이 완료됩니다.\n졸업 시 계정이 비활성화되며\n다른 회원에게 프로필이 표시되지 않습니다.\n다시 활성화하려면 휴면해제가 필요합니다."}
        confirmText="졸업 신청"
        onConfirm={handleGraduation}
        onCancel={() => setShowConfirm(false)}
      />

      {/* 혼자 졸업 확인 */}
      <ConfirmModal
        visible={showSoloConfirm}
        icon="school"
        iconColor={C.primary}
        title="혼자 졸업하시겠습니까?"
        message={"좋은 인연을 만나셨군요, 축하합니다!\n\n졸업 시 계정이 비활성화되며\n다른 회원에게 프로필이 표시되지 않습니다.\n다시 활성화하려면 휴면해제가 필요합니다."}
        confirmText="졸업하기"
        onConfirm={handleSoloGraduation}
        onCancel={() => setShowSoloConfirm(false)}
      />

      {submitting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  topTitle: { fontSize: 18, fontWeight: "700" },
  headerSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  headerDesc: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  list: { paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  info: { flex: 1, marginLeft: 14 },
  nickname: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 13, marginTop: 3 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  soloSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 0.5,
  },
  soloHint: { fontSize: 13, marginBottom: 12 },
  soloBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  soloBtnText: { fontSize: 14, fontWeight: "600" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
