# Authentication & Age / 18+ Minor Restrictions Guide

This document details the architecture, security invariants, data models, database-level enforcement, and external configuration requirements for **Phase 6: Authentication and Age / 18+ Restrictions for Minors** in the Hailey protocol.

---

## 1. Executive Summary & Security Separation

Authentication establishes **WHO** the user is; it does **NOT** establish whether the user is an adult.

Neither Google OAuth, email verification, having an active Hailey account, nor wallet ownership constitutes proof that a user is 18+.

```
                   HAILEY IDENTITY
                         │
            ┌────────────┴────────────┐
            │                         │
     Email / Password           Google OAuth
            │                         │
            └────────────┬────────────┘
                         ↓
                   Supabase Auth
                         ↓
                 Authenticated User
                         ↓
                  Hailey Profile
                         ↓
                  Authorization
                         ↓
                  Age Eligibility
                         ↓
               18+ Content Policy
                         ↓
                Phase 5 Safety
                         ↓
                  Content Access
```

---

## 2. Authentication Architecture

### 2.1 Supabase Auth & Google OAuth Integration
- **Frontend OAuth Initiation**: Initiated via `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } } })` inside `AuthContext.jsx`.
- **Session Persistence**: Reuses standard Supabase sessions persisted in local storage (`supabase.auth.getSession()` and `onAuthStateChange`).
- **Email/Password Compatibility**: `signInWithPassword` and `signUp` continue to function without modification.
- **Protected Routes**: Protected routes inspect `user` / `session` state from `AuthContext`. Google-authenticated users pass the identical protected route checks as email/password users.
- **Logout**: Handled via `supabase.auth.signOut()`, destroying session tokens across all auth providers.

### 2.2 Profile Initialization & Preservation
- **Trigger**: Database trigger `on_auth_user_created` on `auth.users` calls PostgreSQL function `handle_new_user()`.
- **First Login**: Creates a `public.profiles` row with initial handle, display name, and avatar URL extracted from `raw_user_meta_data`, with `ON CONFLICT (id) DO NOTHING`.
- **Subsequent Logins**: Existing Hailey profile values (custom handles, bios, avatars, wallet addresses) are strictly preserved and never blindly overwritten on subsequent OAuth logins.
- **Default Age Record**: Initializes a corresponding `public.user_age_eligibility` record with `eligibility = 'UNVERIFIED'`.

---

## 3. Authoritative Age Eligibility Model

### 3.1 Age Eligibility Enum (`AGE_ELIGIBILITY`)
Stored in table `public.user_age_eligibility`:
- `UNVERIFIED` *(Default)*: Account has not completed an authoritative age-verification procedure. Default-denies access to all `ADULT_18_PLUS` content.
- `MINOR`: Account belongs to an individual confirmed to be under 18. Strictly blocked from `ADULT_18_PLUS` content.
- `ADULT`: Account belongs to an individual confirmed to be 18+. Permitted access to `ADULT_18_PLUS` content provided all Phase 5 graphic safety policies also pass.
- `REQUIRES_REVIEW`: Account age eligibility is pending manual or automated compliance review. Treated as fail-closed / blocked.

### 3.2 Content Age Classification (`CONTENT_AGE_CLASSIFICATION`)
Stored in `public.posts.age_classification` and `public.media_assets.age_classification`:
- `GENERAL` *(Default)*: General audience content accessible to all users.
- `ADULT_18_PLUS`: Mature / 18+ content restricted exclusively to verified `ADULT` accounts.
- `AGE_RESTRICTED_REVIEW`: Content flagged for age re-classification review; fail-closed.
- `UNCLASSIFIED`: Legacy or unclassified content; fail-closed for non-adults.

---

## 4. Default-Deny Policy Matrix

| User Eligibility | Content Classification | Phase 5 Graphic Safety | Access Policy Decision | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **MINOR** | `GENERAL` | `ALLOWED` | **ALLOW** | General audience content is safe for minors. |
| **UNVERIFIED** | `GENERAL` | `ALLOWED` | **ALLOW** | General audience content is accessible to unverified users. |
| **ADULT** | `GENERAL` | `ALLOWED` | **ALLOW** | General audience content is accessible to adults. |
| **MINOR** | `ADULT_18_PLUS` | `ALLOWED` | **DENY** | 18+ content is strictly prohibited for minor accounts. |
| **UNVERIFIED** | `ADULT_18_PLUS` | `ALLOWED` | **DENY** | 18+ content requires verified adult status (fail-closed). |
| **REQUIRES_REVIEW** | `ADULT_18_PLUS` | `ALLOWED` | **DENY** | Pending review fails closed. |
| **ADULT** | `ADULT_18_PLUS` | `ALLOWED` | **ALLOW** | Verified adult granted access to cleared mature content. |
| **ADULT** | `ADULT_18_PLUS` | `BLOCKED` | **DENY** | Phase 5 graphic safety failure overrides adult eligibility. |
| **ADULT** | `ADULT_18_PLUS` | `REVIEW_REQUIRED`| **DENY** | Phase 5 review requirement overrides adult eligibility. |
| **ADULT** | `ADULT_18_PLUS` | `FAILED` | **DENY** | Phase 5 classifier failure fails closed. |
| **ANY** | `UNCLASSIFIED` | `ALLOWED` | **DENY** *(Non-adults)* | Unclassified content cannot be assumed safe for minors. |

---

## 5. Database-Level Enforcement & Defense-in-Depth

Enforcement does NOT rely solely on frontend React state. Direct database interaction is secured via PostgreSQL triggers and Row-Level Security:

### 5.1 RLS on `public.user_age_eligibility`
- **SELECT**: Restricted to `(auth.uid() = user_id)`. Users can view only their own eligibility status.
- **INSERT / UPDATE / DELETE**: Blocked for direct client execution. Transitions must occur strictly via authoritative backend services (`service_role`).

### 5.2 RLS on `public.posts` (`posts_select_age_authorized`)
- Allows SELECT if:
  1. `age_classification = 'GENERAL'`, OR
  2. `age_classification = 'ADULT_18_PLUS'` AND viewer has a verified `ADULT` record in `public.user_age_eligibility`.
- **STRICT INVARIANT — NO AUTHOR BYPASS**: Minors, unverified accounts, and users under review are strictly prohibited from viewing any `ADULT_18_PLUS` content, including their own posts.

### 5.3 Database Trigger (`trg_check_post_safety_and_age`)
Executed `BEFORE INSERT OR UPDATE ON public.posts`:
1. **Author Identity Integrity & Anti-Spoofing**: Rejects any client attempt to forge `author_id` to another user's UUID or modify `author_id` on existing posts.
2. **Phase 5 Graphic Safety**: Rejects insert/update if attached `media_asset_id` does not have `policy_status = 'ALLOWED'` in `media_safety_analyses`.
3. **Media Age Alignment**: Rejects insert/update if attached media is `ADULT_18_PLUS` while post claims `GENERAL`.
4. **Adult Publishing Eligibility**: Rejects insert/update if post is `ADULT_18_PLUS` and author does not have verified `ADULT` eligibility in `user_age_eligibility`.

---

## 6. Privacy & Data Minimization

- **No Date of Birth (DOB)**: Exact dates of birth are not stored in database tables or client state.
- **No Identity Documents Stored**: Government IDs and passports are not stored in application databases.
- **No On-Chain Age Data**: Age verification tokens, adult eligibility flags, and PII are strictly barred from blockchain transactions, attestations, and content hashes. Blockchain remains solely for cryptographic provenance.
- **Minimal Metadata**: Table `user_age_eligibility` records only opaque provider tokens (`reference_id`), verification method (`verification_method`), and timestamp (`verified_at`).

---

## 7. Legacy & Text-Only Content Invariants

- **Text-Only Posts**: Posts where `media_asset_id IS NULL` and `age_classification = 'GENERAL'` bypass media safety checks and remain immediately publishable and accessible.
- **Legacy Media Migration**: Existing media assets are assigned `age_classification = 'GENERAL'` or `UNCLASSIFIED` via migration `0012_authentication_and_age_restrictions.sql`.

---

## 8. Code Implementation vs External Configuration

### CODE IMPLEMENTATION (Completed in Phase 6)
- Supabase Auth Google OAuth frontend integration in `AuthContext.jsx` and `AuthPage.jsx`.
- Database migration `0012_authentication_and_age_restrictions.sql` implementing tables, indexes, triggers, and RLS policies.
- Policy engine `server/security/age/agePolicy.js` implementing default-deny rule matrix and Phase 5 composition.
- Authoritative service `server/security/age/ageVerificationService.js` for managing user eligibility state and content access evaluations.
- Vitest unit test suite `tests/unit/auth_and_age.test.js` (16 tests) and adversarial security test suite `tests/security/adversarial_age_restriction.test.js` (16 tests).

### EXTERNAL CONFIGURATION (Required in Production Environment)

#### 1. Google Cloud Console Configuration
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services > Credentials**.
3. Create an **OAuth 2.0 Client ID** (Web Application).
4. Add Authorized JavaScript Origins:
   - Development: `http://localhost:5173`
   - Production: `https://<your-hailey-domain>`
5. Add Authorized Redirect URIs:
   - `https://<supabase-project-id>.supabase.co/auth/v1/callback`
6. Copy `Client ID` and `Client Secret`.

#### 2. Supabase Dashboard Provider Configuration
1. Open [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication > Providers > Google**.
3. Enable **Google**.
4. Enter the Google `Client ID` and `Client Secret`.
5. Save settings.

#### 3. Real Age-Verification Provider Configuration
*Note: Hailey currently has no external identity-document verification vendor (e.g. Persona, Yoti, Veriff, Jumio) configured. In production, adult eligibility remains strictly `UNVERIFIED` (default-deny for 18+ content) until an enterprise age-verification vendor webhook is provisioned.*
