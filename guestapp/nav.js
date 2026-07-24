/* Floating prototype switcher — injected on every page.
   Flow pages expose sub-entries (scenarios) that deep-link via #hash;
   flow.js picks the hash up and jumps straight to that scenario. */
(function () {
  // Organized by FEATURE. Under each feature, mobile (📱) and desktop (🖥)
  // sit together so the two form factors are never scattered across sections.
  var PAGES = [
    { group: 'Overview', items: [
      { file: 'index.html', label: 'Overview & rationale', icon: '⌂' },
    ]},
    { group: 'Splash screen', items: [
      { file: 'flow-splash-v2.html', label: 'Splash screen — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'sp-fast', label: 'Fast load (the 90% case)' },
        { hash: 'sp-slow', label: 'Slow connection' },
        { hash: 'sp-longer', label: 'Taking longer' },
        { hash: 'sp-error', label: "Can't load" },
        { hash: 'sp-offline', label: 'Offline' },
        { hash: 'sp-brand', label: 'Host-branded' },
        { hash: 'sp-off', label: 'Splash disabled' },
      ]},
      { file: 'flow-splash-desktop-v2.html', label: 'Splash screen — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'spd-fast', label: 'Fast load' },
        { hash: 'spd-slow', label: 'Slow connection' },
        { hash: 'spd-error', label: "Can't load" },
        { hash: 'spd-sdk', label: 'SDK — embedded in a client site' },
      ]},
    ]},
    { group: 'Home', items: [
      { file: 'home.html', label: 'Home — mobile', icon: '📱' },
      { file: 'home-desktop.html', label: 'Home — desktop', icon: '🖥' },
    ]},
    // An alternative Home, kept apart so the flat one stays the baseline.
    { group: 'Staged journey', items: [
      { file: 'home-desktop-stages.html', label: 'Staged journey — desktop', proposal: true, icon: '🖥', by: 'opus' },
    ]},
    { group: 'Sign in & onboarding', items: [
      { file: 'flow-auth-mobile.html', label: 'Sign in & onboarding — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'a-signin', label: 'Create account (email)' },
        { hash: 'a-password', label: 'Create account (password)' },
        { hash: 'a-code', label: 'Verify email code' },
        { hash: 'a-login', label: 'Returning — log in' },
        { hash: 'a-welcome', label: 'Welcome' },
        { hash: 'a-type', label: 'Onboarding · your trip' },
        { hash: 'a-guests', label: 'Onboarding · guests' },
        { hash: 'a-who', label: "Onboarding · who's coming" },
        { hash: 'a-leader', label: 'Onboarding · lead guest' },
      ]},
      { file: 'flow-auth-desktop.html', label: 'Sign in & onboarding — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'ad-signin', label: 'Create account' },
        { hash: 'ad-code', label: 'Verify email code' },
        { hash: 'ad-login', label: 'Returning — log in' },
        { hash: 'ad-welcome', label: 'Welcome' },
        { hash: 'ad-type', label: 'Onboarding · your trip' },
        { hash: 'ad-guests', label: 'Onboarding · guests' },
        { hash: 'ad-who', label: "Onboarding · who's coming" },
        { hash: 'ad-leader', label: 'Onboarding · lead guest' },
      ]},
    ]},
    { group: 'Find booking', items: [
      { file: 'flow-search-v2.html', label: 'Find booking — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 's2-method', label: 'Arrival — choose method' },
        { hash: 's2-code', label: 'Booking reference (segmented)' },
        { hash: 's2-date', label: 'Check-in date & email' },
        { hash: 's2-create', label: 'Create reservation (property link)' },
        { hash: 's2-searching', label: 'Searching → boarding pass' },
        { hash: 's2-searching-nf', label: 'Not found (next steps)' },
        { hash: 's2-direct', label: 'Direct link (auto-search)' },
      ]},
      { file: 'flow-search-desktop-v2.html', label: 'Find booking — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'sd2-method', label: 'Arrival — choose method' },
        { hash: 'sd2-code', label: 'Booking reference (segmented)' },
        { hash: 'sd2-date', label: 'Check-in date & email' },
        { hash: 'sd2-create', label: 'Create reservation (property link)' },
        { hash: 'sd2-searching', label: 'Searching → boarding pass' },
        { hash: 'sd2-searching-nf', label: 'Not found (next steps)' },
        { hash: 'sd2-direct', label: 'Direct link (auto-search)' },
      ]},
    ]},
    { group: 'Identity verification', items: [
      { file: 'flow-iv-mobile.html', label: 'IV flow — mobile', icon: '📱', subs: [
        { hash: 's-start', label: 'Full flow (passport / ID card)' },
        { hash: 's-qr-scan', label: 'Continue from desktop (QR)' },
        { hash: 's-crop', label: 'Upload — crop & confirm' },
        { hash: 's-front-failed', label: 'Validation failed' },
        { hash: 's-denied', label: 'Camera denied' },
        { hash: 's-live-1', label: 'Liveness sequence' },
        { hash: 's-contact-email', label: 'Contacts — email + SMS' },
        { hash: 's-unavailable', label: 'Outside check-in window' },
      ]},
      { file: 'flow-iv-desktop.html', label: 'IV flow — desktop', icon: '🖥', subs: [
        { hash: 'd-choice', label: 'Start — choose document' },
        { hash: 'd-qr', label: 'Continue on phone (QR)' },
        { hash: 'd-cam', label: 'Webcam capture' },
        { hash: 'd-crop', label: 'Upload — crop & confirm' },
        { hash: 'd-contact-email', label: 'Contacts — email + SMS' },
        { hash: 'd-front-failed', label: 'Validation failed' },
        { hash: 'd-cam-denied', label: 'Webcam blocked' },
        { hash: 'd-unavailable', label: 'Outside check-in window' },
      ]},
    ]},
    { group: 'IV QR', items: [
      { file: 'flow-housing-iv-v2.html', label: 'IV QR — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'hv-start', label: 'At the property' },
        { hash: 'hv-find', label: 'Find by name' },
        { hash: 'hv-searching', label: 'Searching → confirm match' },
        { hash: 'hv-more', label: 'One more detail (document)' },
        { hash: 'hv-more-dob', label: 'One more detail (birth date)' },
        { hash: 'hv-searching-nf', label: 'Not found (next steps)' },
        { hash: 'hv-badqr', label: 'Invalid QR link' },
        { hash: 'hv-handoff', label: 'Handoff → regular guestapp' },
        { hash: 'hv-scan', label: 'Scan the entrance QR' },
        { hash: 'hv-iv', label: 'The regular IV flow' },
        { hash: 'hv-unavailable', label: 'Before check-in day' },
      ]},
      { file: 'flow-housing-iv-desktop-v2.html', label: 'IV QR — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'hvd-start', label: 'At the property' },
        { hash: 'hvd-find', label: 'Find by name' },
        { hash: 'hvd-searching', label: 'Searching → confirm match' },
        { hash: 'hvd-more', label: 'One more detail (document)' },
        { hash: 'hvd-more-dob', label: 'One more detail (birth date)' },
        { hash: 'hvd-searching-nf', label: 'Not found (next steps)' },
        { hash: 'hvd-badqr', label: 'Invalid QR link' },
        { hash: 'hvd-handoff', label: 'Handoff → regular guestapp' },
        { hash: 'hvd-scan', label: 'Scan the entrance QR' },
        { hash: 'hvd-iv', label: 'The regular IV flow' },
        { hash: 'hvd-unavailable', label: 'Before check-in day' },
      ]},
    ]},
    { group: 'Guest registration', items: [
      { file: 'flow-registration.html', label: 'Registration flow — mobile', icon: '📱', subs: [
        { hash: 'r-hub', label: 'Full flow' },
        { hash: 'r-details', label: 'Add details' },
        { hash: 'r-review', label: 'Review & sign (tap to draw)' },
        { hash: 'r-done', label: 'Hub — guest without IV' },
      ]},
      { file: 'guest-registration-desktop.html', label: 'Registration — desktop', icon: '🖥' },
    ]},
    { group: 'Autofill — document scan', items: [
      { file: 'flow-autofill-mobile.html', label: 'Autofill scan — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'af-form', label: 'Full flow (card → scan → fill)' },
        { hash: 'af-scan', label: 'Scan — fit the code' },
        { hash: 'af-reading', label: 'Reading the code (OCR)' },
        { hash: 'af-done', label: 'Review your details (filled)' },
        { hash: 'af-select', label: 'Choose document (barcode)' },
        { hash: 'af-fail', label: 'Couldn\'t read the code' },
        { hash: 'af-denied', label: 'Camera blocked' },
      ]},
      { file: 'flow-autofill-desktop.html', label: 'Autofill scan — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'afd-form', label: 'Guest form (autofill card)' },
        { hash: 'afd-scan', label: 'Scan → fill (dialog)' },
        { hash: 'afd-reading', label: 'Reading the code (OCR)' },
        { hash: 'afd-done', label: 'Review your details (filled)' },
        { hash: 'afd-select', label: 'Choose document (barcode)' },
        { hash: 'afd-fail', label: 'Couldn\'t read the code' },
      ]},
    ]},
    { group: 'Registration complete', items: [
      { file: 'flow-registered-modal.html', label: 'Registered modal + offers', icon: '▶', subs: [
        { hash: 'dm-loading', label: 'Full flow — with offers' },
        { hash: 'dm-offers', label: 'Offer stack' },
        { hash: 'dm-cart', label: 'Cart summary' },
        { hash: 'dm-empty-loading', label: 'No offers — full sequence' },
        { hash: 'dm-empty', label: 'No offers — registered' },
        { hash: 'dm-plain-loading', label: 'Upselling disabled' },
        { hash: 'dm-error', label: 'Submission failed' },
      ]},
    ]},
    { group: 'Payments', items: [
      { file: 'flow-payments-mobile.html', label: 'Payments flow — mobile', icon: '📱', subs: [
        { hash: 'p-cart', label: 'Full flow (cart → pay → receipt)' },
        { hash: 'p-later', label: 'Pay later' },
        { hash: 'p-form', label: 'Card form' },
        { hash: 'p-3ds', label: 'Bank confirmation (3-D Secure)' },
        { hash: 'p-error', label: 'Payment failed' },
        { hash: 'p-slow', label: 'Slow confirmation' },
        { hash: 'p-history', label: 'Order history' },
        { hash: 'p-empty', label: 'Empty cart' },
        { hash: 'p-deposit', label: 'Deposit chooser' },
      ]},
      { file: 'flow-payments-desktop.html', label: 'Payments flow — desktop', icon: '🖥', subs: [
        { hash: 'pd-cart', label: 'Full flow (cart → pay → receipt)' },
        { hash: 'pd-form', label: 'Card form' },
        { hash: 'pd-error', label: 'Payment failed' },
        { hash: 'pd-history', label: 'Order history' },
        { hash: 'pd-deposit', label: 'Deposit chooser' },
      ]},
      { file: 'flow-payments-v2.html', label: 'Payments V2 (simpler) — mobile', icon: '📱', subs: [
        { hash: 'p2-cart', label: 'Full flow (bill → pay → receipt)' },
        { hash: 'p2-later', label: 'Pay later' },
        { hash: 'p2-form', label: 'Card form' },
        { hash: 'p2-3ds', label: 'Bank confirmation (3-D Secure)' },
        { hash: 'p2-error', label: 'Payment failed' },
        { hash: 'p2-history', label: 'Order history' },
        { hash: 'p2-empty', label: 'Nothing to pay' },
        { hash: 'p2-deposit', label: 'Deposit chooser' },
      ]},
      { file: 'flow-payments-desktop-v2.html', label: 'Payments V2 (simpler) — desktop', icon: '🖥', subs: [
        { hash: 'pd2-cart', label: 'Full flow (bill → pay → receipt)' },
        { hash: 'pd2-form', label: 'Card form' },
        { hash: 'pd2-error', label: 'Payment failed' },
        { hash: 'pd2-history', label: 'Order history' },
        { hash: 'pd2-deposit', label: 'Deposit chooser' },
      ]},
    ]},
    { group: 'Property protection', items: [
      { file: 'flow-deposit-mobile.html', label: 'Property protection — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'dp-single', label: 'One protection (deposit only)' },
        { hash: 'dp-multi', label: 'Two protections (choose one)' },
        { hash: 'dp-pending', label: 'Nothing chosen yet (nudge)' },
        { hash: 'dp-optional', label: 'Optional — pay on arrival' },
        { hash: 'dp-edit', label: 'Edit from the cart' },
        { hash: 'dp-paid', label: 'Already covered' },
        { hash: 'dp-loading', label: 'Loading (skeleton)' },
      ]},
      { file: 'flow-deposit-desktop.html', label: 'Property protection — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'dpd-multi', label: 'Two protections (choose one)' },
        { hash: 'dpd-optional', label: 'Optional — pay on arrival' },
        { hash: 'dpd-edit', label: 'Edit from the cart' },
        { hash: 'dpd-paid', label: 'Already covered' },
      ]},
    ]},
    { group: 'Tourist taxes', items: [
      { file: 'flow-taxes-mobile.html', label: 'Taxes flow — mobile', icon: '📱', subs: [
        { hash: 't-setup', label: 'Full flow (setup → cart)' },
        { hash: 't-exemption', label: 'Add exemption' },
        { hash: 't-newguest', label: 'New guest with exemption' },
        { hash: 't-added', label: 'Exemption added' },
        { hash: 't-edit', label: 'From payments cart' },
        { hash: 't-empty', label: 'Age-priced region (no exemptions)' },
        { hash: 't-unregistered', label: 'Guest not registered yet' },
        { hash: 't-paid', label: 'Taxes paid (locked)' },
      ]},
      { file: 'flow-taxes-desktop.html', label: 'Taxes flow — desktop', icon: '🖥', subs: [
        { hash: 'td-setup', label: 'Full flow (setup → cart)' },
        { hash: 'td-exemption', label: 'Add exemption' },
        { hash: 'td-edit', label: 'From payments cart' },
        { hash: 'td-unregistered', label: 'Guest not registered yet' },
        { hash: 'td-paid', label: 'Taxes paid (locked)' },
      ]},
    ]},
    { group: 'Upselling', items: [
      { file: 'flow-upselling-mobile.html', label: 'Upselling flow — mobile', icon: '📱', subs: [
        { hash: 'u-list', label: 'Full flow (browse → book → cart)' },
        { hash: 'u-detail', label: 'Instant offer — add to cart' },
        { hash: 'u-request', label: 'On-request offer — host approval' },
        { hash: 'u-track', label: 'My requests & cart' },
        { hash: 'u-rejected', label: 'Request declined' },
        { hash: 'u-empty', label: 'No extras' },
      ]},
      { file: 'flow-upselling-desktop.html', label: 'Upselling flow — desktop', icon: '🖥', subs: [
        { hash: 'ud-list', label: 'Full flow (browse → book → cart)' },
        { hash: 'ud-detail', label: 'Instant offer — booking box' },
        { hash: 'ud-request', label: 'On-request offer — host approval' },
        { hash: 'ud-track', label: 'My requests & cart' },
        { hash: 'ud-rejected', label: 'Request declined' },
      ]},
      { file: 'flow-book-experience-mobile.html', label: 'Book an experience — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'bx-tour', label: 'On-request offer (per person)' },
        { hash: 'bx-multi', label: 'Multi-item offer (breakfast)' },
        { hash: 'bx-time', label: 'Time-based (late check-out)' },
        { hash: 'bx-delivery', label: 'Delivery date & time' },
        { hash: 'bx-email', label: 'Confirm contact email' },
        { hash: 'bx-done', label: 'Added to cart (instant)' },
        { hash: 'bx-done-request', label: 'Request sent (on request)' },
        { hash: 'bx-slug', label: 'Deep link (/:slug)' },
        { hash: 'bx-slug-nf', label: 'Deep link — offer gone' },
        { hash: 'bx-guard', label: 'Empty cart guard' },
      ]},
    ]},
    { group: 'Remote access', items: [
      { file: 'flow-remote-access-mobile.html', label: 'Virtual keys — mobile', icon: '📱', subs: [
        { hash: 'k-keys', label: 'Keys ready (slide to open)' },
        { hash: 'k-gate', label: 'Not available yet (checklist)' },
        { hash: 'k-window', label: 'Before the access window' },
        { hash: 'k-keyless', label: 'Keyless (partner app)' },
        { hash: 'k-doors', label: 'Building — many doors' },
      ]},
      { file: 'flow-remote-access-desktop.html', label: 'Virtual keys — desktop', icon: '🖥', subs: [
        { hash: 'kd-keys', label: 'Keys ready (slide to open)' },
        { hash: 'kd-gate', label: 'Not available yet (checklist)' },
        { hash: 'kd-window', label: 'Before the access window' },
        { hash: 'kd-doors', label: 'Building — many doors' },
      ]},
    ]},
    { group: 'Guidebooks', items: [
      { file: 'flow-guidebooks-mobile.html', label: 'Guidebooks — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'g-list', label: 'Guidebooks list' },
        { hash: 'g-search', label: 'Search with matches' },
        { hash: 'g-guide', label: 'House manual (rich guide)' },
        { hash: 'g-recos', label: 'Local recommendations' },
        { hash: 'g-pdf', label: 'PDF guidebook' },
        { hash: 'g-html', label: 'Web (HTML) guidebook' },
        { hash: 'g-unavailable', label: 'Not available yet' },
        { hash: 'g-empty', label: 'No guidebooks' },
      ]},
      { file: 'flow-guidebooks-desktop.html', label: 'Guidebooks — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'gd-list', label: 'Guidebooks grid' },
        { hash: 'gd-guide', label: 'House manual (rich guide)' },
        { hash: 'gd-recos', label: 'Local recommendations' },
        { hash: 'gd-html', label: 'Web (HTML) guidebook' },
        { hash: 'gd-pdf', label: 'PDF guidebook' },
        { hash: 'gd-unavailable', label: 'Not available yet' },
      ]},
      { file: 'flow-housing-guidebooks-mobile.html', label: 'Housing guidebooks — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'hg-list', label: 'Guidebooks for this home' },
        { hash: 'hg-guide', label: 'House manual (rich guide)' },
        { hash: 'hg-web', label: 'Web (HTML) guidebook' },
        { hash: 'hg-pdf', label: 'PDF guidebook' },
        { hash: 'hg-loading', label: 'Loading (skeleton)' },
        { hash: 'hg-empty', label: 'No guidebooks' },
      ]},
      { file: 'flow-housing-guidebooks-desktop.html', label: 'Housing guidebooks — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'hgd-list', label: 'Guidebooks for this home' },
        { hash: 'hgd-guide', label: 'House manual (rich guide)' },
        { hash: 'hgd-web', label: 'Web (HTML) guidebook' },
        { hash: 'hgd-pdf', label: 'PDF guidebook' },
        { hash: 'hgd-loading', label: 'Loading (skeleton)' },
        { hash: 'hgd-empty', label: 'No guidebooks' },
      ]},
    ]},
    { group: 'AI Travel Guide', items: [
      { file: 'flow-travel-guide-v2.html', label: 'AI Travel Guide — mobile', icon: '📱', subs: [
        { hash: 'tg-intro', label: 'Intro' },
        { hash: 'tg-q', label: 'Shape the plan (3 + 3)' },
        { hash: 'tg-build', label: 'Building' },
        { hash: 'tg-slow', label: 'Still working' },
        { hash: 'tg-error', label: 'Build failed' },
        { hash: 'tg-plan', label: 'The plan' },
        { hash: 'tg-skeleton', label: 'Returning (skeleton)' },
        { hash: 'tg-offline', label: 'Offline (saved plan)' },
        { hash: 'tg-empty', label: 'Empty guide' },
      ]},
      { file: 'flow-travel-guide-desktop-v2.html', label: 'AI Travel Guide — desktop', icon: '🖥', subs: [
        { hash: 'tgd-intro', label: 'Intro' },
        { hash: 'tgd-q', label: 'Shape the plan (3 + 3)' },
        { hash: 'tgd-build', label: 'Building' },
        { hash: 'tgd-error', label: 'Build failed' },
        { hash: 'tgd-plan', label: 'The plan + trip rail' },
        { hash: 'tgd-skeleton', label: 'Returning (skeleton)' },
        { hash: 'tgd-empty', label: 'Empty guide' },
      ]},
    ]},
    { group: 'Kiosk', items: [
      { file: 'flow-keycards-kiosko.html', label: 'Key cards — kiosk', icon: '🖥', by: 'opus', subs: [
        { hash: 'kc-guests', label: 'Arrive (guests still pending)' },
        { hash: 'kc-main', label: 'Key cards — 1 of 3 printed' },
        { hash: 'kc-printing', label: 'Print → dispense' },
        { hash: 'kc-cards', label: 'More cards owed' },
        { hash: 'kc-complete', label: 'Last card printed' },
        { hash: 'kc-error', label: 'Dispenser failed' },
        { hash: 'kc-noroom', label: 'No room assigned' },
      ]},
    ]},
    { group: 'Travel eSIM', items: [
      { file: 'flow-esim-v2.html', label: 'Travel eSIM — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'e2-hub', label: 'eSIM home' },
        { hash: 'e2-owned', label: 'Home — eSIM ready to install' },
        { hash: 'e2-plans', label: 'Choose a plan' },
        { hash: 'e2-plans-loading', label: 'Plans loading (skeleton)' },
        { hash: 'e2-plans-empty', label: 'No plans for this country' },
        { hash: 'e2-reserving', label: 'Reserving → my eSIMs' },
        { hash: 'e2-my', label: 'Install ladder (not installed)' },
        { hash: 'e2-my-done', label: 'Installed & connected' },
        { hash: 'e2-my-empty', label: 'No eSIMs yet' },
        { hash: 'e2-help', label: 'Help & FAQ' },
      ]},
      { file: 'flow-esim-desktop-v2.html', label: 'Travel eSIM — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'ed2-hub', label: 'eSIM home' },
        { hash: 'ed2-plans', label: 'Choose a plan (ledger)' },
        { hash: 'ed2-plans-loading', label: 'Plans loading (skeleton)' },
        { hash: 'ed2-my', label: 'Install — hand off to the phone' },
        { hash: 'ed2-my-done', label: 'Installed & connected' },
      ]},
    ]},
    { group: 'Chat with host', items: [
      { file: 'flow-chat-mobile.html', label: 'Chat with host — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'c-conversation', label: 'Conversation (active thread)' },
        { hash: 'c-empty', label: 'First message (empty)' },
        { hash: 'c-verify', label: "Verify it's you (OTP)" },
        { hash: 'c-sending', label: 'Delivery & read receipts' },
        { hash: 'c-attach', label: 'Photos & files' },
        { hash: 'c-offline', label: 'Reconnecting' },
        { hash: 'c-unavailable', label: 'Chat not available' },
        { hash: 'c-noreg', label: 'Register to chat' },
      ]},
      { file: 'flow-chat-desktop.html', label: 'Chat with host — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'cd-conversation', label: 'Conversation (active thread)' },
        { hash: 'cd-empty', label: 'First message (empty)' },
        { hash: 'cd-verify', label: "Verify it's you (OTP)" },
        { hash: 'cd-unavailable', label: 'Chat not available' },
      ]},
    ]},
    { group: 'Check-out', items: [
      { file: 'flow-checkout-mobile.html', label: 'Check-out — mobile', icon: '📱', by: 'opus', subs: [
        { hash: 'co-leave', label: 'Before you leave (settle up)' },
        { hash: 'co-pay', label: 'Pay a final add-on' },
        { hash: 'co-rate', label: 'Rate your stay' },
        { hash: 'co-thanks', label: 'Thanks (great rating)' },
        { hash: 'co-recovery', label: 'Low rating → repair' },
        { hash: 'co-done', label: 'Already checked out' },
      ]},
      { file: 'flow-checkout-desktop.html', label: 'Check-out — desktop', icon: '🖥', by: 'opus', subs: [
        { hash: 'cd-leave', label: 'Before you leave (settle up)' },
        { hash: 'cd-pay', label: 'Pay a final add-on' },
        { hash: 'cd-rate', label: 'Rate your stay' },
        { hash: 'cd-thanks', label: 'Thanks (great rating)' },
        { hash: 'cd-recovery', label: 'Low rating → repair' },
        { hash: 'cd-done', label: 'Already checked out' },
      ]},
    ]},
    { group: 'FAQ & language', items: [
      { file: 'flow-faq-mobile.html', label: 'FAQ & language — mobile', icon: '📱', subs: [
        { hash: 'h-faq', label: 'FAQ page' },
        { hash: 'h-search', label: 'Search with matches' },
        { hash: 'h-empty', label: 'No results' },
        { hash: 'h-lang', label: 'Language sheet' },
        { hash: 'h-es', label: 'Switched to Español' },
      ]},
      { file: 'flow-faq-desktop.html', label: 'FAQ & language — desktop', icon: '🖥', subs: [
        { hash: 'hd-faq', label: 'FAQ page' },
        { hash: 'hd-search', label: 'Search with matches' },
        { hash: 'hd-lang', label: 'Language dialog' },
        { hash: 'hd-es', label: 'Switched to Español' },
      ]},
    ]},
    { group: 'Error & recovery', items: [
      { file: 'flow-error-mobile.html', label: 'Error states — mobile', icon: '📱', subs: [
        { hash: 'err-link', label: 'Invalid link (→ search)' },
        { hash: 'err-rate', label: 'Too many requests (countdown)' },
        { hash: 'err-crash', label: 'Something went wrong (ref)' },
        { hash: 'err-embedded', label: 'SDK embedded (host site)' },
      ]},
      { file: 'flow-error-desktop.html', label: 'Error states — desktop', icon: '🖥', subs: [
        { hash: 'erd-link', label: 'Invalid link (→ search)' },
        { hash: 'erd-rate', label: 'Too many requests (countdown)' },
        { hash: 'erd-crash', label: 'Something went wrong (ref)' },
        { hash: 'erd-embedded', label: 'SDK embedded (host site)' },
      ]},
    ]},
    { group: 'Building blocks', items: [
      { file: 'vela.html', label: 'Vela helper', icon: '✦' },
      { file: 'modals-demo.html', label: 'Modals & overlays', icon: '▣' },
      { file: 'scroll-demo.html', label: 'Scroll behavior', icon: '↕' },
    ]},
  ];

  var current = location.pathname.split('/').pop() || 'index.html';

  var css = [
    '.proto-nav{position:fixed;bottom:18px;right:18px;z-index:9999;font-family:Poppins,-apple-system,sans-serif}',
    '.proto-nav summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:99px;background:rgba(22,22,67,0.88);backdrop-filter:blur(16px) saturate(1.5);-webkit-backdrop-filter:blur(16px) saturate(1.5);border:1px solid rgba(140,165,255,0.25);color:#fff;font-size:12.5px;font-weight:600;box-shadow:0 10px 30px rgba(22,22,67,0.35);user-select:none}',
    '.proto-nav summary::-webkit-details-marker{display:none}',
    '.proto-nav summary:hover{background:rgba(30,30,85,0.92)}',
    '.proto-nav summary .pn-dot{width:8px;height:8px;border-radius:50%;background:#8ca5ff;box-shadow:0 0 8px rgba(140,165,255,0.9)}',
    '.proto-nav .pn-menu{position:absolute;bottom:54px;right:0;width:420px;max-width:calc(100vw - 36px);border-radius:16px;background:rgba(255,255,255,0.94);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);border:1px solid rgba(229,230,238,0.9);box-shadow:0 20px 50px rgba(22,22,67,0.25);padding:10px;max-height:76vh;overflow-y:auto}',
    '.proto-nav .pn-group{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:10px 10px 5px}',
    '.proto-nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;font-size:12.5px;font-weight:600;color:#161643;text-decoration:none}',
    '.proto-nav a:hover{background:#f0f3ff}',
    '.proto-nav a.active{background:#e3efff;color:#385bf8;box-shadow:inset 0 0 0 1px rgba(56,91,248,0.3)}',
    '.proto-nav a .pn-ic{width:20px;text-align:center;flex-shrink:0;font-size:13px}',
    /* the label is the only flexible part of the row: it truncates, the badges never do */
    '.proto-nav a .pn-label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    /* a proposal is secondary to the shipped variant above it: quieter name, same badges */
    '.proto-nav a.is-proposal .pn-label{color:#6b6b95;font-weight:500}',
    '.proto-nav a.is-proposal .pn-ic{opacity:0.55}',
    '.proto-nav a.is-proposal:hover .pn-label{color:#161643}',
    '.proto-nav a.is-proposal.active .pn-label{color:#161643;font-weight:600}',
    '.proto-nav a .pn-badge{flex-shrink:0;margin-left:6px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#385bf8;background:#f0f3ff;border-radius:99px;padding:2px 7px}',
    '.proto-nav a.active .pn-badge{background:#fff}',
    /* "Opus" author tag (these flows were built by Opus, the rest by Fable) */
    '.proto-nav a .pn-prop{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.03em;color:#b86a00;background:#fff9db;border:1px solid #ffe9a3;border-radius:99px;padding:1px 5px;margin-left:6px;flex-shrink:0}',
    '.proto-nav a .pn-cur{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.03em;color:#6b6b95;background:#f0f0f8;border:1px solid #dedeeb;border-radius:99px;padding:1px 5px;margin-left:6px;flex-shrink:0}',
    '.proto-nav a .pn-by{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.03em;color:#7a5cff;background:#efeaff;border:1px solid #ddd2ff;border-radius:99px;padding:1px 5px;margin-left:6px;flex-shrink:0}',
    '.proto-nav a .pn-by.pn-by-fable{color:#0f9f80;background:#e8fcf7;border-color:#bff0e4}',
    '.proto-nav .pn-note .pn-by.pn-by-fable{margin-left:0}',
    '.proto-nav .pn-note{display:flex;align-items:center;gap:7px;margin:6px 4px 2px;padding:9px 10px;border-top:1px solid rgba(229,230,238,0.9);font-size:10.5px;font-weight:500;color:#6b6b95;line-height:1.4}',
    '.proto-nav .pn-note b{color:#7a5cff;font-weight:800}',
    /* hover flyout with flow scenarios — fixed panel to the LEFT of the menu */
    '.proto-nav a .pn-more{flex-shrink:0;margin-left:6px;color:#9696b9;font-size:12px}',
    '.proto-nav a.active .pn-more{color:#385bf8}',
    '.pn-flyout{position:fixed;z-index:10000;display:none;width:252px;border-radius:14px;background:rgba(255,255,255,0.97);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);border:1px solid rgba(229,230,238,0.9);box-shadow:0 16px 44px rgba(22,22,67,0.25);padding:8px;font-family:Poppins,-apple-system,sans-serif}',
    '.pn-flyout .pn-fly-title{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#9696b9;padding:8px 10px 5px}',
    '.pn-flyout a.pn-sub{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:11.5px;font-weight:500;color:#6b6b95;border-radius:8px;text-decoration:none}',
    '.pn-flyout a.pn-sub:hover{color:#385bf8;background:#f0f3ff}',
    '.pn-flyout a.pn-sub .pn-dot2{width:5px;height:5px;border-radius:50%;background:#cecede;flex-shrink:0}',
    '.pn-flyout a.pn-sub:hover .pn-dot2{background:#385bf8}',
    /* `hidden` must beat the display:flex on rows and notes */
    '.proto-nav [hidden]{display:none !important}',
    /* search */
    '.proto-nav .pn-search{position:sticky;top:-10px;z-index:2;display:flex;align-items:center;gap:8px;margin:-10px -10px 4px;padding:12px 14px 10px;background:rgba(255,255,255,0.97);backdrop-filter:blur(8px);border-bottom:1px solid rgba(229,230,238,0.9);border-radius:16px 16px 0 0}',
    '.proto-nav .pn-search svg{width:15px;height:15px;flex-shrink:0;fill:none;stroke:#9696b9;stroke-width:2;stroke-linecap:round}',
    '.proto-nav .pn-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-family:inherit;font-size:12.5px;font-weight:500;color:#161643}',
    '.proto-nav .pn-search input::placeholder{color:#9696b9;font-weight:500}',
    '.proto-nav .pn-search input::-webkit-search-cancel-button{-webkit-appearance:none}',
    '.proto-nav .pn-search kbd{flex-shrink:0;font-family:inherit;font-size:9.5px;font-weight:700;color:#9696b9;background:#f0f0f8;border:1px solid #dedeeb;border-bottom-width:2px;border-radius:5px;padding:1px 5px}',
    '.proto-nav .pn-search:focus-within svg{stroke:#385bf8}',
    '.proto-nav .pn-search:focus-within kbd{opacity:0}',
    '.proto-nav .pn-empty{padding:22px 10px;text-align:center;font-size:12px;font-weight:500;color:#9696b9}',
    '.proto-nav a.pn-cursor{background:#e3efff;box-shadow:inset 0 0 0 1px rgba(56,91,248,0.3)}',
    '@media print{.proto-nav{display:none}}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var menu = '';
  var FLY = {};
  PAGES.forEach(function (g) {
    menu += '<div class="pn-group">' + g.group + '</div>';
    // Proposals sit *below* the shipped variant they propose to replace.
    var items = g.items.slice().sort(function (a, b) {
      return (a.proposal ? 1 : 0) - (b.proposal ? 1 : 0);
    });
    items.forEach(function (p) {
      var active = p.file === current;
      // What you can type to find a flow: its group, name, file, badges, author.
      var hay = [g.group, p.label, p.file,
        p.proposal ? 'proposal' : '', p.current ? 'current' : '',
        p.by === 'opus' ? 'opus' : 'fable'
      ].join(' ').toLowerCase();
      menu += '<a href="' + p.file + '"' + ' class="' + (active ? 'active ' : '') + (p.proposal ? 'is-proposal' : '') + '"' +
        ' data-search="' + hay.replace(/"/g, '') + '"' +
        (p.subs ? ' data-fly="' + p.file + '"' : '') + '>' +
        '<span class="pn-ic">' + p.icon + '</span>' + '<span class="pn-label">' + p.label + '</span>' +
        (p.proposal ? '<span class="pn-prop" title="Proposed redesign — not the shipped variant">Proposal</span>' : '') +
        (p.current ? '<span class="pn-cur" title="Matches what is in the app today">Current</span>' : '') +
        (p.file === 'index.html' ? '' :
          (p.by === 'opus'
            ? '<span class="pn-by" title="Built by Opus">Opus</span>'
            : '<span class="pn-by pn-by-fable" title="Built by Fable">Fable</span>')) +
        (active ? '<span class="pn-badge">viewing</span>' : '') +
        (p.subs ? '<span class="pn-more">‹</span>' : '') + '</a>';
      if (p.subs) {
        var fly = '<div class="pn-fly-title">Flows</div>';
        p.subs.forEach(function (sub) {
          fly += '<a class="pn-sub" href="' + p.file + '#' + sub.hash + '">' +
            '<span class="pn-dot2"></span>' + sub.label + '</a>';
        });
        FLY[p.file] = fly;
      }
    });
  });

  // legend: which flows were built by Opus vs Fable
  menu += '<div class="pn-note"><span class="pn-prop" style="margin-left:0">Proposal</span> <span><b>Proposal</b> flows are redesign proposals shown beside the <b>Current</b> shipped variant — they are not the main variant.</span></div>';
  menu += '<div class="pn-note"><span style="display:inline-flex;gap:4px;flex-shrink:0"><span class="pn-by">Opus</span><span class="pn-by pn-by-fable">Fable</span></span> <span>Every flow is tagged by the model that built it — <b>Opus</b> or <b style="color:#0f9f80">Fable</b>.</span></div>';

  var nav = document.createElement('details');
  nav.className = 'proto-nav';
  nav.innerHTML =
    '<summary><span class="pn-dot"></span> Prototypes</summary>' +
    '<div class="pn-menu">' +
      '<div class="pn-search">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<input type="search" placeholder="Search flows…" aria-label="Search prototypes" autocomplete="off" spellcheck="false">' +
        '<kbd>/</kbd>' +
      '</div>' +
      '<div class="pn-empty" hidden>No flow matches that.</div>' +
      menu + '</div>';
  document.body.appendChild(nav);

  var fly = document.createElement('div');
  fly.className = 'pn-flyout';
  document.body.appendChild(fly);
  var hideT = null;

  function showFly(a) {
    clearTimeout(hideT);
    fly.innerHTML = FLY[a.getAttribute('data-fly')] || '';
    fly.style.display = 'block';
    var menuBox = nav.querySelector('.pn-menu').getBoundingClientRect();
    fly.style.right = (window.innerWidth - menuBox.left + 8) + 'px';
    fly.style.top = '0px';
    var top = a.getBoundingClientRect().top - 8;
    var h = fly.offsetHeight;
    if (top + h > window.innerHeight - 10) top = window.innerHeight - 10 - h;
    if (top < 10) top = 10;
    fly.style.top = top + 'px';
  }
  function hideFly(now) {
    clearTimeout(hideT);
    if (now) { fly.style.display = 'none'; return; }
    hideT = setTimeout(function () { fly.style.display = 'none'; }, 140);
  }

  nav.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('a[data-fly]');
    if (a) showFly(a);
    else hideFly(false);
  });
  nav.addEventListener('mouseleave', function () { hideFly(false); });
  fly.addEventListener('mouseenter', function () { clearTimeout(hideT); });
  fly.addEventListener('mouseleave', function () { hideFly(false); });
  nav.addEventListener('toggle', function () { if (!nav.open) hideFly(true); });

  /* ── search ───────────────────────────────────────────────────────────────
     Filters the flow list by name, group, badge or author. Scenarios are not
     searched — they stay in the hover flyout, one level down.
     ------------------------------------------------------------------------ */
  var menuEl = nav.querySelector('.pn-menu');
  var input = nav.querySelector('.pn-search input');
  var empty = nav.querySelector('.pn-empty');
  var groups = [].slice.call(menuEl.querySelectorAll('.pn-group'));
  var notes = [].slice.call(menuEl.querySelectorAll('.pn-note'));
  var rows = [].slice.call(menuEl.querySelectorAll('a[data-search]'));
  var cursor = -1;

  function visibleRows() {
    return rows.filter(function (r) { return !r.hidden; });
  }
  function setCursor(i) {
    var vis = visibleRows();
    rows.forEach(function (r) { r.classList.remove('pn-cursor'); });
    if (!vis.length) { cursor = -1; return; }
    cursor = (i + vis.length) % vis.length;
    var el = vis[cursor];
    el.classList.add('pn-cursor');
    el.scrollIntoView({block: 'nearest'});
  }

  function filter(q) {
    var tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var searching = tokens.length > 0;
    rows.forEach(function (r) {
      var hay = r.getAttribute('data-search');
      r.hidden = !tokens.every(function (t) { return hay.indexOf(t) !== -1; });
    });

    // a group header survives only if a row under it did
    var shown = 0;
    groups.forEach(function (h) {
      var any = false;
      for (var n = h.nextElementSibling; n && !n.classList.contains('pn-group'); n = n.nextElementSibling) {
        if (n.tagName === 'A' && !n.hidden) { any = true; break; }
      }
      h.hidden = !any;
      if (any) shown++;
    });

    notes.forEach(function (n) { n.hidden = searching; });
    empty.hidden = visibleRows().length > 0;
    setCursor(0);
  }

  input.addEventListener('input', function () { filter(input.value); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(cursor + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(cursor - 1); }
    else if (e.key === 'Enter') {
      var vis = visibleRows();
      if (vis[cursor]) { e.preventDefault(); vis[cursor].click(); }
    } else if (e.key === 'Escape') {
      // first Escape clears the query, a second one closes the menu
      if (input.value) { e.preventDefault(); e.stopPropagation(); input.value = ''; filter(''); }
    }
  });

  // opening the menu focuses the field; closing it resets the filter
  nav.addEventListener('toggle', function () {
    if (nav.open) { input.focus(); input.select(); }
    else { input.value = ''; filter(''); }
  });

  // "/" from anywhere opens the nav and focuses search
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      nav.open = true;
      input.focus();
    } else if (e.key === 'Escape' && nav.open && !input.value) {
      nav.open = false;
    }
  });

  document.addEventListener('click', function (e) {
    if (nav.open && !nav.contains(e.target) && !fly.contains(e.target)) nav.open = false;
    var sub = e.target.closest && (e.target.closest('.proto-nav a') || e.target.closest('.pn-flyout a'));
    if (sub) { nav.open = false; hideFly(true); }
  });
})();
