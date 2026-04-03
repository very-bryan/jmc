import { Platform } from "react-native";

let InAppPurchases: any = null;
try {
  InAppPurchases = require("expo-in-app-purchases");
} catch {
  // Expo Go에서는 네이티브 모듈 없음
}

const SIGNUP_PRODUCT_ID = Platform.select({
  ios: "com.jmc.signup.10000",
  android: "jmc_signup_10000",
  default: "jmc_signup_10000",
})!;

let isConnected = false;

export async function initIAP() {
  if (!InAppPurchases || isConnected) return;
  try {
    await InAppPurchases.connectAsync();
    isConnected = true;
  } catch {
    // 시뮬레이터 또는 Expo Go
  }
}

export async function purchaseSignup(): Promise<{
  success: boolean;
  receipt?: string;
  error?: string;
}> {
  if (!InAppPurchases) {
    // Expo Go 개발 모드: 결제 없이 통과
    return { success: true, receipt: "dev_mode_receipt" };
  }

  try {
    await initIAP();

    const { responseCode, results } = await InAppPurchases.getProductsAsync([
      SIGNUP_PRODUCT_ID,
    ]);

    if (responseCode !== InAppPurchases.IAPResponseCode.OK || !results?.length) {
      return { success: false, error: "상품을 찾을 수 없습니다" };
    }

    await InAppPurchases.purchaseItemAsync(SIGNUP_PRODUCT_ID);

    return new Promise((resolve) => {
      InAppPurchases.setPurchaseListener(({ responseCode, results }: any) => {
        if (
          responseCode === InAppPurchases.IAPResponseCode.OK &&
          results?.length
        ) {
          const purchase = results[0];
          InAppPurchases.finishTransactionAsync(purchase, true);
          resolve({
            success: true,
            receipt: purchase.transactionReceipt || purchase.purchaseToken,
          });
        } else {
          resolve({
            success: false,
            error:
              responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED
                ? "결제가 취소되었습니다"
                : "결제에 실패했습니다",
          });
        }
      });
    });
  } catch (e: any) {
    return { success: false, error: e.message || "결제 처리 중 오류" };
  }
}

export async function disconnectIAP() {
  if (!InAppPurchases || !isConnected) return;
  try {
    await InAppPurchases.disconnectAsync();
    isConnected = false;
  } catch {
    // 무시
  }
}
