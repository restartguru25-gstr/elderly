# Fix "Missing or insufficient permissions" for admin (50above50 / contests)

## Why the error happens

**Collection queries use `list`**, not `read` alone. In Firestore, `read` = `get` + `list`.  
The rules **explicitly `allow list`** on `contests/{contestId}/submissions`. Without that, **"Missing or insufficient permissions"** on list never goes away.

Listing submissions is allowed only when you're signed in **and** for each document one of:

- `status == 'approved'`, or  
- `userId == your uid`, or  
- **you are an admin** (`isAdmin()`)

**Admin** = `admin@smr.com` (email) **or** user doc with `isAdmin: true` / `userType: 'admin'`.

The "real problem" is usually:

- **Rules not deployed** (Firebase still has old rules), or  
- **User not admin** (no user doc or missing admin flags).

---

## What you need to do (your side)

### Step 1: Deploy the latest Firestore rules

The rules in this repo (explicit `allow list` for submissions, `isAdmin()` with email + user doc) must be deployed:

```bash
cd /home/surya/Downloads/elderly-main
firebase deploy --only firestore:rules
```

If you use a different project alias: `firebase use your-project-id`, then run deploy.

**Then:** wait ~1 minute, then hard-refresh the app (Ctrl+Shift+R / Cmd+Shift+R).

### Step 2: Create or update your user document as admin

Your Firebase Auth user is **admin@smr.com** with uid **6njOuKAigqXj1EJe2qGfwvBkm692**. Firestore must have a document at:

**Path:** `users / 6njOuKAigqXj1EJe2qGfwvBkm692`

That document must contain **at least one** of:

- `isAdmin: true` (boolean), or  
- `userType: "admin"` (string)

**Option A – Firebase Console (easiest)**

1. Open [Firebase Console](https://console.firebase.google.com) → your project.
2. Go to **Firestore Database**.
3. Open the **users** collection.
4. Find or create the document with ID **6njOuKAigqXj1EJe2qGfwvBkm692**.
5. Add or edit fields:
   - `isAdmin` = `true` (boolean), **or**
   - `userType` = `"admin"` (string).
6. Save.

**Option B – Let the app create the profile, then edit**

If the document doesn’t exist yet:

1. Sign in once in the app (so the app may create a default user profile).
2. In Firestore, open **users** → document **6njOuKAigqXj1EJe2qGfwvBkm692**.
3. Add `isAdmin: true` or `userType: "admin"` as above.

After Step 1 and Step 2, the "Missing or insufficient permissions" error for listing `contests/50above50/submissions` should stop (refresh or re-login if needed).

### Optional: Verify token email

In the browser console (while signed in):

```js
// If using Firebase v9+ modular SDK, get auth from your app and run:
// (adjust import path as in your app)
import { getAuth } from 'firebase/auth';
const auth = getAuth();
auth.currentUser?.getIdTokenResult().then(t => console.log(t.claims?.email));
```

Should log `admin@smr.com` for the admin user. If not, rules that rely on `request.auth.token.email` won’t match.

---

## React error #418 (hydration)

That is a separate issue: "Hydration failed because the server-rendered HTML didn’t match the client." It does not block the app but can cause a re-render. We’ve added `suppressHydrationWarning` on the body to reduce noise. To see the **exact** mismatch, run in **development**:

```bash
npm run dev
```

Then open the app and check the browser console for the full React 418 message and stack trace. Fixing the reported node (e.g. invalid HTML nesting or client-only content rendered on the server) will remove the warning.
