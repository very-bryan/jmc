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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/config";

const { width } = Dimensions.get("window");

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <BlurView intensity={35} tint="light" style={[styles.glassOuter, style]}>
      <View style={styles.glassInner}>
        {children}
      </View>
    </BlurView>
  );
}

export default function IntroScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#E8E0F0", "#F5F1EA", "#F0E8E0", "#EDE8F5"]} locations={[0, 0.3, 0.7, 1]} style={styles.container}>
      {/* 배경 장식 원 (카드 뒤에서 비치는 요소) */}
      <View style={styles.deco1} />
      <View style={styles.deco2} />
      <View style={styles.deco3} />
      <View style={styles.deco4} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 히어로 이미지 */}
        <View style={styles.heroWrap}>
          <Image
            source={require("../../assets/intro-hero.webp")}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          {/* 히어로 텍스트: 글래스 오버레이 */}
          <BlurView intensity={25} tint="dark" style={styles.heroGlass}>
            <View style={styles.heroGlassInner}>
              <Text style={styles.heroTitle}>우리들의 약속</Text>
              <Text style={styles.heroSubtitle}>진심이 만나는 순간, 진만추가 함께합니다.</Text>
            </View>
          </BlurView>
        </View>

        {/* 원칙 카드들 */}
        <View style={styles.cards}>
          {/* 1. 결혼을 향한 진지한 마음 */}
          <GlassCard>
            <View style={styles.cardHeader}>
              <Text style={styles.cardNumber}>01</Text>
              <MaterialIcons name="favorite" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>결혼을 향한 진지한 마음</Text>
            <Text style={styles.cardDesc}>가벼운 만남을 넘어 결혼까지 생각하는 진지한 인연을 위해 노력합니다.</Text>
          </GlassCard>

          {/* 2. 철저한 정보 인증 */}
          <GlassCard style={styles.cardAccentOuter}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardNumber, styles.cardNumberAccent]}>02</Text>
              <MaterialIcons name="verified-user" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>철저한 정보 인증</Text>
            <Text style={styles.cardDesc}>실명, 직장, 학교 정보를 인증해야 대화가 시작됩니다.</Text>
          </GlassCard>

          {/* 3 & 4 그리드 */}
          <View style={styles.cardGrid}>
            <BlurView intensity={30} tint="light" style={styles.cardHalfOuter}>
              <View style={styles.cardHalfInner}>
                <MaterialIcons name="forum" size={28} color={COLORS.primary} />
                <Text style={styles.cardTitleSmall}>대화는 언제나 무료</Text>
                <Text style={styles.cardDescSmall}>서로의 호감이 확인되면 대화는 언제나 무료로 가능합니다.</Text>
              </View>
            </BlurView>
            <BlurView intensity={30} tint="light" style={styles.cardHalfOuter}>
              <View style={styles.cardHalfInner}>
                <MaterialIcons name="gesture" size={28} color={COLORS.primary} />
                <Text style={styles.cardTitleSmall}>상호 관심 기반</Text>
                <Text style={styles.cardDescSmall}>두 사람 모두 호감을 표시했을 때만 대화의 문이 열립니다.</Text>
              </View>
            </BlurView>
          </View>

          {/* 5. 졸업 카드 */}
          <LinearGradient
            colors={[COLORS.primary, "#B8A5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradCard}
          >
            <View style={styles.gradGlow} />
            {/* 졸업 카드 내부 글래스 */}
            <BlurView intensity={15} tint="light" style={styles.gradGlassStrip}>
              <View style={styles.gradGlassStripInner}>
                <Text style={styles.gradGlassText}>좋은 사람을 만나면 떠나는 앱</Text>
              </View>
            </BlurView>
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
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 글래스 버튼 */}
      <BlurView intensity={60} tint="light" style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/onboarding/phone")}
          >
            <Text style={styles.ctaText}>함께 시작하기</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 20 },

  // 배경 장식 원 (글래스 뒤에서 비치는 요소)
  deco1: {
    position: "absolute", top: 80, left: -30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "#C9BFFF", opacity: 0.5,
  },
  deco2: {
    position: "absolute", top: 500, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "#E5C0B0", opacity: 0.4,
  },
  deco3: {
    position: "absolute", top: 900, left: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#B8A5FF", opacity: 0.35,
  },
  deco4: {
    position: "absolute", top: 1200, right: -30,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "#C9D4A0", opacity: 0.3,
  },

  // 히어로
  heroWrap: {
    width: width - 48,
    aspectRatio: 4 / 5,
    borderRadius: 32,
    overflow: "hidden",
    marginHorizontal: 24,
    marginTop: 50,
    marginBottom: 24,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroGlass: {
    position: "absolute", bottom: 16, left: 16, right: 16,
    borderRadius: 20, overflow: "hidden",
  },
  heroGlassInner: {
    paddingHorizontal: 24, paddingVertical: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
  },
  heroTitle: {
    fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.9)",
  },

  // 글래스 카드 공통
  glassOuter: {
    borderRadius: 24, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  glassInner: {
    padding: 28,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 24,
  },
  cardAccentOuter: {
    // accent 카드는 약간 보라 틴트
  },

  // 카드 공통
  cards: { paddingHorizontal: 24, gap: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 48, fontWeight: "800",
    color: COLORS.primary, opacity: 0.3,
  },
  cardNumberAccent: {
    opacity: 0.25,
  },
  cardTitle: {
    fontSize: 20, fontWeight: "700",
    color: "#1a1a1a", marginBottom: 6,
  },
  cardDesc: {
    fontSize: 15, color: "#3a3a3a", lineHeight: 23,
  },

  // 그리드 카드
  cardGrid: { flexDirection: "row", gap: 12 },
  cardHalfOuter: {
    flex: 1, borderRadius: 24, overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHalfInner: {
    padding: 22, gap: 10,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 24,
  },
  cardTitleSmall: {
    fontSize: 17, fontWeight: "700", color: "#1a1a1a",
  },
  cardDescSmall: {
    fontSize: 13, color: "#3a3a3a", lineHeight: 19,
  },

  // 졸업 카드
  gradCard: {
    padding: 32, borderRadius: 32, overflow: "hidden", position: "relative",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  gradGlow: {
    position: "absolute", top: -48, right: -48,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  gradGlassStrip: {
    borderRadius: 14, overflow: "hidden", marginBottom: 16,
  },
  gradGlassStripInner: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14, alignItems: "center",
  },
  gradGlassText: {
    fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.9)",
  },
  gradContent: { zIndex: 1 },
  gradBadgeRow: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18,
  },
  gradBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  gradBadgeText: {
    color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 2,
  },
  gradTitle: {
    fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 8,
  },
  gradDesc: {
    fontSize: 17, fontWeight: "500", color: "rgba(255,255,255,0.9)", lineHeight: 24, marginBottom: 6,
  },
  gradItalic: {
    fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.7)",
  },

  // 하단 버튼
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden",
  },
  bottomBarInner: {
    padding: 24, paddingBottom: 40,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.7)",
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18, borderRadius: 28, alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 8,
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
