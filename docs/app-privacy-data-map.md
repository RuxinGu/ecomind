# EcoMind App Privacy Data Map (Draft)

Use this as your source when completing App Store Connect -> App Privacy.
Update if you add SDKs (analytics, ads, crash tools, push providers).

## Data categories currently present in app/backend

1. Contact Info
- Data: Email address
- Purpose: Account creation/login, account management
- Linked to user: Yes
- Used for tracking: No

2. User Content
- Data: Profile bio, chat messages, report reasons
- Purpose: Core app functionality (social/dating communication, safety moderation)
- Linked to user: Yes
- Used for tracking: No

3. Sensitive Info (if you treat as such internally)
- Data: Optional gender, dating preference
- Purpose: Profile and matching context
- Linked to user: Yes
- Used for tracking: No

4. Other User Content / Profile
- Data: EcoMind questionnaire responses and dimension scores
- Purpose: Reflection profile generation and compatibility matching
- Linked to user: Yes
- Used for tracking: No

5. Identifiers
- Data: Account ID, session token
- Purpose: Authentication and session security
- Linked to user: Yes
- Used for tracking: No

6. Diagnostics
- Data: Server-side login attempts (email/IP success/failure)
- Purpose: Security and abuse prevention
- Linked to user: Potentially (email/IP)
- Used for tracking: No

## Tracking declaration

Current implementation has no ad-tech tracking SDK and no cross-app tracking intent.
Expected App Privacy answer:
- "Data Used to Track You": No

## Third-party SDK impact warning

If you add any of these, update privacy disclosures before release:
- Analytics SDK (Amplitude/Mixpanel/Firebase)
- Crash reporting SDK (Sentry/Crashlytics)
- Ads SDK
- Attribution SDK

## Retention/disclosure notes for policy pages

Add clear language in public Privacy Policy about:
- What is deleted immediately on account deletion
- Any temporary retention for abuse or legal compliance
- Contact method for privacy requests
