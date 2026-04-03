import client from "./client";

export async function uploadImage(
  uri: string,
  folder: string = "images"
): Promise<{ url: string; key: string } | null> {
  try {
    // Read file as base64
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const res = await client.post("/uploads/image", {
            base64,
            folder,
          });
          resolve(res.data);
        } catch (err: any) {
          console.warn("Upload failed:", err.message);
          resolve(null);
        }
      };
      reader.readAsDataURL(blob);
    });
  } catch (err: any) {
    console.warn("Image read failed:", err.message);
    return null;
  }
}
