import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, FadeInUp, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { IconButton, T, Touch } from "@/components/ui";
import { Aurora } from "@/components/Aurora";
import { color as C, elevation, font, gradient, radius, space, text } from "@/theme";

type Msg = { id: string; from: "panda" | "you"; body: string };

const SUGGESTIONS = ["Do I need GST registration?", "What does Udyam cost?", "Documents for a rent agreement"];

/**
 * The Panda.
 *
 * This preview does not answer, and says so in the Panda's own voice. A demo
 * assistant that convincingly answers a tax question it did not reason about
 * is the most dangerous thing this app could ship — somebody will act on it.
 * When /api/panda on lawfic.pro is wired in, `send` becomes a fetch and the
 * dots become real streaming; nothing else here changes.
 */
export default function Panda() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scroller = useRef<ScrollView>(null);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: "o", from: "panda", body: "Hello. I can explain any LAWFIC service, tell you what a filing needs, or check where your order has got to. What would you like to know?" },
  ]);

  const send = (body: string) => {
    const t = body.trim();
    if (!t) return;
    setDraft("");
    setMessages((m) => [...m, { id: `y${m.length}`, from: "you", body: t }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          id: `p${m.length}`,
          from: "panda",
          body: "I am not connected to my brain in this preview, so I cannot answer that properly — and I would rather say so than guess at something you might act on. Once I am wired up I answer from what is actually on lawfic.pro. I will not give legal or tax advice on your own situation; for that I put you through to a person.",
        },
      ]);
    }, 1100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.void }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Aurora preset="violet" height={520} />
      <View style={[styles.head, { paddingTop: insets.top + space.sm }]}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <T.Sub>Panda</T.Sub>
          <T.Tiny>Preview · not connected</T.Tiny>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 1 && (
          <View style={{ alignItems: "center", marginVertical: space.xxl }}>
            <Orb />
            <T.Title style={{ marginTop: space.xl, textAlign: "center" }}>Ask me anything about a filing</T.Title>
          </View>
        )}
        {messages.map((m) => (
          <Animated.View key={m.id} entering={FadeInUp.duration(280)} style={m.from === "you" ? styles.youWrap : styles.pandaWrap}>
            {m.from === "you" ? (
              <View style={styles.you}>
                <LinearGradient colors={gradient.gold} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                <Text style={[text.body, { color: C.goldInk }]}>{m.body}</Text>
              </View>
            ) : (
              <View style={styles.panda}>
                <Text style={[text.body, { color: C.text, lineHeight: 22 }]}>{m.body}</Text>
              </View>
            )}
          </Animated.View>
        ))}
        {thinking && (
          <View style={[styles.panda, { flexDirection: "row", gap: 6, alignSelf: "flex-start", paddingVertical: 16 }]}>
            {[0, 1, 2].map((i) => <Dot key={i} delay={i * 170} />)}
          </View>
        )}
      </ScrollView>

      {messages.length === 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm, paddingBottom: space.md }}>
          {SUGGESTIONS.map((s) => (
            <Touch key={s} onPress={() => send(s)} accessibilityLabel={s} style={styles.sugg}>
              <Text style={[text.smallSemi, { color: C.text }]}>{s}</Text>
            </Touch>
          ))}
        </ScrollView>
      )}

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <TextInput value={draft} onChangeText={setDraft} placeholder="Ask anything" placeholderTextColor={C.textFaint} style={styles.input} accessibilityLabel="Ask the Panda" multiline onSubmitEditing={() => send(draft)} />
        <Touch onPress={() => send(draft)} disabled={!draft.trim()} haptic="medium" accessibilityLabel="Send" style={[styles.send, elevation.glowViolet]}>
          <LinearGradient colors={gradient.violet} style={StyleSheet.absoluteFill} />
          <Icon name="arrowUp" size={20} color="#fff" />
        </Touch>
      </View>
    </KeyboardAvoidingView>
  );
}

function Orb() {
  const b = useSharedValue(0);
  useEffect(() => {
    b.value = withRepeat(withSequence(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }), withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System })), -1);
  }, [b]);
  const s = useAnimatedStyle(() => ({ transform: [{ scale: 1 + b.value * 0.06 }] }));
  return (
    <Animated.View style={[styles.orb, elevation.glowViolet, s]}>
      <LinearGradient colors={gradient.violet} style={StyleSheet.absoluteFill} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} />
      <View style={styles.spec} />
      <Icon name="spark" size={40} color="#fff" active fill="rgba(255,255,255,0.3)" />
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0.3);
  useEffect(() => {
    const t = setTimeout(() => {
      v.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1);
    }, delay);
    return () => clearTimeout(t);
  }, [delay, v]);
  const s = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.violetHot }, s]} />;
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.lg, paddingBottom: space.sm },
  youWrap: { alignItems: "flex-end" },
  pandaWrap: { alignItems: "flex-start" },
  you: { maxWidth: "84%", padding: space.lg, borderRadius: radius.lg, borderBottomRightRadius: 6, overflow: "hidden" },
  panda: { maxWidth: "88%", padding: space.lg, borderRadius: radius.lg, borderBottomLeftRadius: 6, backgroundColor: C.glassHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairline },
  sugg: { paddingHorizontal: 16, height: 40, justifyContent: "center", borderRadius: 20, backgroundColor: C.glassHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairline },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.md },
  input: { flex: 1, minHeight: 50, maxHeight: 120, borderRadius: 25, paddingHorizontal: space.lg, paddingTop: 15, paddingBottom: 15, color: C.text, fontFamily: font.body, fontSize: 15, backgroundColor: C.glassHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: C.hairline },
  send: { width: 50, height: 50, borderRadius: 25, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  orb: { width: 110, height: 110, borderRadius: 55, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  spec: { position: "absolute", top: 14, left: 22, width: 32, height: 20, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.4)", transform: [{ rotate: "-24deg" }] },
});
