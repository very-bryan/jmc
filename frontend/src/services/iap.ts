import * as InAppPurchases from "expo-in-app-purchases";
import { Platform } from "react-native";

const SIGNUP_PRODUCT_ID = Platform.select({
  ios: "com.jmc.signup.10000",
  android: "jmc_signup_10000",
  default: "jmc_signup_10000",
})!;

let isConnected = false;

export async function initIAP() {
  if (isConnected) return;
  try {
    await InAppPurchases.connectAsync();
    isConnected = true;
  } catch {
    // 이미 연결되어 있거나 시뮬레이터
  }
}

export async function purchaseSignup(): Promise<{
  success: boolean;
  receipt?: string;
  error?: string;
}> {
  try {
    await initIAP();

    const { responseCode, results } = await InAppPurchases.getProductsAsync([
      SIGNUP_PRODUCT_ID,
    ]);

    if (responseCode !== InAppPurchases.IAPResponseCode.OK || !results?.length) {
      return { success: false, error: "상품을 찾을 수 없습니다" };
    }

    await InAppPurchases.purchaseItemAsync(SIGNUP_PRODUCT_ID);

    // 구매 결과는 리스너로 받아야 함
    return new Promise((resolve) => {
      InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
        if (
          responseCode === InAppPurchases.IAPResponseCode.OK &&
          results?.length
        ) {
          const purchase = results[0];

          // 소비형 상품이므로 finishTransaction 호출
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
  if (!isConnected) return;
  try {
    await InAppPurchases.disconnectAsync();
    isConnected = false;
  } catch {
    // 무시
  }
}
