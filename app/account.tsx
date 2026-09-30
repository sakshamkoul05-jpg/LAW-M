import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, type IconName } from "@/icons/Icon";
import { Avatar, Chip, Glass, IconTile, T, Touch } from "@/components/ui";
import { rupees } from "@/components/Money";
import { Screen, StackHeader } from "@/components/Screen";
import { Sheet } from "@/components/Sheet";
import { useLock } from "@/lib/lock";
import { color as C, gradient, radius, space, text } from "@/theme";
import { SAMPLE_BALANCE_PAISE, profile } from "@/data/sample";

/**
 * Your account — the website's profile hub, group for group.
 *
 * The groups and their wording follow the client's blueprint, as lawfic.pro
 * does. Rows with nothing behind them yet are drawn and marked "Soon" rather
 * than linked: a settings list whose rows lead nowhere is worse than one that
 * says plainly which parts exist.
 *
 * The photo is real on a phone: the camera or the library, cropped square by
 * the system picker. Uploading it waits for the API — this is the front end.
 */

type Row = { icon: IconName; label: string; meta?: string; to?: string; soon?: boolean; danger?: boolean; onPress?: () => void };

export default function Account() {
  const router = useRouter();
  const lock = useLock();
  const [photo, setPhoto] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (source: "camera" | "library") => {
    setPicker(false);
    setError(null);
    const perm =
      source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(source === "camera" ? "Camera access was not allowed. You can change that in Settings." : "Photo access was not allowed.");
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85, exif: false };
    const r = source === "camera" ? await ImagePicker.launchCameraAsync({ ...opts, cameraType: ImagePicker.CameraType.front }) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!r.canceled && r.assets[0]) setPhoto(r.assets[0].uri);
  };

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: "Profile",
      rows: [
        { icon: "account", label: "Name", meta: profile.name },
        { icon: "camera", label: "Change profile & cover pics", onPress: () => setPicker(true) },
        { icon: "phone", label: "Mobile number", meta: profile.phone },
        { icon: "mail", label: "Email ID & website", meta: profile.email },
      ],
    },
    {
      title: "Wallet",
      rows: [
        { icon: "wallet", label: "Wallet balance", meta: lock.enabled && !lock.unlocked ? "Locked" : rupees(SAMPLE_BALANCE_PAISE), to: "/wallet" },
        { icon: "faceid", label: `Lock with ${lock.available ? lock.label : "Face ID"}`, meta: lock.enabled ? "On" : "Off", to: "/wallet" },
        { icon: "statement", label: "Transaction history", to: "/wallet" },
        { icon: "statement", label: "Download wallet statement", to: "/wallet" },
        { icon: "bolt", label: "Wallet auto reload money", soon: true },
        { icon: "gift", label: "Refer friend & earn", to: "/wallet" },
      ],
    },
    {
      title: "Your money",
      rows: [
        { icon: "wallet", label: "LAWFIC wallet", meta: "Connected" },
        { icon: "business", label: "Bank, RD, insurance, post office", meta: "Not linked" },
      ],
    },
    {
      title: "More",
      rows: [
        { icon: "chart", label: "Dashboard preference", soon: true },
        { icon: "pin", label: "Address", soon: true },
        { icon: "star", label: "Wish list", soon: true },
        { icon: "shield", label: "Account privacy", soon: true },
        { icon: "legal", label: "Your storage file", soon: true },
        { icon: "orders", label: "Your offline file", soon: true },
        { icon: "star", label: "Reviews", to: "/reviews" },
      ],
    },
    { title: "", rows: [{ icon: "logout", label: "Log out", danger: true, onPress: () => router.replace("/sign-in") }] },
  ];

  return (
    <Screen aurora={null} tabbed={false}>
      {/* the cover */}
      <View style={styles.cover}>
        <LinearGradient colors={gradient.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={["rgba(6,6,9,0)", C.void]} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0.3 }} end={{ x: 0.5, y: 1 }} />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <StackHeader right="settings" rightLabel="Settings" />
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.who}>
        <Touch onPress={() => setPicker(true)} accessibilityLabel="Change profile picture" scaleTo={0.94}>
          <View style={styles.avatarRing}>
            {photo ? <Image source={{ uri: photo }} style={styles.avatar} /> : <Avatar name={profile.first} size={96} />}
          </View>
          <View style={styles.cam}>
            <Icon name="camera" size={15} color={C.goldInk} />
          </View>
        </Touch>
        <T.Title style={{ marginTop: space.md }}>{profile.name}</T.Title>
        <T.Small style={{ marginTop: 2 }}>Welcome to the LAWFIC family.</T.Small>
        <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.md }}>
          <Chip tone={profile.member ? "violet" : "neutral"} icon="crown">
            {profile.member ? "Member" : "Not a member"}
          </Chip>
          <Chip icon="calendar">Since {profile.memberSince}</Chip>
        </View>
        {error && <T.Small tone={C.red} style={{ marginTop: space.sm }}>{error}</T.Small>}
      </Animated.View>

      <View style={{ paddingHorizontal: space.lg, gap: space.xl, marginTop: space.xl }}>
        {groups.map((g, gi) => (
          <Animated.View key={g.title || "end"} entering={FadeInDown.delay(60 + gi * 50).duration(360)}>
            {g.title ? <T.Label style={{ marginBottom: space.sm, marginLeft: 4 }}>{g.title}</T.Label> : null}
            <Glass padded={false} style={{ borderRadius: radius.lg }}>
              {g.rows.map((r, i) => {
                const inert = r.soon && !r.onPress;
                const inner = (
                  <View style={[styles.row, i > 0 && styles.rule, inert && { opacity: 0.55 }]}>
                    <IconTile icon={r.icon} tone={r.danger ? "red" : "neutral"} size={36} />
                    <Text style={[text.bodySemi, { color: r.danger ? C.red : C.text, flex: 1 }]} numberOfLines={1}>
                      {r.label}
                    </Text>
                    {r.meta && (
                      <Text style={[text.small, { color: r.meta === "Not linked" ? C.textFaint : C.textDim }]} numberOfLines={1}>
                        {r.meta}
                      </Text>
                    )}
                    {r.soon ? <Chip>Soon</Chip> : !r.danger && <Icon name="chevron" size={15} color={C.textFaint} />}
                  </View>
                );
                return inert ? (
                  <View key={r.label} accessible accessibilityLabel={`${r.label}. Not available yet.`}>{inner}</View>
                ) : (
                  <Touch key={r.label} accessibilityLabel={r.label} onPress={r.onPress ?? (() => r.to && router.push(r.to as never))}>
                    {inner}
                  </Touch>
                );
              })}
            </Glass>
            {g.title === "Your money" && (
              <T.Tiny style={{ marginTop: space.sm, marginHorizontal: 4, lineHeight: 15 }}>
                Reading a balance at a bank, insurer or post office needs an RBI-licensed Account Aggregator and your
                consent. LAWFIC is not one, so it shows only its own wallet.
              </T.Tiny>
            )}
          </Animated.View>
        ))}
        <T.Tiny style={{ textAlign: "center" }}>LAWFIC [version] · front-end preview</T.Tiny>
      </View>

      <Sheet open={picker} onClose={() => setPicker(false)} title="Profile picture">
        <View style={{ gap: space.sm }}>
          <PickRow icon="camera" title="Take a photo" sub="Front camera, cropped square" onPress={() => pick("camera")} />
          <PickRow icon="image" title="Choose from gallery" sub="Any photo on this phone" onPress={() => pick("library")} />
          {photo && <PickRow icon="close" title="Remove" sub="Go back to your initial" danger onPress={() => { setPhoto(null); setPicker(false); }} />}
          <T.Tiny style={{ marginTop: space.sm, lineHeight: 15 }}>
            Location data is stripped from the photo before it is used. Nobody else can see your picture — LAWFIC has
            no public profiles.
          </T.Tiny>
        </View>
      </Sheet>
    </Screen>
  );
}

function PickRow({ icon, title, sub, onPress, danger }: { icon: IconName; title: string; sub: string; onPress: () => void; danger?: boolean }) {
  return (
    <Touch onPress={onPress} accessibilityLabel={title} style={styles.pick}>
      <IconTile icon={icon} tone={danger ? "red" : "gold"} />
      <View style={{ flex: 1 }}>
        <Text style={[text.subhead, { color: danger ? C.red : C.text }]}>{title}</Text>
        <Text style={[text.small, { color: C.textFaint, marginTop: 1 }]}>{sub}</Text>
      </View>
    </Touch>
  );
}

const styles = StyleSheet.create({
  cover: { height: 190, marginTop: -60 },
  who: { alignItems: "center", marginTop: -58, paddingHorizontal: space.lg },
  avatarRing: { padding: 4, borderRadius: 54, backgroundColor: C.void },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  cam: {
    position: "absolute",
    right: 2,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: C.void,
  },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.md, paddingVertical: 11 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.hairline },
  pick: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: C.glass, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairline },
});
