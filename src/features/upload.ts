import * as ImagePicker from "expo-image-picker";

/**
 * Adding a document: a photo of it, from the camera or the library.
 *
 * The file stays on this device. It is not uploaded anywhere — there is no
 * account connection in the preview, and a document vault that silently sent
 * someone's papers to a server would be the worst possible surprise. When the
 * backend lands, this is where the private-storage upload goes, into the same
 * bucket the website uses (signed URLs, never public).
 */
export async function pickDocument(source: "camera" | "library"): Promise<{ uri: string; name: string } | { error: string } | null> {
  try {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { error: "Camera access is off for LAWFIC. You can turn it on in Settings." };
      const r = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
      if (r.canceled || !r.assets[0]) return null;
      return { uri: r.assets[0].uri, name: nameFor(r.assets[0].fileName) };
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return { error: "Photo access is off for LAWFIC. You can turn it on in Settings." };
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (r.canceled || !r.assets[0]) return null;
    return { uri: r.assets[0].uri, name: nameFor(r.assets[0].fileName) };
  } catch {
    return { error: "That did not work. Please try again." };
  }
}

function nameFor(fileName?: string | null): string {
  if (fileName) return fileName.replace(/\.[a-z0-9]+$/i, "");
  const d = new Date();
  return `Scan ${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}
