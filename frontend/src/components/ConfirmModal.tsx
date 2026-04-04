import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";

interface Props {
  visible: boolean;
  icon?: string;
  iconColor?: string;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  icon,
  iconColor,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  confirmColor,
  onConfirm,
  onCancel,
}: Props) {
  const C = useThemeColors();
  const btnColor = confirmColor || C.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={[styles.container, { backgroundColor: C.background }]}>
          {icon && (
            <View style={[styles.iconWrap, { backgroundColor: (iconColor || C.primary) + "15" }]}>
              <MaterialIcons name={icon as any} size={28} color={iconColor || C.primary} />
            </View>
          )}
          <Text style={[styles.title, { color: C.text }]}>{title}</Text>
          {message && <Text style={[styles.message, { color: C.textSecondary }]}>{message}</Text>}
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: C.surface }]} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: C.textSecondary }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: btnColor }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ResultToast({
  visible,
  message,
  onDone,
}: {
  visible: boolean;
  message: string;
  onDone: () => void;
}) {
  const C = useThemeColors();

  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDone, 1500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.toastOverlay}>
        <View style={[styles.toast, { backgroundColor: C.background }]}>
          <MaterialIcons name="check-circle" size={32} color={C.primary} />
          <Text style={[styles.toastText, { color: C.text }]}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  container: {
    borderRadius: 24,
    padding: 28,
    width: "100%",
    alignItems: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  toastOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toast: {
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  toastText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
