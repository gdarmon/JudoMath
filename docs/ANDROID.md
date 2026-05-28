# Android (APK / AAB)

Judo Math ships as a Trusted Web Activity (TWA): a thin native Android app that
loads the deployed PWA in a Chrome Custom Tab. One codebase, one source of
truth, full PWA features.

## Quick start: get an APK from CI

1. Push to `main` (or trigger the workflow manually in the Actions tab).
2. Open the **Build Android App (TWA)** workflow run.
3. Download the `judomath-apk` artifact at the bottom of the run.
4. Sideload the APK on an Android 8.0+ device:
   ```
   adb install judomath-apk.apk
   ```

The first CI build uses an auto-generated debug keystore. The app installs and
runs, but the URL bar may briefly show because Digital Asset Links are not
configured yet (see [Removing the URL bar](#removing-the-url-bar) below).

## Local build

Requirements: Node 20+, JDK 17, Android SDK (Bubblewrap installs platform-tools
on first init).

```
npm install
npm run twa:icons          # generate PNG icons from public/icon-512.svg
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://gdarmon.github.io/JudoMath/manifest.webmanifest
bubblewrap build
```

Bubblewrap writes:
 - `app-release-signed.apk`  — install this on a device with `adb install`
 - `app-release-bundle.aab`  — upload this to the Play Console

## Removing the URL bar (Digital Asset Links)

For the URL bar to disappear and the app to feel fully native, the host that
serves the PWA must publish a Digital Asset Links file at:

```
https://<host>/.well-known/assetlinks.json
```

This file proves the site and the Android package are owned by the same party.

**Constraint:** TWAs verify against the **host root**. The site currently lives
at `https://gdarmon.github.io/JudoMath/` (sub-path of a shared user-pages host).
GitHub Pages will not serve `/.well-known/assetlinks.json` from a sub-project,
so the URL bar will stay visible until you do **one** of the following:

1. **Custom domain** — point a domain you own (e.g. `judomath.example.com`) at
   GitHub Pages. Pages will then serve `/.well-known/assetlinks.json` from that
   host's root. Update `host` and `webManifestUrl` in `twa-manifest.json` to
   the new domain and re-run `bubblewrap init`.
2. **User-pages repo** — rename the repo to `gdarmon.github.io`. The site moves
   to the host root and `/.well-known/assetlinks.json` becomes reachable.
3. **Deploy elsewhere** — Vercel/Netlify both serve the well-known path
   correctly out of the box.

Whichever option you pick, the file you'll publish lives at
`public/.well-known/assetlinks.json`. Replace
`REPLACE_WITH_YOUR_APP_SIGNING_SHA256_FINGERPRINT` with the SHA-256 fingerprint
of the signing key. Bubblewrap prints this during `init`, and the Play Console
displays it under **Setup → App integrity → App signing key certificate**.

## Signing for Play Store release

Add three repository secrets in GitHub:

| Secret                       | Description                                     |
|------------------------------|-------------------------------------------------|
| `ANDROID_KEYSTORE_BASE64`    | `base64 -w0 < android.keystore`                 |
| `ANDROID_KEYSTORE_PASSWORD`  | Keystore password used to create the keystore   |
| `ANDROID_KEY_PASSWORD`       | Key password (often the same as keystore pwd)   |
| `ANDROID_KEY_ALIAS`          | Key alias inside the keystore (e.g. `android`)  |

Then push a tag matching `v*` (for example `git tag v1.0.0 && git push --tags`).
The workflow will produce a signed `.apk` and a signed `.aab` ready to upload
to the Play Console.

> **Keep `android.keystore` out of git.** Lose it and you can never push an
> update to the Play Store. Store a backup in a password manager.

## Troubleshooting

| Symptom                                                  | Likely cause                                                        |
|----------------------------------------------------------|---------------------------------------------------------------------|
| URL bar shown for a second on first launch               | Asset Links not yet verified (see [Removing the URL bar](#removing-the-url-bar)) |
| `INSTALL_FAILED_VERSION_DOWNGRADE` on `adb install`      | Bumped `appVersionCode` in `twa-manifest.json` is required          |
| App opens then immediately closes                        | Manifest `start_url` resolves outside the verified scope. Set `fullScopeUrl` to the deployed origin + path. |
| Icons look pixelated                                     | Re-run `npm run twa:icons` and confirm `public/icon-512.svg` source |

## Files of interest

| File                                          | Purpose                                              |
|-----------------------------------------------|------------------------------------------------------|
| `twa-manifest.json`                           | Bubblewrap configuration                             |
| `scripts/generate-twa-icons.mjs`              | SVG → PNG converter (sharp)                          |
| `public/.well-known/assetlinks.json`          | Digital Asset Links file (replace fingerprint)       |
| `.github/workflows/android.yml`               | CI workflow — manual + tag-triggered                 |
