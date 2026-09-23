import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "@/icons/Icon";
import { Button, Label, Surface, Touch } from "@/components/primitives";
import { color as C, font, radius, space, text } from "@/theme";
import { getService } from "@/data/catalogue";

/**
 * Starting a filing.
 *
 * THE PROGRESS RAIL IS AT THE TOP AND IT IS HONEST
 *
 * "Step 1 of 3" and a third of a bar. Not a spinner, not an unnumbered stepper.
 * Somebody about to type their PAN into a phone wants to know how much more of
 * this there is before they start, and the answer is the difference between
 * finishing and abandoning.
 *
 * THE BUTTON SAYS WHAT IT WILL NOT DO
 *
 * "Continue — nothing is submitted yet". The single most common anxiety in a
 * government-filing flow is having accidentally filed something wrong. One line
 * under the button removes it, and costs nothing.
 */
export default function StartFiling() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const service = getService(String(slug));

  const [uploaded, setUploaded] = useState<string[]>([]);

  const docs = ["PAN of the business", "Aadhaar of the proprietor", "Bank account details"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.void }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Touch onPress={() => router.back()} accessibilityLabel="Back" style={styles.back}>
          <Icon name="back" size={20} color={C.text} />
        </Touch>
        <Text style={[text.small, { color: C.textDim, flex: 1 }]}>
          {service?.name ?? "Filing"} {"·"} step 1 of 3
        </Text>
      </View>

      <View style={styles.rail}>
        <View style={styles.railFill} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space.lg, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(340)}>
          <Text style={[text.title, { color: C.text }]}>Your details</Text>
          <Text style={[text.small, { color: C.textDim, marginTop: 6, lineHeight: 19 }]}>
            These go onto the government portal exactly as typed, so spellings
            must match your PAN.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(340)} style={{ marginTop: space.xl, gap: space.lg }}>
          <Field label="Name of the business" placeholder="As printed on the PAN" />
          <Field
            label="Aadhaar number"
            placeholder="0000 0000 0000"
            keyboardType="number-pad"
            hint="A masked number is fine. We do not store a photocopy."
          />
          <Field label="Business PAN" placeholder="ABCDE0000F" autoCapitalize="characters" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(340)} style={{ marginTop: space.xxl }}>
          <Label style={{ marginBottom: space.md }}>Documents</Label>
          <View style={{ gap: space.sm }}>
            {docs.map((d) => {
              const done = uploaded.includes(d);
              return (
                <Touch
                  key={d}
                  onPress={() =>
                    setUploaded((u) => (u.includes(d) ? u.filter((x) => x !== d) : [...u, d]))
                  }
                  accessibilityLabel={done ? `${d}, attached. Tap to remove.` : `Attach ${d}`}
                  style={[styles.upload, done && styles.uploadDone]}
                >
                  <Icon name={done ? "check" : "upload"} size={18} color={done ? C.green : C.textDim} />
                  <View style={{ flex: 1 }}>
                    <Text style={[text.small, { color: done ? C.green : C.text, fontFamily: font.bodySemi }]}>
                      {d}
                    </Text>
                    <Text style={[text.tiny, { color: done ? C.green : C.textFaint, marginTop: 1 }]}>
                      {done ? "[filename].pdf · [000] KB" : "Photo, PDF or scan"}
                    </Text>
                  </View>
                </Touch>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <Button
          label="Continue"
          sub="Nothing is submitted yet"
          onPress={() => router.push("/pay")}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  placeholder,
  hint,
  ...rest
}: React.ComponentProps<typeof TextInput> & { label: string; hint?: string }) {
  return (
    <View>
      <Text style={[text.tiny, { color: C.text, fontFamily: font.bodySemi, marginBottom: 7 }]}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.textFaint}
        accessibilityLabel={label}
        style={styles.input}
        {...rest}
      />
      {hint ? (
        <Text style={[text.tiny, { color: C.textFaint, marginTop: 6 }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginLeft: -space.sm },
  rail: { height: 3, backgroundColor: C.surfaceHigh },
  railFill: { width: "33%", height: "100%", backgroundColor: C.gold },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: C.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.hairline,
    paddingHorizontal: space.lg,
    color: C.text,
    fontFamily: font.body,
    fontSize: 15,
  },
  upload: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: 62,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.hairline,
    backgroundColor: C.surface,
  },
  uploadDone: {
    borderStyle: "solid",
    borderColor: "rgba(93,203,156,0.35)",
    backgroundColor: C.greenWash,
  },
  bar: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.hairline,
    backgroundColor: C.ground,
  },
});
