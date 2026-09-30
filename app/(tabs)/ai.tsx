import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop } from "react-native-svg";
import { STATUS_META } from "@/lawfic/orders";
import { Icon } from "@/icons/Icon";
import { useLayout } from "@/components/AppWidth";
import { isActive, useStore } from "@/lib/store";
import { askPanda, appPathFor, PANDA_ERROR_COPY, type PandaError, type Turn } from "@/lib/panda";
import { serviceName } from "@/data/catalogue";
import { Dots, Glow, IconButton, Press, T } from "@/ui";
import { color as C, font, radius as R, space, text } from "@/theme";

type Msg = Turn & { id: string; error?: PandaError; context?: string };

const STARTERS = [
  "Do I need GST registration to sell online?",
  "What does Udyam registration cost?",
  "The name on my PAN is spelt wrong. What now?",
  "Which membership plan suits a small shop?",
];

/**
 * LAWFiC AI.
 *
 * The same assistant as the website's Panda, answering from the website's own
 * catalogue, fees and rules — it is the website's endpoint. It explains; it
 * does not advise. That line is stated under the composer, not hidden in a
 * policy page, because it is the most important thing to know about it.
 *
 * CONTEXT, HONESTLY
 *
 * The assistant cannot see your account. When you ask about one of your own
 * filings, the app sends the filing's name and status with the question —
 * visibly, in a chip on your message — and nothing else.
 */
export default function Assistant() {
  const router = useRouter();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const scroll = useRef<ScrollView>(null);

  const mine = state.orders.filter(isActive).slice(0, 2);

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [msgs]);

  const send = async (question: string, context?: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setDraft("");
    const user: Msg = { id: `u${Date.now()}`, role: "user", content: q, context };
    const reply: Msg = { id: `a${Date.now()}`, role: "assistant", content: "" };
    const history: Turn[] = [...msgs.filter((m) => !m.error && m.content), user].map((m) => ({
      role: m.role,
      content: m.role === "user" && (m as Msg).context ? `${(m as Msg).context}\n\n${m.content}` : m.content,
    }));
    setMsgs((cur) => [...cur, user, reply]);
    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;
    const r = await askPanda(history, (d) => setMsgs((cur) => cur.map((m) => (m.id === reply.id ? { ...m, content: m.content + d } : m))), ctrl.signal);
    if (!r.ok) setMsgs((cur) => cur.map((m) => (m.id === reply.id ? { ...m, error: r.error } : m)));
    setBusy(false);
  };

  const stop = () => abort.current?.abort();
  const retry = () => {
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMsgs((cur) => cur.slice(0, cur.lastIndexOf(lastUser)));
    void send(lastUser.content, lastUser.context);
  };

  const open = (path: string) => {
    const app = appPathFor(path);
    if (app) router.push(app as never);
    else Linking.openURL(`https://lawfic.pro${path}`).catch(() => {});
  };

  const empty = msgs.length === 0;
  const wide = layout !== "compact";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Glow height={520} strength={1.3} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
          <View style={styles.column}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.xl }}>
              <View style={{ flex: 1 }}>
                <T v="label" tone="gold">
                  Assistant
                </T>
                <T v="title3">LAWFiC AI</T>
              </View>
              {!empty && <IconButton icon="refresh" label="New conversation" onPress={() => (busy ? stop() : setMsgs([]))} />}
            </View>
          </View>
        </View>

        <ScrollView ref={scroll} contentContainerStyle={[styles.column, { padding: space.xl, paddingBottom: space.xl, flexGrow: 1 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {empty ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: space.section }}>
              <Orb size={wide ? 150 : 128} />
              <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ alignItems: "center", marginTop: space.xxl }}>
                <T v="label" tone="gold">
                  Ask LAWFiC AI
                </T>
                <T v={wide ? "display" : "title1"} center style={{ marginTop: 8, maxWidth: 520 }}>
                  What can we help you file?
                </T>
                <T v="body" center style={{ marginTop: 8, maxWidth: 440 }}>
                  Which registration you need, what it costs, what to keep ready. Answers come from LAWFiC's own service catalogue.
                </T>
              </Animated.View>

              {mine.length > 0 && (
                <View style={{ width: "100%", maxWidth: 560, marginTop: space.xxl, gap: space.sm }}>
                  <T v="label" style={{ marginLeft: 4 }}>
                    About your filings
                  </T>
                  {mine.map((o, i) => (
                    <Animated.View key={o.id} entering={FadeInDown.delay(250 + i * 60)}>
                      <Prompt
                        icon="filings"
                        text={`What happens next with my ${serviceName(o.service_slug)}?`}
                        onPress={() =>
                          send(`What happens next with my ${serviceName(o.service_slug)}, and is there anything I should do?`, `About my filing: ${serviceName(o.service_slug)} — status "${STATUS_META[o.status].label}" (${STATUS_META[o.status].blurb})`)
                        }
                      />
                    </Animated.View>
                  ))}
                </View>
              )}

              <View style={{ width: "100%", maxWidth: 560, marginTop: space.xl, gap: space.sm }}>
                <T v="label" style={{ marginLeft: 4 }}>
                  People often ask
                </T>
                {STARTERS.map((s, i) => (
                  <Animated.View key={s} entering={FadeInDown.delay(320 + i * 60)}>
                    <Prompt icon="panda" text={s} onPress={() => send(s)} />
                  </Animated.View>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ gap: space.lg }}>
              {msgs.map((m) =>
                m.role === "user" ? (
                  <Animated.View key={m.id} entering={FadeInUp.duration(260)} style={{ alignItems: "flex-end", gap: 6 }}>
                    {m.context && (
                      <View style={styles.ctx}>
                        <Icon name="filings" size={11} color={C.gold} />
                        <T v="micro" tone="gold" numberOfLines={1}>
                          Sent with your filing's name and status
                        </T>
                      </View>
                    )}
                    <View style={styles.me}>
                      <T v="callout" tone="text">
                        {m.content}
                      </T>
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View key={m.id} entering={FadeIn.duration(260)} style={{ flexDirection: "row", gap: space.md }}>
                    <Orb size={30} still />
                    <View style={{ flex: 1, paddingTop: 4 }}>
                      {m.error ? (
                        <View style={styles.err}>
                          <T v="callout" tone={m.error === "aborted" ? "muted" : "text"}>
                            {m.content ? `${m.content}\n\n` : ""}
                            {PANDA_ERROR_COPY[m.error]}
                          </T>
                          {m.error !== "aborted" && (
                            <Press onPress={retry} radius={10} accessibilityLabel="Try again" style={styles.retry}>
                              <Icon name="refresh" size={14} color={C.gold} />
                              <T v="captionMedium" tone="gold">
                                Try again
                              </T>
                            </Press>
                          )}
                        </View>
                      ) : m.content ? (
                        <Answer text={m.content} onLink={open} />
                      ) : (
                        <View style={{ paddingVertical: 6 }}>
                          <Dots color={C.gold} size={6} />
                        </View>
                      )}
                    </View>
                  </Animated.View>
                ),
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.column, { paddingHorizontal: space.lg, paddingBottom: wide ? space.xl : insets.bottom + 96 }]}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask about a filing, a fee, a document…"
              placeholderTextColor={C.textMuted}
              selectionColor={C.gold}
              multiline
              maxLength={2000}
              onSubmitEditing={() => send(draft)}
              blurOnSubmit
              accessibilityLabel="Ask LAWFiC AI"
              style={[styles.input, Platform.OS === "web" && ({ outlineStyle: "none" } as object)]}
            />
            <Press
              onPress={busy ? stop : () => send(draft)}
              disabled={!busy && !draft.trim()}
              radius={21}
              haptic="medium"
              accessibilityLabel={busy ? "Stop" : "Send"}
              style={[styles.send, !busy && !draft.trim() && { backgroundColor: C.surfaceTop }]}
            >
              <Icon name={busy ? "close" : "arrowUpRight"} size={18} color={busy || draft.trim() ? C.ink : C.textMuted} strokeWidth={2.2} />
            </Press>
          </View>
          <T v="micro" center style={{ marginTop: 8 }}>
            LAWFiC AI explains LAWFiC's services. It is not legal advice — for your case, talk to the team.
          </T>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Prompt({ icon, text: t, onPress }: { icon: "panda" | "filings"; text: string; onPress: () => void }) {
  return (
    <Press onPress={onPress} radius={R.lg} accessibilityLabel={t} style={styles.prompt}>
      <Icon name={icon} size={16} color={C.gold} />
      <T v="calloutMedium" style={{ flex: 1 }}>
        {t}
      </T>
      <Icon name="arrowUpRight" size={15} color={C.textMuted} />
    </Press>
  );
}

/** An answer, with any site path in it turned into a tappable link. */
function Answer({ text: t, onLink }: { text: string; onLink: (p: string) => void }) {
  const parts = t.split(/(\/[a-z0-9][a-z0-9\-/#]*[a-z0-9])/gi);
  const links = Array.from(new Set(parts.filter((p) => /^\/[a-z]/i.test(p))));
  return (
    <View>
      <T v="body" tone="text" selectable>
        {parts.map((p, i) =>
          /^\/[a-z]/i.test(p) ? (
            <T key={i} v="body" tone="gold" onPress={() => onLink(p)} style={{ textDecorationLine: "underline" }}>
              {p}
            </T>
          ) : (
            p
          ),
        )}
      </T>
      {links.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: space.md }}>
          {links.slice(0, 3).map((l) => (
            <Press key={l} onPress={() => onLink(l)} radius={14} accessibilityLabel={`Open ${l}`} style={styles.linkChip}>
              <Icon name={appPathFor(l) ? "forward" : "external"} size={13} color={C.gold} />
              <T v="captionMedium" tone="gold">
                {labelFor(l)}
              </T>
            </Press>
          ))}
        </View>
      )}
    </View>
  );
}

function labelFor(path: string): string {
  const slug = path.split("/").filter(Boolean).pop() ?? path;
  if (path.startsWith("/services/") || path.startsWith("/document/")) return serviceName(slug);
  const map: Record<string, string> = { pricing: "Membership plans", "instant-help": "Talk to the team", contact: "Contact", wallet: "Wallet", topup: "Add money", services: "All services", document: "Documents" };
  return map[slug] ?? slug.replace(/-/g, " ");
}

/**
 * The orb: a sphere of warm light that breathes. Slow — a four-second breath —
 * because an assistant that pulses quickly reads as anxious.
 */
function Orb({ size, still }: { size: number; still?: boolean }) {
  const b = useSharedValue(0);
  const r = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    b.value = withRepeat(withSequence(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })), -1);
    r.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1);
  }, [still, b, r]);
  const breathe = useAnimatedStyle(() => ({ transform: [{ scale: 1 + b.value * 0.04 }] }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + b.value * 0.35, transform: [{ scale: 1.15 + b.value * 0.1 }] }));
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 360}deg` }] }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }} accessibilityElementsHidden>
      {!still && (
        <Animated.View style={[StyleSheet.absoluteFill, halo]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0.55" stopColor="#C6A15B" stopOpacity={0.22} />
                <Stop offset="1" stopColor="#C6A15B" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#halo)" />
          </Svg>
        </Animated.View>
      )}
      <Animated.View style={[{ width: size * 0.78, height: size * 0.78 }, breathe]}>
        <Svg width={size * 0.78} height={size * 0.78}>
          <Defs>
            <RadialGradient id={`core${size}`} cx="35%" cy="30%" r="75%">
              <Stop offset="0" stopColor="#FFF1CF" />
              <Stop offset="0.35" stopColor="#E0C783" />
              <Stop offset="0.75" stopColor="#8F6E32" />
              <Stop offset="1" stopColor="#2A1F0E" />
            </RadialGradient>
          </Defs>
          <Circle cx={size * 0.39} cy={size * 0.39} r={size * 0.39} fill={`url(#core${size})`} />
        </Svg>
        {!still && (
          <Animated.View style={[StyleSheet.absoluteFill, spin]}>
            <Svg width={size * 0.78} height={size * 0.78}>
              <Defs>
                <LinearGradient id="band" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
                  <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.28} />
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Circle cx={size * 0.39} cy={size * 0.39} r={size * 0.3} stroke="url(#band)" strokeWidth={size * 0.05} fill="none" />
            </Svg>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line, paddingBottom: space.md },
  column: { width: "100%", maxWidth: 760, alignSelf: "center" },
  prompt: { flexDirection: "row", alignItems: "center", gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14, borderRadius: R.lg, backgroundColor: C.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  me: { maxWidth: "84%", paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, borderBottomRightRadius: 6, backgroundColor: C.surfaceTop, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  ctx: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: C.goldWash },
  err: { padding: space.md, borderRadius: R.md, backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  retry: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: space.md, paddingVertical: 4 },
  linkChip: { flexDirection: "row", alignItems: "center", gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: C.goldWash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.goldLine },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 6, paddingLeft: space.lg, borderRadius: 28, backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.lineStrong },
  input: { flex: 1, ...text.body, color: C.text, maxHeight: 130, paddingVertical: 10, fontFamily: font.regular },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.gold, alignItems: "center", justifyContent: "center" },
});

