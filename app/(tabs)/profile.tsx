import React, { useState } from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { ACCOUNT_GROUPS, MONEY_ROWS, type AccountRow } from "@/lawfic/account-sections";
import { company } from "@/lawfic/company";
import { Icon, type IconName } from "@/icons/Icon";
import { useStore, useMembership } from "@/lib/store";
import { useLock } from "@/lib/lock";
import { useAuth } from "@/lib/auth";
import { dateLong, rupees } from "@/lib/format";
import { Avatar, Badge, Button, Chip, Group, Press, Reveal, Row, Screen, SectionHeader, Sheet, Surface, Switch, T, useToast } from "@/ui";
import { color as C, radius as R, space, themed, gradient } from "@/theme";

/** Website paths → app screens. A row with no mapping and no href is not built. */
const ROUTE: Record<string, string> = {
  "/profile/edit": "/profile/edit",
  "/wallet": "/wallet",
  "/wallet/transactions": "/wallet",
  "/profile/preferences": "/preferences",
  "/wishlist": "/wishlist",
};

const GROUP_ICON: Record<string, IconName> = {
  profile: "account",
  wallet: "wallet",
  dashboard: "home",
  address: "pin",
  wishlist: "heart",
  privacy: "shield",
  storage: "vault",
  offline: "store",
};

/**
 * Profile — the customer profile exactly as the client laid it out on the
 * website (lib/account-sections.ts: nine groups, their wording). A row with a
 * page behind it opens it. A row without one says "Not built yet" and does
 * nothing — a settings list that leads to dead ends is worse than one that is
 * honest about which parts exist.
 */
export default function Profile() {
  const router = useRouter();
  const toast = useToast();
  const { state, balance, updateProfile, reset, mode } = useStore();
  const auth = useAuth();
  const router_ = router;
  const { entitled, plan, sub } = useMembership();
  const lock = useLock();
  const [photo, setPhoto] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const p = state.profile;

  const choose = async (source: "camera" | "library") => {
    setPhoto(false);
    const perm = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return toast({ title: `${source === "camera" ? "Camera" : "Photo"} access is off`, body: "Turn it on in Settings to choose a photo.", tone: "bad" });
    const opts: ImagePicker.ImagePickerOptions = { allowsEditing: true, aspect: [1, 1], quality: 0.8, mediaTypes: ["images"] };
    const r = source === "camera" ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (r.canceled || !r.assets[0]) return;
    updateProfile({ photoUri: r.assets[0].uri });
    toast({ title: "Photo updated", body: "It shows on Home and here. It stays on this phone." });
  };

  const rowFor = (row: AccountRow, i: number) => {
    if (row.action === "signout") return null;
    if (row.label === "Change Profile & Cover Pics") {
      return <Row key={i} title={row.label} subtitle={row.note} onPress={() => setPhoto(true)} />;
    }
    if (row.label === "Wallet Balance") {
      return <Row key={i} title={row.label} trailing={lock.enabled && !lock.unlocked ? "Locked" : rupees(balance)} onPress={() => router.push("/wallet")} />;
    }
    if (row.label === "Download Wallet Statement") {
      return <Row key={i} title={row.label} subtitle="Share or save it from your wallet" onPress={() => router.push("/wallet?statement=1")} />;
    }
    if (row.href === "/legal/privacy") {
      return <Row key={i} title={row.label} trailingNode={<Icon name="external" size={15} color={C.textMuted} />} onPress={() => Linking.openURL("https://lawfic.pro/legal/privacy")} />;
    }
    const to = row.href ? ROUTE[row.href] : undefined;
    if (to) return <Row key={i} title={row.label} subtitle={row.note} onPress={() => router.push(to as never)} />;
    return <Row key={i} title={row.label} subtitle={row.note} trailingNode={<Chip label="Not built yet" />} />;
  };

  return (
    <Screen tabbed title="Profile" glow={false}>
      <Reveal fade>
        <View style={styles.hero}>
          <LinearGradient colors={gradient.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.heroRule} />
          <Press onPress={() => setPhoto(true)} radius={48} accessibilityLabel="Change profile photo" style={{ alignSelf: "center" }}>
            <Avatar name={p.fullName} uri={p.photoUri} size={92} ring />
            <View style={styles.cam}>
              <Icon name="camera" size={14} color={C.ink} strokeWidth={2} />
            </View>
          </Press>
          <T v="title2" center style={{ marginTop: space.lg }}>
            {p.fullName || "Add your name"}
          </T>
          <T v="caption" center style={{ marginTop: 4 }}>
            With LAWFIC since {dateLong(p.memberSince)}
          </T>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: space.md }}>
            <Badge label={entitled ? `${plan?.name} member` : "Pay per filing"} tone={entitled ? "gold" : "neutral"} icon={entitled ? "crown" : undefined} />
            {lock.enabled && <Badge label={`${lock.label} on`} tone="good" icon="shield" />}
          </View>
          <Button label="Edit profile" icon="edit" variant="secondary" size="sm" full={false} onPress={() => router.push("/profile/edit")} style={{ alignSelf: "center", marginTop: space.lg }} />
        </View>
      </Reveal>

      <Reveal i={1}>
        <Press onPress={() => router.push("/membership")} radius={R.xl} accessibilityLabel="Membership" style={{ marginTop: space.xl }}>
          <Surface tone="gold" style={styles.member}>
            <Icon name="crown" size={22} color={C.gold} />
            <View style={{ flex: 1 }}>
              <T v="headline">{entitled ? `${plan?.name} membership` : "Become a member"}</T>
              <T v="caption" tone="dim">
                {entitled ? (sub?.status === "cancelling" ? `Ends ${dateLong(sub.currentPeriodEnd)} — renewal cancelled` : `Renews ${dateLong(sub!.currentPeriodEnd)}`) : "From ₹99 a month. Discounts on every filing, a document vault, reminders."}
              </T>
            </View>
            <Icon name="chevron" size={16} color={C.gold} />
          </Surface>
        </Press>
      </Reveal>

      {ACCOUNT_GROUPS.map((g, gi) => (
        <Reveal key={g.id} i={gi + 2} style={{ marginTop: space.xxl }}>
          <View style={styles.groupHead}>
            <Icon name={GROUP_ICON[g.id] ?? "settings"} size={15} color={C.textMuted} />
            <T v="label">{g.title.replace("{name}", p.fullName.split(" ")[0] ?? "")}</T>
          </View>
          <Group>{g.rows.map(rowFor)}</Group>
        </Reveal>
      ))}

      <Reveal style={{ marginTop: space.xxl }}>
        <SectionHeader kicker="Your money" title="Money summary" />
        <Group>
          {MONEY_ROWS.map((m) =>
            m.source === "wallet" ? (
              <Row key={m.label} icon="wallet" gold title={m.label} trailing={lock.enabled && !lock.unlocked ? "Locked" : rupees(balance)} onPress={() => router.push("/wallet")} />
            ) : (
              <Row key={m.label} icon="bank" title={m.label} trailingNode={<Chip label="Not connected" />} />
            ),
          )}
        </Group>
        <T v="caption" style={{ marginTop: space.sm, marginHorizontal: 4 }}>
          LAWFIC can only show its own wallet. Reading a bank or deposit balance needs an RBI-licensed Account Aggregator and your consent, which LAWFIC does not have — so those rows stay empty rather than guess.
        </T>
      </Reveal>

      <Reveal style={{ marginTop: space.xxl }}>
        <SectionHeader kicker="Security" title="Keeping it yours" />
        <Group>
          <Row
            icon="faceid"
            gold={lock.enabled}
            title={`Lock the wallet with ${lock.available ? lock.label : "Face ID or fingerprint"}`}
            subtitle={lock.available ? "Balances and payments stay hidden until it is you." : Platform.OS === "web" ? "Available in the installed app on your phone." : "Set up Face ID or a fingerprint on this phone first."}
            trailingNode={
              <Switch
                label="Wallet lock"
                value={lock.enabled}
                disabled={!lock.available}
                onChange={(on) => {
                  if (on) void lock.enable().then((ok) => ok && toast({ title: "Wallet locked to you", icon: "shield" }));
                  else lock.disable();
                }}
              />
            }
          />
          <Row icon="phone" title="Sign-in" subtitle="A one-time code to your mobile. There is no password to steal or forget." />
          <Row icon="key" title="Passkeys" subtitle="Set up on lawfic.pro — Face ID or fingerprint for the website's wallet." trailingNode={<Icon name="external" size={15} color={C.textMuted} />} onPress={() => Linking.openURL("https://lawfic.pro/wallet")} />
        </Group>
      </Reveal>

      <Reveal style={{ marginTop: space.xxl }}>
        <SectionHeader kicker="Help" title="Support & about" />
        <Group>
          <Row icon="support" title="Talk to the team" subtitle={company.supportHours} onPress={() => router.push("/support")} />
          <Row icon="star" title="Reviews" onPress={() => router.push("/reviews")} />
          <Row icon="sunMoon" title="Appearance, Home & privacy" subtitle="Light or dark theme, Home sections, hidden balances" onPress={() => router.push("/preferences")} />
          <Row icon="scale" title="Terms of service" trailingNode={<Icon name="external" size={15} color={C.textMuted} />} onPress={() => Linking.openURL("https://lawfic.pro/legal/terms")} />
        </Group>
      </Reveal>

      <Reveal style={{ marginTop: space.xxl, gap: space.sm }}>
        {mode === "demo" && (
          <Surface tone="gold" style={{ gap: space.md, marginBottom: space.sm }}>
            <T v="headline">You are exploring the demo</T>
            <T v="callout">Sign in to your LAWFIC account to see your real filings, wallet and documents — the same account as lawfic.pro.</T>
            <Button
              label="Sign in or create an account"
              size="md"
              onPress={() => {
                auth.leaveDemo();
                router_.replace("/welcome");
              }}
            />
          </Surface>
        )}
        {mode === "demo" && <Button label="Reset demo data" icon="reset" variant="secondary" onPress={() => setConfirmReset(true)} />}
        <Button
          label={mode === "demo" ? "Leave the demo" : "Sign out"}
          icon="logout"
          variant="danger"
          onPress={async () => {
            lock.relock();
            await auth.signOut();
            router_.replace("/welcome");
          }}
        />
        <T v="caption" center style={{ marginTop: space.sm }}>
          {mode === "live" ? `Signed in as ${auth.email} · synced with lawfic.pro` : "LAWFIC · demo data, kept on this phone"}
        </T>
      </Reveal>

      <Sheet open={photo} onClose={() => setPhoto(false)} title="Profile photo" subtitle="Shown on Home and your profile. It stays on this phone.">
        <View style={{ gap: space.sm }}>
          <Button label="Take a photo" icon="camera" variant="secondary" onPress={() => choose("camera")} />
          <Button label="Choose from photos" icon="image" variant="secondary" onPress={() => choose("library")} />
          {p.photoUri && (
            <Button
              label="Remove photo"
              icon="trash"
              variant="danger"
              onPress={() => {
                updateProfile({ photoUri: null });
                setPhoto(false);
              }}
            />
          )}
        </View>
      </Sheet>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?" subtitle="Filings, wallet entries, messages and uploads go back to the starting sample. Your name and photo stay.">
        <View style={{ gap: space.sm }}>
          <Button
            label="Reset"
            variant="danger"
            onPress={() => {
              reset();
              setConfirmReset(false);
              toast({ title: "Demo data reset" });
            }}
          />
          <Button label="Keep everything" variant="ghost" onPress={() => setConfirmReset(false)} />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = themed(() => ({
  hero: { borderRadius: R.xxl, overflow: "hidden", paddingVertical: space.xxl, paddingHorizontal: space.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  heroRule: { position: "absolute", left: 24, right: 24, top: 0, height: 1, backgroundColor: "rgba(224,199,131,0.3)" },
  cam: { position: "absolute", right: 2, bottom: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: C.gold, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: C.bg },
  member: { flexDirection: "row", alignItems: "center", gap: space.md },
  groupHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: space.sm, marginLeft: 4 },
}));
