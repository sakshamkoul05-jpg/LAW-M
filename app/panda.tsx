import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeInUp,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Touch } from "@/components/primitives";
import { color as C, font, radius, space, text } from "@/theme";

type Msg = { id: string; from: "panda" | "you"; body: string };

const OPENING: Msg = {
  id: "open",
  from: "panda",
  body:
    "Hello. I can explain any LAWFIC service, tell you what documents a filing needs, or check where your order has got to. What would you like to know?",
};

const SUGGESTIONS = [
  "Do I need GST registration?",
  "What does Udyam cost?",
  "Documents for a rent agreement",
];

/**
 * The Panda.
 *
 * THE FRONT END ONLY TALKS TO ITSELF
 *
 * There is no model behind this screen yet. Typing gets a fixed reply that says
 * so, in the Panda's own voice, rather than a canned answer that looks like
 * intelligence. A demo assistant that convincingly answers a legal question it
 * did not actually reason about is the single most dangerous thing this app
 * could ship — somebody will act on it.
 *
 * When the route on lawfic.pro (/api/panda, Groq) is wired in, `send` becomes a
 * fetch and the typing dots become real streaming. Nothing else on this screen
 * changes.
 */
export default function Panda() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scroller = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

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
          body:
            "I am not connected to my brain in this preview build, so I cannot answer that properly yet — and I would rather say so than guess at something you might act on. Once I am wired up I answer from what is actually on lawfic.pro: fees, documents, turnarounds and where your order has got to. I will not give legal or tax advice on your specific situation; for that I put you through to a person.",
        },
      ]);
    }, 900);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.void }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Touch onPress={() => router.back()} accessibilityLabel="Close" style={styles.back}>
          <Icon name="close" size={19} color={C.text} />
        </Touch>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <View style={styles.dot}>
            <LinearGradient
              colors={[C.pandaHot, C.pandaDeep]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            />
          </View>
          <View>
            <Text style={[text.bodySemi, { color: C.text }]}>Panda AI</Text>
            <Text style={[text.tiny, { color: C.textFaint }]}>Preview build</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: space.xl }}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => (
          <Animated.View key={m.id} entering={FadeInUp.duration(280)}>
            {m.from === "panda" ? (
              <View style={{ flexDirection: "row", gap: space.sm + 2, alignItems: "flex-start" }}>
                <View style={styles.avatar}>
                  <LinearGradient
                    colors={[C.pandaHot, C.pandaDeep]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                  />
                </View>
                <View style={styles.fromPanda}>
                  <Text style={[text.small, { color: C.text, lineHeight: 20 }]}>{m.body}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.fromYou}>
                <Text style={[text.small, { color: "#1A1405", lineHeight: 20 }]}>{m.body}</Text>
              </View>
            )}
          </Animated.View>
        ))}

        {thinking && <Typing />}
      </ScrollView>

      {messages.length === 1 && (
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <Touch
              key={s}
              onPress={() => send(s)}
              accessibilityLabel={s}
              style={styles.suggestion}
            >
              <Text style={[text.tiny, { color: C.textDim }]}>{s}</Text>
            </Touch>
          ))}
        </View>
      )}

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask anything"
          placeholderTextColor={C.textFaint}
          accessibilityLabel="Ask the Panda"
          style={styles.input}
          multiline
          onSubmitEditing={() => send(draft)}
        />
        <Touch
          onPress={() => send(draft)}
          disabled={!draft.trim()}
          haptic="medium"
          accessibilityLabel="Send"
          style={styles.send}
        >
          <Icon name="upload" size={18} color="#1A1405" />
        </Touch>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Three dots, each starting a third of a cycle after the last. */
function Typing() {
  return (
    <View style={{ flexDirection: "row", gap: space.sm + 2, alignItems: "center", marginLeft: 38 }}>
      <View style={[styles.fromPanda, { flexDirection: "row", gap: 5, paddingVertical: 14 }]}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 180} />
        ))}
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0.3);

  React.useEffect(() => {
    const t = setTimeout(() => {
      v.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }),
          withTiming(0.3, { duration: 420, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }),
        ),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, v]);

  const style = useAnimatedStyle(() => ({ opacity: v.value }));

  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.panda }, style]} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.hairline,
  },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -space.sm },
  dot: { width: 28, height: 28, borderRadius: 14, overflow: "hidden" },
  avatar: { width: 30, height: 30, borderRadius: 15, overflow: "hidden", marginTop: 2 },
  fromPanda: {
    flex: 1,
    backgroundColor: C.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    borderRadius: radius.md,
    borderTopLeftRadius: 4,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.md,
  },
  fromYou: {
    alignSelf: "flex-end",
    maxWidth: "82%",
    backgroundColor: C.gold,
    borderRadius: radius.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.md,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  suggestion: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    backgroundColor: C.surface,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm + 2,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.hairline,
    backgroundColor: C.ground,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    color: C.text,
    fontFamily: font.body,
    fontSize: 14.5,
    paddingHorizontal: space.md + 2,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: radius.md,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
});
