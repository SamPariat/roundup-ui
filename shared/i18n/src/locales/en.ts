/**
 * Every user-visible string in the client, nested by the feature or component that shows it.
 * `as const` keeps the literal key paths, which i18next's CustomTypeOptions (types.ts) turns into
 * type-checked t() keys. Plural forms use i18next's _one/_other suffixes. English is the only
 * language for now; another locale is a file with the same shape.
 */
export const en = {
  common: {
    appName: 'Roundup',
    back: 'Back',
    close: 'Close',
    loading: 'Loading',
    members_one: '{{count}} member',
    members_other: '{{count}} members',
  },
  nav: {
    main: 'Main',
    sidebar: 'Sidebar',
    tabs: {
      squads: 'Squads',
      explore: 'Explore',
      profile: 'Profile',
    },
  },
  tabs: {
    withCount: '{{label}}, {{total}}',
  },
  listRow: {
    spoken: '{{title}}, {{subtitle}}',
  },
  otpInput: {
    resendIn: 'Resend code in',
    didntGetIt: "Didn't get it?",
    resend: 'Resend code',
  },
  phoneInput: {
    countryCode: 'IN +91',
    placeholder: '98765 43210',
  },
  price: {
    mark: '₹',
    level: 'Price level {{level}} of 4',
  },
  rating: {
    outOf: '{{value}} out of 5',
    outOfWithReviews: '{{value}} out of 5, {{reviews}} reviews',
  },
  squadCard: {
    admin: 'Admin',
    spoken: '{{name}}, {{members}}',
    spokenAdmin: '{{name}}, {{members}}, {{admin}}',
  },
  themeSwitch: {
    label: 'Theme',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  venueCard: {
    save: 'Save to squad',
    saved: 'Saved to squad',
    open: 'Open',
    closed: 'Closed',
  },
  welcome: {
    label: 'Welcome to Roundup',
    title: 'Weekend plans for the whole squad.',
    body: 'Make a squad, find a place nearby, and keep a record of every night out.',
    start: 'Continue with phone',
    newHere: 'New here? The same code creates your account.',
    points: {
      squads: {
        title: 'Squads',
        text: 'Add friends by phone number. Admins keep the list tidy.',
      },
      explore: {
        title: 'Explore',
        text: 'Find bars, cafes and restaurants near you.',
      },
      history: {
        title: 'History',
        text: 'See where the squad has been, and how often.',
      },
    },
  },
  signIn: {
    phone: {
      title: 'Sign in',
      body: 'Use your mobile number to get back to your squads.',
      label: 'Phone number',
      helper: "We'll text you a 6-digit code.",
      submit: 'Send code',
      submitting: 'Sending code…',
      newHere: 'New here? The same code creates your account.',
    },
    code: {
      title: 'Enter the code',
      body: 'We sent it to {{phone}}.',
      label: '6-digit code',
      submit: 'Verify',
      submitting: 'Checking code…',
      changeNumber: 'Change number',
    },
  },
  errors: {
    invalidPhone: 'Enter a 10-digit mobile number that starts with 6, 7, 8 or 9.',
    invalidName: 'Enter a name between 1 and 50 characters.',
    wrongCode: "That code isn't right. Check it and try again.",
    codeExpired: 'That code has expired or was tried too many times. Ask for a new one.',
    tooManyRequests: 'Too many tries. Wait a few minutes and try again.',
    offline: "You're offline. Check your connection and try again.",
    generic: 'Something went wrong. Try again.',
    genericWithId:
      'Something went wrong. Try again. If it keeps happening, quote this reference: {{requestId}}',
  },
  screens: {
    squads: {
      emptyTitle: 'No squads yet',
      emptyBody: 'Make one and add your friends.',
    },
    explore: {
      emptyTitle: 'Nothing to explore yet',
      emptyBody: 'Bars, cafes and restaurants near you will show up here.',
    },
    profile: {
      themeHeading: 'Theme',
      emptyTitle: 'Your profile is empty',
      emptyBody: 'Your name and photo show up here once you sign in.',
    },
    notFound: {
      windowTitle: 'Not found',
      title: 'Page not found',
      body: "That link doesn't lead anywhere. Check it and try again.",
      action: 'Go to your squads',
    },
  },
} as const
