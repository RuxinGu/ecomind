# EcoMind App Store Connect Prep

## 1) Create App Record (App Store Connect)

Use: App Store Connect -> Apps -> + -> New App

Required fields:
- Platforms: iOS
- Name: EcoMind
- Primary language: English (U.S.)
- Bundle ID: `com.ecomind.app` (replace only if you decide to change it before first release)
- SKU: `ecomind-ios-001`
- User Access: Full Access (or Limited Access for your team)

Notes:
- Ensure your Apple Developer agreements are accepted before creating.
- Bundle ID in App Store Connect must match your app config and signed build.

## 2) Metadata (Version 1.0.0)

Suggested starter values:

Subtitle:
- Reflective dating and social matching

Promotional text:
- Discover meaningful compatibility through an 8-dimension self-reflection profile, then connect in Soul Lounge.

Description:
- EcoMind helps people connect through depth, values, and communication style. Complete a reflection-first questionnaire to generate your 8-dimension profile, discover resonance matches, and start conversations in Soul Lounge.
-
- Key features:
- Guided onboarding with account and profile setup
- EcoMind short and long reflection forms
- 8-dimension tendencies profile (non-clinical)
- Resonance match scoring
- Social chat space with report/block tools
- In-app account deletion and legal/safety pages

Keywords:
- dating,relationships,compatibility,personality,self reflection,connection,chat,match

Support URL:
- Add your production support page URL

Marketing URL:
- Optional landing page URL

## 3) Age Rating

Given current user-generated chat and dating context, start with higher safety default:
- Suggested: 17+

In App Store Connect age-rating questionnaire, answer based on:
- User-generated content: Yes
- Moderation tools present: Report/Block implemented
- Account deletion: Implemented in app settings

## 4) Screenshots + App Icon

Minimum screenshots:
- iPhone 6.9" set (preferred)
- Include 3 to 6 screens covering: Welcome, Test, Results/Matches, Chat, Settings/Safety

Suggested capture order:
1. Welcome screen
2. EcoMind test question screen
3. Results with 8-dimension bars
4. Match cards
5. Soul Lounge chat with report/block actions
6. Settings screen with account deletion and legal pages

App icon:
- Provide final production app icon in App Store Connect via uploaded build asset pipeline
- Keep branding consistent with app name "EcoMind"

## 5) App Privacy (prepare before submission)

Use the companion file:
- `docs/app-privacy-data-map.md`

You must disclose all off-device data collected by app or third-party SDKs.

## 6) Account Deletion Compliance Check (Guideline 5.1.1)

Implemented flow in app:
- Settings -> Delete my account

Backend endpoint:
- `DELETE /account`

Deletion behavior checklist:
- User can initiate in app (done)
- Deletion is permanent and not unnecessarily difficult (done)
- User-generated data associated with account is removed from backend tables (done)
- If any retention is required by law, disclose clearly in Privacy Policy (add legal language before launch)

## 7) Final Release Readiness Before "Submit for Review"

- Build production binary via EAS and upload
- Ensure bundle ID in build exactly matches App Store Connect record
- Verify production API is HTTPS and stable
- Set production `CORS_ORIGIN` to app origins only
- Confirm legal URLs are publicly accessible
- Confirm report-handling process exists on your operations side
