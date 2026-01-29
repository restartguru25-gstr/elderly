# Fix "Missing or insufficient permissions" for admin (50above50 / contests)

## Why the error happens

The app uses **Firestore Security Rules** to decide who can read/write. Listing contest submissions at `contests/50above50/submissions` is allowed only if:

1. You are signed in ✅ (you are: admin@smr.com)
2. **And** for each document, one of:
   - `status == 'approved'`, or
   - `userId == your uid`, or
   - **you are an admin** (`isAdmin()` is true)

**Admin is determined by your user document in Firestore**, not by Firebase Auth email. So the "real problem" is either:

- Your **Firestore rules** in the Firebase project are not the latest (not deployed), or  
- Your **user profile in Firestore** does not exist or does not have admin flags set.

---

## What you need to do (your side)

### Step 1: Deploy the latest Firestore rules

The rules in this repo (with `exists()` check for `isAdmin()`) must be deployed to your Firebase project:

```bash
cd /home/surya/Downloads/elderly-main
firebase deploy --only firestore:rules
```

If you use a different project alias:

```bash
firebase use your-project-id
firebase deploy --only firestore:rules
```

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

After Step 1 and Step 2, the "Missing or insufficient permissions" error for listing `contests/50above50/submissions` should stop (after a refresh or re-login if needed).

---

## React error #418 (hydration)

That is a separate issue: "Hydration failed because the server-rendered HTML didn’t match the client." It does not block the app but can cause a re-render. We’ve added `suppressHydrationWarning` on the body to reduce noise. To see the **exact** mismatch, run in **development**:

```bash
npm run dev
```

Then open the app and check the browser console for the full React 418 message and stack trace. Fixing the reported node (e.g. invalid HTML nesting or client-only content rendered on the server) will remove the warning.
