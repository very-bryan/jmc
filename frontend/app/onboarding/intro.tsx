import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/config";

const { width } = Dimensions.get("window");

export default function IntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 히어로 이미지 */}
        <View style={styles.heroWrap}>
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderText}>사진 영역</Text>
          </View>
          {/* 그라데이션 오버레이 */}
          <View style={styles.heroOverlay} />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>우리들의 약속</Text>
            <Text style={styles.heroSubtitle}>진심이 만나는 순간, 진만추가 함께합니다.</Text>
          </View>
        </View>

        {/* 원칙 카드들 */}
        <View style={styles.cards}>
          {/* 1. 결혼을 향한 진지한 마음 */}
          <View style={styles.cardFull}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNumber}>01</Text>
              <MaterialIcons name="favorite" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>결혼을 향한 진지한 마음</Text>
            <Text style={styles.cardDesc}>가벼운 만남을 넘어 결혼까지 생각하는 진지한 인연을 위해 노력합니다.</Text>
          </View>

          {/* 2. 철저한 정보 인증 */}
          <View style={[styles.cardFull, styles.cardAccent]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardNumber, { color: COLORS.primary, opacity: 0.15 }]}>02</Text>
              <MaterialIcons name="verified-user" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>철저한 정보 인증</Text>
            <Text style={styles.cardDesc}>실명, 직장, 학교 정보를 인증해야 대화가 시작됩니다.</Text>
          </View>

          {/* 3 & 4 그리드 */}
          <View style={styles.cardGrid}>
            <View style={styles.cardHalf}>
              <MaterialIcons name="forum" size={28} color={COLORS.primary} />
              <Text style={styles.cardTitleSmall}>대화는 언제나 무료</Text>
              <Text style={styles.cardDescSmall}>서로의 호감이 확인되면 대화는 언제나 무료로 가능합니다.</Text>
            </View>
            <View style={styles.cardHalf}>
              <MaterialIcons name="gesture" size={28} color={COLORS.primary} />
              <Text style={styles.cardTitleSmall}>상호 관심 기반</Text>
              <Text style={styles.cardDescSmall}>두 사람 모두 호감을 표시했을 때만 대화의 문이 열립니다.</Text>
            </View>
          </View>

          {/* 5. 졸업 카드 (하이라이트) */}
          <View style={styles.gradCard}>
            <View style={styles.gradGlow} />
            <View style={styles.gradContent}>
              <View style={styles.gradBadgeRow}>
                <MaterialIcons name="school" size={32} color="#fff" />
                <View style={styles.gradBadge}>
                  <Text style={styles.gradBadgeText}>GRADUATION</Text>
                </View>
              </View>
              <Text style={styles.gradTitle}>행복한 졸업(결혼)</Text>
              <Text style={styles.gradDesc}>매칭이 완료되면 함께 앱을 삭제하고 졸업하세요.</Text>
              <Text style={styles.gradItalic}>인연의 완성은 진만추를 떠나는 순간입니다.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/onboarding/phone")}
        >
          <Text style={styles.ctaText}>함께 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf9fe" },
  scroll: { paddingBottom: 20 },

  // 히어로
  heroWrap: {
    width: width - 48,
    aspectRatio: 4 / 5,
    borderRadius: 32,
    overflow: "hidden",
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    position: "relative",
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: "#e8e7ec",
    justifyContent: "center",
    alignItems: "center",
  },
  heroPlaceholderText: {
    fontSize: 16,
    color: "#999",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(97, 74, 192, 0.45)",
  },
  heroTextWrap: {
    position: "absolute",
    bottom: 28,
    left: 28,
    right: 28,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },

  // 카드 공통
  cards: { paddingHorizontal: 24, gap: 14 },

  cardFull: {
    backgroundColor: "#f4f3f8",
    padding: 28,
    borderRadius: 24,
  },
  cardAccent: {
    backgroundColor: "rgba(156, 134, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(156, 134, 255, 0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.primary,
    opacity: 0.12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1c1f",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 15,
    color: "#484553",
    lineHeight: 23,
  },

  // 그리드 카드
  cardGrid: {
    flexDirection: "row",
    gap: 12,
  },
  cardHalf: {
    flex: 1,
    backgroundColor: "#f4f3f8",
    padding: 22,
    borderRadius: 24,
    gap: 10,
  },
  cardTitleSmall: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1c1f",
  },
  cardDescSmall: {
    fontSize: 13,
    color: "#484553",
    lineHeight: 19,
  },

  // 졸업 카드
  gradCard: {
    backgroundColor: COLORS.primary,
    padding: 32,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  gradGlow: {
    position: "absolute",
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  gradContent: { zIndex: 1 },
  gradBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  gradBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  gradBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  gradTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  gradDesc: {
    fontSize: 17,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
    marginBottom: 6,
  },
  gradItalic: {
    fontSize: 14,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.7)",
  },

  // 하단 버튼
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "rgba(250, 249, 254, 0.9)",
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
