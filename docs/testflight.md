# TestFlight: getting Rift Game onto family iPhones

Day-to-day testing runs in **Expo Go**, which is free and needs no Apple account. TestFlight is for installing the game as its own app on the kids' phones. The game plan schedules it for the end of Phase 1, because it needs the paid Apple Developer Program.

Everything here works from Windows. Expo builds and signs the iPhone app in the cloud, so no Mac is needed.

Checked against the Expo docs on 2026-11-22. Expo has renamed its services (EAS Build is now Expo Build, and so on), but the `eas` commands and `eas.json` keep their names. Re-check https://docs.expo.dev/submit/testflight.md if a step doesn't match.

## Already set up in the repo

- `eas.json` contains the default build profiles, remote build numbers (`"appVersionSource": "remote"`) and `"autoIncrement": true` on `production`, so every TestFlight upload gets a new build number automatically.
- `app.json` sets `ios.config.usesNonExemptEncryption: false`. The game only uses the encryption built into iOS (HTTPS), which is exempt. Without this flag, builds sit at "Missing Compliance" in App Store Connect.

## 1. Accounts (one time)

1. **Apple Account with two-factor authentication** turned on.
2. **Apple Developer Program**, $99 USD (renewed yearly), at https://developer.apple.com/programs/enroll/. Enroll as an **Individual**. An organization account needs a D-U-N-S number and isn't worth it for a family game. Approval can take a day or two.
3. **Expo account** (free) at https://expo.dev/signup.

## 2. Choose the bundle identifier

This is the app's permanent ID with Apple, for example `com.<yourname>.riftgame`. **It can't be changed later** without creating a new app, so don't tie it to the placeholder name if you'd rather not. A neutral choice such as `com.<yourname>.rift` survives a rename. The build step asks for it and writes it into `app.json` as `ios.bundleIdentifier`.

## 3. First build and upload

From the project folder:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

The first run asks you to:

1. Confirm or enter the bundle identifier.
2. Sign in to Apple (with your two-factor code). EAS then creates the distribution certificate and provisioning profile and stores them with Expo. Say yes to letting it manage these.
3. Let it create an App Store Connect API key, and the App Store Connect app record if none exists.

The build runs in the cloud (watch it with `npx eas-cli@latest build:list` or on expo.dev). When it finishes, it uploads to App Store Connect automatically. Apple then processes it, which usually takes 5 to 10 minutes.

Shortcut: `npx testflight` is an interactive wizard that does the same thing (credentials, production build, upload to the internal TestFlight group).

## 4. Add testers

In App Store Connect (https://appstoreconnect.apple.com), open **Apps → Rift Game → TestFlight**.

- **Internal testing** (you and other adults): add people from your App Store Connect team (**Users and Access**). Builds are available as soon as processing finishes, with no review. Up to 100 testers.
- **External testing** (by email or public link, no App Store Connect account needed): create a group, add a short beta description and a feedback email, and submit the build for **Beta App Review** (needed for the first build of each version). After approval, invite by email or share the public link.

Each tester installs the free **TestFlight** app from the App Store, accepts the invite and installs Rift Game from there. A TestFlight build expires **90 days** after upload, so ship a new build at least that often.

### Kids' phones

The Expo docs don't cover child Apple Accounts. Before relying on it, check Apple's TestFlight help (https://developer.apple.com/testflight/ and https://help.apple.com/app-store-connect/) for whether child accounts under Family Sharing can accept TestFlight invites, and for any minimum age. If they can't, external testing with a public link opened on the kid's phone is the fallback to try.

## 5. Later updates

```bash
npx eas-cli@latest build --platform ios --profile production --auto-submit
```

The build number goes up on its own. Change `version` in `app.json` only for a release the family should notice (for example `1.1.0`).

Small JavaScript-only changes can also go out as an over-the-air update with `npx eas-cli@latest update` once `expo-updates` is set up. That isn't configured yet.

## Limits worth knowing

- Expo's free plan includes cloud builds, with a cap on build duration and a queue. See https://expo.dev/pricing for current numbers.
- Apple allows at most 3 distribution certificates per account. Let EAS reuse its own rather than making new ones.
- Provisioning profiles expire after 12 months. Running a new build with Apple sign-in lets EAS create a fresh one.
