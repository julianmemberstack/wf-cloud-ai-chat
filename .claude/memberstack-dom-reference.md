# Memberstack DOM Package Reference

**Package:** @memberstack/dom  
**Purpose:** Authentication and member management for web applications  
**Version:** Latest (as of 2024)

## Quick Start

```bash
npm install @memberstack/dom
```

```javascript
import memberstackDOM from '@memberstack/dom';

const memberstack = memberstackDOM.init({
  publicKey: 'pk_your_public_key_here',
  useCookies: true,
  sessionDurationDays: 30
});
```

## Core Authentication Methods

### Email/Password Authentication

```javascript
// Signup
const result = await memberstack.signupMemberEmailPassword({
  email: "user@example.com",
  password: "securePassword123",
  customFields: { firstName: "John", lastName: "Doe" },
  plans: [{ planId: "pln_free-plan-id" }]  // Array of objects
});

// Login
const result = await memberstack.loginMemberEmailPassword({
  email: "user@example.com",
  password: "userPassword"
});

// Logout
await memberstack.logout();
```

### Social Provider Authentication

```javascript
// Signup with provider (redirects immediately)
await memberstack.signupWithProvider({
  provider: "google",
  allowLogin: true,
  plans: [{ planId: "pln_free-plan-id" }]
});

// Login with provider (redirects immediately)
await memberstack.loginWithProvider({
  provider: "google",
  allowSignup: true
});
```

### Passwordless Authentication

```javascript
// Send magic link
await memberstack.sendMemberLoginPasswordlessEmail({
  email: "user@example.com"
});

// Complete login with token
const result = await memberstack.loginMemberPasswordless({
  email: "user@example.com",
  passwordlessToken: "token_from_email"
});
```

## Member Management

### Get Current Member

```javascript
const { data: member } = await memberstack.getCurrentMember();
if (member) {
  console.log(member.auth.email);        // Email address
  console.log(member.planConnections);   // Active plans
  console.log(member.customFields);      // Custom fields
  console.log(member.verified);          // Email verified status
}
```

### Update Member

```javascript
// Update custom fields
await memberstack.updateMember({
  customFields: {
    firstName: "Jane",
    lastName: "Smith"
  }
});

// Update auth (email/password)
await memberstack.updateMemberAuth({
  email: "newemail@example.com",
  oldPassword: "current",
  newPassword: "newSecure123"
});
```

### JSON Storage

```javascript
// Store JSON data
await memberstack.updateMemberJSON({
  json: { preferences: { theme: "dark" } }
});

// Retrieve JSON data
const memberJson = await memberstack.getMemberJSON();
```

## Plan Management

### Managing Plans

```javascript
// Get all plans
const { data: plans } = await memberstack.getPlans();

// Add free plan
await memberstack.addPlan({
  planId: "pln_free-plan-id"
});

// Remove plan
await memberstack.removePlan({
  planId: "pln_plan-id"
});
```

### Stripe Integration

```javascript
// Start checkout (paid plans use Price IDs)
const { data } = await memberstack.purchasePlansWithCheckout({
  priceId: "prc_stripe-price-id",  // NOT plan ID!
  successUrl: "https://yoursite.com/success",
  cancelUrl: "https://yoursite.com/cancel",
  autoRedirect: false
});

// Launch customer portal
await memberstack.launchStripeCustomerPortal({
  returnUrl: "https://yoursite.com/dashboard"
});
```

## Pre-built Modals

```javascript
// Open modals (note different parameter structure)
await memberstack.openModal("LOGIN", {
  signup: {
    plans: ["pln_free-plan-id"]  // Array of strings in modals!
  }
});

await memberstack.openModal("SIGNUP");
await memberstack.openModal("PROFILE");

// Close any open modal
await memberstack.hideModal();
```

## Authentication State

```javascript
// Listen for auth changes
const authListener = memberstack.onAuthChange((member) => {
  if (member) {
    console.log("User logged in:", member);
  } else {
    console.log("User logged out");
  }
});

// Always unsubscribe when done
authListener.unsubscribe();

// Get auth token
const token = memberstack.getMemberToken();
```

## Error Handling

```javascript
try {
  await memberstack.loginMemberEmailPassword({
    email: "user@example.com",
    password: "wrongpassword"
  });
} catch (error) {
  switch (error.code) {
    case 'invalid_credentials':
      alert('Invalid email or password');
      break;
    case 'email_not_verified':
      alert('Please verify your email');
      break;
    case 'member_not_found':
      alert('No account found');
      break;
    case 'too_many_requests':
      alert('Too many attempts');
      break;
    default:
      alert(error.message);
  }
}
```

## Common Patterns

### Protected Routes

```javascript
async function requireAuth() {
  const { data: member } = await memberstack.getCurrentMember();
  if (!member) {
    window.location.href = '/login';
    return false;
  }
  return true;
}
```

### Plan-Based Access

```javascript
async function checkPlanAccess(requiredPlanId) {
  const { data: member } = await memberstack.getCurrentMember();
  if (!member) return false;
  
  return member.planConnections?.some(
    conn => conn.planId === requiredPlanId && conn.active
  );
}
```

## Critical Implementation Notes

1. **Always check authentication first**: Use `getCurrentMember()` before member operations
2. **Plan IDs vs Price IDs**: Free plans use Plan IDs (pln_), paid plans use Price IDs (prc_)
3. **Modal vs Method Parameters**: 
   - Methods: `plans: [{ planId: "pln_..." }]`
   - Modals: `signup: { plans: ["pln_..."] }`
4. **Provider auth redirects**: `signupWithProvider()` and `loginWithProvider()` redirect immediately
5. **Custom fields**: All stored as strings - parse when reading
6. **Return values**: Most methods return `{ data: ... }` except `getMemberJSON()`
7. **Modal behavior**: Modals don't close automatically - call `hideModal()`
8. **Error handling**: Always use try/catch blocks
9. **Unsubscribe listeners**: Always unsubscribe from `onAuthChange`
10. **Test vs Live**: Different public keys and IDs for test/live modes

## Framework Examples

### React
```javascript
useEffect(() => {
  const ms = memberstackDOM.init({
    publicKey: 'pk_...',
    useCookies: true
  });
  setMemberstack(ms);
}, []);
```

### Vue
```javascript
onMounted(() => {
  memberstack = memberstackDOM.init({
    publicKey: "pk_...",
    useCookies: true
  });
});
```

### Next.js
```javascript
// middleware.ts
const { data: member } = await memberstack.getCurrentMember();
if (!member) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

## Type Definitions

```typescript
interface Member {
  id: string;
  verified: boolean;
  auth: {
    email: string;
    hasPassword: boolean;
    providers: Array<{ provider: string }>;
  };
  customFields: { [key: string]: any };
  planConnections: Array<{
    planId: string;
    active: boolean;
    status: string;
  }>;
}
```

## Common Mistakes to Avoid

- ❌ `memberstack.login()` → ✅ `memberstack.loginMemberEmailPassword()`
- ❌ `member.email` → ✅ `member.auth.email`
- ❌ `member.plans` → ✅ `member.planConnections`
- ❌ Using Plan IDs for paid plans → ✅ Use Price IDs for paid plans
- ❌ Forgetting to unsubscribe listeners → ✅ Always call `unsubscribe()`