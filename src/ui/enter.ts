import { Platform } from "react-native";
import { FadeInDown, SlideInUp, ZoomIn } from "react-native-reanimated";

/**
 * Entrance animations that work on every platform.
 *
 * On iOS and Android these are springs — a pop that overshoots a hair and
 * settles, which is what makes a check mark feel placed. On the web,
 * Reanimated turns a spring-configured entrance into a custom keyframe and its
 * clean-up path throws (`setElementPosition` on a missing snapshot), leaving
 * the element invisible. So the web gets the same motion, timed instead of
 * sprung, through the predefined keyframes that work.
 */
const web = Platform.OS === "web";

/** A small thing arriving: a check, a badge, a tick. */
export const pop = (delay = 0, damping = 14) => (web ? ZoomIn.delay(delay).duration(260) : ZoomIn.delay(delay).springify().damping(damping));

/** A card or tile rising into place. */
export const rise = (delay = 0) => (web ? FadeInDown.delay(delay).duration(380) : FadeInDown.delay(delay).springify().damping(18));

/** A toast dropping in from the top. */
export const drop = () => (web ? SlideInUp.duration(320) : SlideInUp.springify().damping(18).stiffness(180));
