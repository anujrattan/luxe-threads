# Cookie Consent Implementation Plan

## Overview
This plan outlines the implementation of a comprehensive cookie consent system for Tinge Clothing, ensuring compliance with Indian and international privacy laws (including future-proofing for GDPR compliance).

---

## 1. Components to Create

### 1.1 CookieConsent Component
**Location**: `frontend/src/components/CookieConsent.tsx`

**Features**:
- Fixed position banner at the bottom of the screen
- Clear messaging about cookie usage
- Three action buttons:
  - **Accept All** - Allows all cookies
  - **Reject Non-Essential** - Only essential cookies
  - **Customize** - Opens detailed preferences modal
- Automatically hides after user makes a selection
- Re-appears if preferences are cleared or after a year

**Design Requirements**:
- Match the site's theme (light/dark mode support)
- Use brand colors for buttons
- Responsive design (mobile-friendly)
- Slide-in animation on mount
- Backdrop overlay for better visibility

---

### 1.2 CookiePreferencesModal Component
**Location**: `frontend/src/components/CookiePreferencesModal.tsx`

**Features**:
- Modal overlay with detailed cookie categories
- Toggle switches for each cookie category:
  - **Essential Cookies** (always on, non-toggleable)
  - **Analytics Cookies** (Google Analytics, etc.)
  - **Marketing Cookies** (future use for retargeting)
  - **Functional Cookies** (user preferences, theme selection)
- Description for each category
- Save preferences button
- Reset to default button

**Cookie Categories**:

#### Essential Cookies
- **Purpose**: Required for the website to function
- **Examples**: Session management, authentication, cart data
- **Cannot be disabled**

#### Analytics Cookies
- **Purpose**: Help us understand how visitors use the site
- **Examples**: Google Analytics, page views, user behavior
- **Optional**

#### Marketing Cookies
- **Purpose**: Track visitors across websites for advertising
- **Examples**: Facebook Pixel, Google Ads (future)
- **Optional**

#### Functional Cookies
- **Purpose**: Remember user preferences
- **Examples**: Theme selection (dark/light mode), currency preference, language
- **Optional**

---

### 1.3 Cookie Management Utility
**Location**: `frontend/src/utils/cookieConsent.ts`

**Functions**:
```typescript
// Get current consent status
getCookieConsent(): CookieConsent | null

// Save user consent preferences
setCookieConsent(preferences: CookieConsent): void

// Check if user has consented
hasUserConsented(): boolean

// Check if specific cookie category is allowed
isCategoryAllowed(category: CookieCategory): boolean

// Clear all consent data (for testing or user request)
clearCookieConsent(): void

// Update specific category consent
updateCategoryConsent(category: CookieCategory, allowed: boolean): void
```

**Types**:
```typescript
type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'functional';

interface CookieConsent {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: string; // Policy version
}
```

---

### 1.4 Context Provider for Cookie Consent
**Location**: `frontend/src/context/CookieConsentContext.tsx`

**Purpose**: 
- Manage cookie consent state globally
- Provide easy access to consent status across components
- Handle consent changes and trigger appropriate actions

**API**:
```typescript
interface CookieConsentContextType {
  consent: CookieConsent | null;
  hasConsented: boolean;
  isAllowed: (category: CookieCategory) => boolean;
  updateConsent: (preferences: CookieConsent) => void;
  showConsentBanner: boolean;
  setShowConsentBanner: (show: boolean) => void;
}
```

---

## 2. Integration Points

### 2.1 App.tsx
- Import and wrap the app with `CookieConsentProvider`
- Render `CookieConsent` component at the root level
- Ensure it appears on all pages

### 2.2 Google Analytics Integration
**Location**: `frontend/src/utils/analytics.ts`

**Implementation**:
```typescript
import { isCategoryAllowed } from './cookieConsent';

// Initialize Google Analytics only if user has consented
export const initializeAnalytics = () => {
  if (isCategoryAllowed('analytics')) {
    // Load Google Analytics script
    // Add GA tracking code
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (isCategoryAllowed('analytics') && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
    });
  }
};

// Track events
export const trackEvent = (eventName: string, eventParams?: any) => {
  if (isCategoryAllowed('analytics') && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};
```

### 2.3 Theme Persistence (Functional Cookies)
**Current**: `AppContext.tsx` already uses localStorage for theme
**Update**: Check if functional cookies are allowed before persisting theme preference

```typescript
// In AppContext.tsx
useEffect(() => {
  if (isCategoryAllowed('functional')) {
    localStorage.setItem('theme', theme);
  }
}, [theme]);
```

---

## 3. Cookie Policy Page

### 3.1 Create Cookie Policy Page
**Location**: `frontend/src/pages/CookiePolicyPage.tsx`

**Content Sections**:
1. **What Are Cookies**: Brief explanation
2. **Types of Cookies We Use**: Detailed breakdown of each category
3. **How We Use Cookies**: Specific use cases
4. **Third-Party Cookies**: External services (Google Analytics, payment processors)
5. **How to Control Cookies**: Browser settings, consent preferences
6. **Updates to This Policy**: Version history and notification process
7. **Contact Us**: Support email

### 3.2 Register Route
Add to `App.tsx`:
```typescript
<Route path="/cookie-policy" element={<CookiePolicyPage />} />
```

### 3.3 Footer Link
Update Footer.tsx to include:
```typescript
<Link to="/cookie-policy">Cookie Policy</Link>
```

---

## 4. Storage Mechanism

### 4.1 LocalStorage
**Key**: `tinge-cookie-consent`
**Value**: JSON stringified `CookieConsent` object

**Example**:
```json
{
  "essential": true,
  "analytics": false,
  "marketing": false,
  "functional": true,
  "timestamp": 1704067200000,
  "version": "1.0"
}
```

### 4.2 Expiration
- Consent valid for **1 year**
- After 1 year, prompt user again
- If policy version changes, prompt user again

---

## 5. Implementation Steps

### Phase 1: Core Components (Priority: High)
1. ✅ Create `CookieConsent.tsx` component
2. ✅ Create `CookiePreferencesModal.tsx` component
3. ✅ Create `cookieConsent.ts` utility functions
4. ✅ Create `CookieConsentContext.tsx` provider
5. ✅ Integrate into `App.tsx`

### Phase 2: Cookie Policy (Priority: High)
1. ✅ Create `CookiePolicyPage.tsx`
2. ✅ Register route in `App.tsx`
3. ✅ Add link in Footer

### Phase 3: Analytics Integration (Priority: Medium)
1. Create `analytics.ts` utility
2. Install Google Analytics script conditionally
3. Integrate page view tracking in `App.tsx`
4. Add event tracking for key actions (add to cart, purchase, etc.)

### Phase 4: Functional Cookies (Priority: Low)
1. Update `AppContext.tsx` to respect functional cookie consent
2. Update any other localStorage usage to check consent

### Phase 5: Testing & Refinement (Priority: High)
1. Test all consent scenarios:
   - Accept All
   - Reject All
   - Custom preferences
   - No consent (default behavior)
2. Test consent persistence across sessions
3. Test consent expiration (1 year)
4. Test policy version change detection
5. Mobile responsiveness testing

---

## 6. Legal Compliance Checklist

### ✅ Must Have
- [ ] Clear and concise language explaining cookie usage
- [ ] Separate consent for different cookie categories
- [ ] Easy way to accept, reject, or customize cookies
- [ ] Link to detailed Cookie Policy
- [ ] Consent persisted and respected across sessions
- [ ] No non-essential cookies loaded before consent

### ✅ Should Have
- [ ] Consent banner appears before any tracking
- [ ] Users can change preferences at any time (add link in footer)
- [ ] Audit log of consent changes (for compliance)
- [ ] Clear distinction between essential and non-essential cookies

### ✅ Nice to Have
- [ ] A/B testing different consent banner designs
- [ ] Analytics on consent rates
- [ ] Multilingual support for consent banner

---

## 7. User Experience Considerations

### 7.1 Non-Intrusive Design
- Banner should not block critical content
- Easy to dismiss or interact with
- Clear visual hierarchy

### 7.2 Transparency
- Clear language, no legal jargon in the banner
- Link to detailed policy for those who want to learn more
- Honest about what data is collected

### 7.3 Respect User Choice
- No dark patterns or deceptive design
- Equal visual weight for "Accept" and "Reject" buttons
- Settings easily accessible after initial choice

---

## 8. Sample Cookie Consent Banner Copy

### Main Banner
```
🍪 We use cookies to improve your experience

We use cookies to analyze site traffic and personalize content. You can choose which cookies you're okay with below.

[Accept All] [Reject Non-Essential] [Customize]

Learn more in our Cookie Policy
```

### Preferences Modal
```
Cookie Preferences

We use different types of cookies to optimize your experience on our website. 
You can choose which categories you'd like to allow:

☑️ Essential Cookies (Always Active)
Required for the website to function properly. These cannot be disabled.
Examples: Session management, authentication, shopping cart

☐ Analytics Cookies
Help us understand how visitors interact with our website.
Examples: Google Analytics, page views, session duration

☐ Marketing Cookies
Used to track visitors across websites to display relevant advertisements.
Examples: Facebook Pixel, Google Ads (not currently in use)

☐ Functional Cookies
Enable enhanced functionality and personalization.
Examples: Theme preference (dark/light mode), language settings

[Save Preferences] [Accept All] [Reject All]
```

---

## 9. Technical Specifications

### 9.1 Component Props

**CookieConsent.tsx**:
```typescript
interface CookieConsentProps {
  position?: 'bottom' | 'top'; // Default: 'bottom'
  theme?: 'light' | 'dark' | 'auto'; // Default: 'auto'
}
```

**CookiePreferencesModal.tsx**:
```typescript
interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: CookieConsent) => void;
  currentPreferences?: CookieConsent;
}
```

### 9.2 Styling
- Use Tailwind CSS classes consistent with the rest of the site
- Support dark mode via `dark:` variants
- Animations: `animate-slideIn`, `animate-fadeIn`

### 9.3 Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader friendly descriptions
- Focus trap in modal

---

## 10. Future Enhancements

1. **Geolocation-based Compliance**
   - Show different consent mechanisms based on user location
   - GDPR compliance for EU visitors
   - CCPA compliance for California visitors

2. **Consent Management Platform (CMP)**
   - Integrate with third-party CMP like OneTrust or Cookiebot
   - Centralized consent management across multiple domains

3. **Advanced Analytics**
   - Track consent rates
   - A/B test different consent banner designs
   - Analyze correlation between consent and user behavior

4. **Automated Cookie Scanning**
   - Periodically scan the website for new cookies
   - Automatically update Cookie Policy with new cookies found

---

## 11. Resources & References

- [India's Personal Data Protection Bill (DPDP Act)](https://www.meity.gov.in/)
- [GDPR Cookie Consent Guidelines](https://gdpr.eu/cookies/)
- [MDN Web Docs: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Google Analytics Consent Mode](https://support.google.com/analytics/answer/9976101)

---

## Summary

This implementation plan provides a comprehensive, legally compliant, and user-friendly cookie consent system for Tinge Clothing. The phased approach ensures critical components are built first, with room for future enhancements as the business grows.

**Next Steps**:
1. Review and approve this plan
2. Begin Phase 1 implementation
3. Test thoroughly in staging environment
4. Deploy to production
5. Monitor consent rates and user feedback

**Estimated Timeline**: 2-3 days for full implementation (Phases 1-3)

