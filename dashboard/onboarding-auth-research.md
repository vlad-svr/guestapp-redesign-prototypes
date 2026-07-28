# Onboarding auth + PMS research (for extending onboarding.html)

Sources: chekin.com/en/onboarding/login/ & /register-form/ (live), the
"Chekin Onboarding / PMS" Google Sheet (CSV export), and the real dashboard's
new onboarding module (`apps/dashboard/src/{pages,components}/onboarding`).

## 1. Login (live page)

- Card: "Welcome back!" hero → Login: Email, Password (show/hide toggle),
  "Forgot Password?" link, Cloudflare Turnstile captcha, Login button
  (disabled until valid). Topbar: language flag + "Register for free".

## 2. Forgot password (live + app code)

- Inline card swap on the same page: "Password recovery" → "Your recovery
  email" → Send Recovery Link → Back.
- App flow (pages/onboarding): PasswordRecovery → CheckEmail ("We sent you an
  email with a link to reset your password") → ResetPassword ("Set a new
  password") → PasswordSuccessfullyReset.

## 3. 2FA (app code — `TwoFactorAuthenticationForm`)

- After login, when the account requires OTP the app navigates to
  /two-factor with state {email, otp_token, otp_type}.
- UI: "Two-Factor Authentication" / "enter the 6-digit verification code sent
  to your account email" → 6-cell InputOTP (validate: full 6 digits),
  errors: "Invalid code" / unknown; "Didn't receive a code?" + Resend code;
  back to login link.

## 4. Register (live marketing form — single page)

Left marketing panel (benefits + PMS logos), right form:
- Name, Email, Password (show toggle)
- Type of property: Vacation Rental / Hotel, Hostel / Villa / Camping
- Number of properties (ranges; two sets seen: 1-20/21-50/51-100 and
  1-5/6-20/21-100/100+ — conditional on property type)
- City/Region, Phone (+country code picker)
- "Do you want to connect your PMS?" Yes/No → PMS Name select (~80 options +
  "I don't use a PMS" + "Others PMS")
- Hidden "How did you hear about us?" (Google ad, FB/IG ad, search,
  recommendation, website, PMS marketplace, Airbnb webinar)
- T&C consent → Continue. 14-day free trial banner.
- Partner-consent modals (Holidu, Amenitiz): GDPR data-sharing consent with
  Cancel/Confirm when those partners are selected.

## 5. Register wizard (app code — the new step-per-screen flow)

`registerWizard/steps.ts` — one step per URL:
EMAIL → FULL_NAME_AND_PASSWORD → WELCOME ("Hey {name}, Welcome to Chekin!")
→ PROPERTY_TYPE → NUMBER_OF_PROPERTIES → COUNTRY → PHONE_NUMBER → FOCUS
→ CONNECT_PMS → then either FINISH_WITHOUT_PMS or PMS_PROVIDER → FINISH_WITH_PMS.

- FOCUS options: Automated compliance / Branded check-in / Automated remote
  access / Property Protection / Processing payments.
- CONNECT_PMS choice cards: "Continue without PMS" (add properties manually)
  vs "Connect my PMS" (import automatically).
- FINISH_WITHOUT_PMS: staged pending screen ("Checking your configuration…",
  "Setting up your account…", "Preparing dashboard…").
- PMS_PROVIDER page not implemented yet in the app — the sheet below is its spec.

## 6. PMS second step (the Google Sheet: 81 PMSs)

Three integration types:
- **Chekin** (plain registration, no 2nd step): no pms, ABAL, Amenitiz,
  Beds24, Booking Automation, MasterYield, Planyo, 5stelle…
- **Siteminder** (~30 PMSs: 5stelle, Adobe Booking, BrillantEZ, GuestCentrix,
  Easy-Rez, GoldenmUp, HotelTime, ibelsa, InnkeyPMS, Mister Booking, NewBook,
  Occupancy Plus, Preno, RoomRanger, RoomRaccoon, Shalom, Sirvoy, SiteMinder,
  Thaïs, TK System, VHP Sindata, WinHMS, Winhotel, Xenia, Zavia…): same
  endpoint, `origin` identifies the PMS, no 2nd step.
- **Other** (~35 PMSs): **2nd step form with PMS-specific credential fields**,
  e.g.:
  - api_key only: Avaibook, Fantasticstay, Hostify, Housemonk, IGMS, Lavanda,
    Lodgify, Octorate, Rentalwise, Rentlio
  - username+password: Avantio, Channex, Hotelizer, Resharmonics, Sihot
  - multi-field: 365villas (key/pass/owner tokens), Avalon (x_api_key,
    base_url, hotel_name), Bookipro (api_key, host), Eviivo/Hostaway
    (client_id+secret), Ezee (auth_key, hotel_code), Front2Go (host, chain_id,
    user_password), Livensa (db creds), Noray (two account-type variants),
    Oracle (user, pass, base_url…), QuickMerlin (site,user,pass), RMSCloud
    (agent+client ids/passwords), TommyBS, Track (sub_domain,user,pass),
    Ulyses, Verial (user_dns, session_nu), Deskline (housings_ids array),
    Minihotel (hotel_id), Rentals United (pms_email), Myvr/Ownerrez (code)
- **OAuth PMSs** (redirect out → return with ?code=): Apaleo, BookingSync,
  Cloudbeds, Hospitable, Hostfully, IGMS. Smoobu = "open new tab to
  login.smoobu.com" style.
- **2nd-step content panel** per PMS: description + website link + "Benefits
  of integrating Chekin and X" bullets; ~22 PMSs also have a **YouTube video
  guide** (Apaleo, Beds24, BookingSync, Bookipro, Cloudbeds, Eviivo, Guesty,
  Hostaway, Hostify, Hoteliga, Little Hotelier, Lodgify, MasterYield, Mews,
  Octorate, Ownerrez, Planyo, Rentals United, Rentlio, Resharmonics,
  SiteMinder, Smoobu).

## 7. Gaps in the current onboarding.html prototype

Missing entirely: login screen, forgot-password (recovery → check email →
reset → success), 2FA (6-cell OTP + resend), account-creation steps (email,
name+password, welcome), focus step, connect-PMS choice, PMS picker, the
PMS-specific 2nd step (credential form + info panel + video + OAuth redirect
variant), partner-consent modal, staged finish/pending screens.
