# LAWFIC — mobile app (front end)

The LAWFIC app: the same services, catalogue and wallet as lawfic.pro, built as
a native app with the motion and materials the client asked for.

**This is the front end only.** No API, no auth, no payments. Every balance,
order, date and order number on screen is a sample, and every screen that shows
one says so on the screen.

---

## Running it

```bash
npm install
```

```bash
npx expo install --fix
```

```bash
npx expo start
```

Then scan the QR code with Expo Go, or press `i` / `a` for a simulator.

`expo install --fix` is not optional on a first run. `package.json` pins a
known-good baseline, and that command re-pins every native package to the exact
version your installed Expo SDK expects. Skipping it is the usual cause of a
red screen about a mismatched Reanimated or Screens version.

---

## The stack, and why

| Choice | Why |
| --- | --- |
| **Expo + React Native** | The repo was empty, so this was a decision, not an inheritance. A real app was needed — 60fps springs, haptics and a store listing are the point — and Expo gets there without hand-managing two native toolchains. |
| **expo-router** | File-based, so the folder tree *is* the navigation map: five tabs, everything else pushed on top. |
| **Reanimated 4** | Every animation runs on the UI thread. A wallet that stutters when a list is loading is worse than a wallet that does not move. |
| **react-native-svg** | The icon set and the leather grain are vector, so they scale and recolour. |
| **No Skia** | Skia would render the leather better and costs a large native dependency. Layered gradients plus SVG get ~90% of the way at a fraction of the weight. If the wallet needs real grain later, that is the upgrade path. |

---

## Layout

```
app/                    every file is a route
  _layout.tsx           fonts, gesture root, the stack
  sign-in.tsx           phone + OTP, outside the tabs
  (tabs)/               Home · Services · Orders · Wallet · Account
  service/[slug].tsx    one service, pinned price bar
  start/[slug].tsx      the filing form
  pay.tsx               custom keypad
  order/[id].tsx        status timeline
  panda.tsx             the assistant

src/
  theme/                tokens, type scale, motion. Everything reads from here.
  icons/Icon.tsx        29 icons, drawn for this app
  components/           Surface, Touch, Money, TabBar, FlyerCarousel, PandaFab
  wallet/               the object: Leather, Note, Wallet
  data/                 the real catalogue, the real flyers, the sample records
```

---

## The design rules

Four, and every screen keeps them. They are written out in `src/theme/tokens.ts`.

1. **One loud element per screen.** On the wallet it is the balance. Everything
   else is small, dim and letterspaced.
2. **The object gets a stage.** Alone, full width, on a pool of light.
3. **Surfaces are slabs, not boxes.** Large radius, a hairline you can barely
   see, and a lit top edge. That last detail is most of why a rectangle starts
   reading as an object — delete it and every card goes flat at once.
4. **Money is monospaced and tabular,** and grouped the Indian way
   (₹24,35,000, not ₹2,435,000).

Type is Sora, Manrope and IBM Plex Mono — deliberately not Inter, Roboto or SF,
because every fintech app uses one of the three.

The language is borrowed; no artwork is. There is no CRED mark, colour,
illustration or line of copy anywhere in this repo. The gold is LAWFIC's own
gold from the website; the purple is the Panda's.

---

## The microinteractions

| Where | What |
| --- | --- |
| Wallet | Drag to turn it in perspective. Tap to lean the cover open; the notes rise staggered, each at its own angle. A sheen tracks across the leather as it turns. Medium haptic on open, light on close. |
| Tab bar | A lit pill slides on a spring. The icons do **not** change silhouette — they gain a soft fill, so nothing flickers in peripheral vision. Selection haptic, and only on a real change. |
| Everything tappable | Springs down 3% and back. Haptic on press-**in**, not release, so the phone answers at the moment of contact. |
| Balance | Counts up on a decelerating curve that never overshoots. Driven through an animated `TextInput`, so it does not re-render React at 60fps. |
| Add money | 60pt keypad, a haptic per digit. Over the ceiling, the amount shakes once with a warning haptic — no dialog. |
| Flyers | The photograph parallaxes at ~40% of the card's speed, so it sits behind a window rather than printed on a card. |
| Panda | Breathes on a 10-second cycle, with a halo pulsing out of phase. Slow on purpose: a one-second pulse is a notification badge. |

Every spring carries `ReduceMotion.System`. A customer who told their phone to
stop animating things told this app too.

---

## What is real, and what is not

**Real** — copied from the live site, so the app and the website agree:

- 7 categories, 39 services, with their real `live` / `soon` status
- the four published fees: Aadhaar ₹199, Udyam ₹499, GST ₹1,499, PAN ₹299
- Udyam's actual document list, turnaround and three process steps
- the promotional flyers: same headlines, same calls to action, artwork served
  from `lawfic.pro`

**Not real, and labelled as such on screen:**

- the balance, the statement, the orders, every date and order number
- `[First name]`, `[Full name]`, `[00000 00000]` — bracketed, so nobody
  mistakes a placeholder for content

Three things this app deliberately does **not** do, and should not be "fixed"
into doing:

- **A `soon` service does not navigate.** It renders dim with a chip. One line
  would let every row through to a mocked detail screen, and that line is how a
  demo starts promising services nobody can deliver.
- **The Panda does not answer.** It says it is not connected yet. A demo
  assistant that convincingly answers a tax question it did not reason about is
  the most dangerous thing here — somebody will act on it.
- **The wallet is closed-loop.** Add money, spend on services, refunds in. No
  send-to-a-friend, no withdrawal, no bank balances. Same constraint as the
  website, and it is what keeps the wallet out of licensed-payments territory.

The notes inside the wallet are LAWFIC Credits, not rupee notes, and must stay
that way: no Lion Capital, no portrait, no RBI mark, no real-format serial.

---

## Next

1. Point it at the API: `/api/panda`, the wallet balance, orders, auth.
2. Real document upload (`expo-document-picker`, `expo-image-picker`).
3. Push notifications for "needs you" orders — the one status worth interrupting
   somebody for.
4. The wallet customiser: the finishes exist on the website already.
