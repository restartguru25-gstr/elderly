# Guardian Features - What Children Can View & Do

## Overview
After linking with a parent (senior) using the Family page, guardians (children) can view their parent's health data, communicate, and book services on their behalf.

---

## 🔍 What Guardians Can VIEW

### 1. **Dashboard Overview**
- **Health Score**: Overall health percentage
- **Medications Status**: How many medications taken today
- **Activity Level**: Recent activities count
- **Parent Status Card**: Real-time updates showing:
  - Medicine taken status (last taken time)
  - Last activity (mood check-in, vital logged, etc.)
  - Current mood (from mood tracker)

### 2. **Vitals** (if `permissions.vitals = true`)
- Blood pressure readings
- Blood sugar levels
- SpO2 (oxygen saturation)
- Weight tracking
- History and trends

### 3. **Medications** (always viewable)
- Medication list and schedules
- Dosage information
- Medication logs (taken/missed)
- Last taken timestamps

### 4. **Telemedicine Appointments**
- Upcoming appointments
- Past appointments
- Doctor details
- Appointment status

### 5. **Mood Check-ins** (if `permissions.vitals = true`)
- Recent mood entries
- Sentiment trends
- Alerts for negative mood shifts

### 6. **Emergency Alerts** (if `permissions.location = true`)
- SOS alerts sent by parent
- Location data (if permission granted)
- Alert timestamps

---

## 💬 Communication Features

### 1. **Call Parent**
- Button on Guardian Dashboard
- Opens phone dialer with parent's phone number (from profile)
- Direct call functionality

### 2. **Send Reminder**
- Button on Guardian Dashboard
- Sends in-app notification/reminder to parent
- Can be used for medications, appointments, etc.

### 3. **Message** (Future)
- In-app messaging between guardian and parent
- Real-time chat functionality

---

## 📅 Booking Services on Behalf of Parent

### 1. **Telemedicine Appointments**
- **How**: Go to **Telemedicine** page → Select parent (if multiple) → Choose doctor → Click "Book Appointment"
- **What happens**: Appointment is created in parent's `telemedicineAppointments` collection
- **Parent sees**: Appointment appears in their Telemedicine page
- **Guardian sees**: Appointment in "Upcoming Events" on dashboard

### 2. **Tours** (Future)
- Book travel packages for parent
- Manage bookings

### 3. **Shop Orders** (Future)
- Place orders for parent
- Track deliveries

---

## 🔐 Permissions & Privacy

### Parent Controls (in Profile → Privacy Controls)
- **Share Vitals Data**: `permissions.vitals`
  - If `true`: Guardian can view vitals, mood, medications
  - If `false`: Guardian cannot view vitals/mood (medications still viewable)
- **Share Location Data**: `permissions.location`
  - If `true`: Guardian can see location in emergency alerts
  - If `false`: Location hidden in alerts

### Default Permissions
- New profiles default to `vitals: true, location: true`
- Parents can change these anytime in Profile settings

---

## 🎯 How It Works

### 1. **Linking Process**
1. Parent generates invite code in **Family** page
2. Child (guardian) enters code in their **Family** page
3. Both profiles updated: `linkedProfiles` array contains each other's user ID

### 2. **Viewing Parent Data**
- Guardian Dashboard automatically fetches linked senior's data
- If multiple parents linked: **Parent Selector** appears at top
- Data fetched from parent's Firestore collections:
  - `users/{parentId}/vitals`
  - `users/{parentId}/medications`
  - `users/{parentId}/telemedicineAppointments`
  - `users/{parentId}/moodCheckins`
  - etc.

### 3. **Booking for Parent**
- Guardian selects parent (if multiple)
- Books appointment → stored in `users/{parentId}/telemedicineAppointments`
- Parent receives notification (future)

---

## 📱 User Interface

### Guardian Dashboard
- **Parent Selector**: Dropdown at top (if multiple parents)
- **Quick Stats**: Health score, medications, activities
- **Parent Status Card**: Real-time activity feed
- **Quick Actions**: Call, Remind, Book Doctor buttons
- **Health Summary**: Weekly metrics
- **Upcoming Events**: Appointments, reminders

### Navigation
- All pages accessible to guardians
- **Vitals**, **Medications**, **Telemedicine** pages show parent's data (read-only for vitals/meds)
- **Profile** page shows guardian's own profile

---

## 🚀 Implementation Status

### ✅ Completed
- Firestore rules updated for guardian access (vitals, medications, mood, appointments, reminders)
- Guardian context/hook (`useLinkedSenior`) and `GuardianProvider`
- Parent selector component (`ParentSelector`)
- **Guardian Dashboard**: Real-time parent data (vitals, medications, mood, appointments), Call Parent (`tel:`), Send Reminder (dialog → `users/{parentId}/reminders`), Book Doctor link
- **Telemedicine**: Book-for-parent; parent selector when guardian; appointments stored in parent's collection
- **Vitals page**: Guardian read-only view with parent selector; Log form hidden for guardians
- **Medications page**: Guardian read-only view with parent selector; Add form and Taken/Skipped hidden for guardians
- **Reminders**: Create (guardian → senior), senior view (`RemindersCard` on dashboard), mark-as-read
- Guardian i18n (en, hi, te, ta, kn, ml)

---

## 🔧 Technical Details

### Firestore Rules
- Guardians can **read** parent's data if:
  1. Guardian's UID is in parent's `linkedProfiles` array
  2. Parent's `permissions.vitals` (or `permissions.location` for alerts) is `true`
- Guardians can **create** appointments for parent
- Guardians **cannot** modify parent's vitals/medications (read-only)

### Data Flow
```
Guardian Dashboard
  → useLinkedSenior() hook
  → Gets linked senior IDs from guardian's profile
  → Fetches senior's profile to check permissions
  → Queries senior's subcollections (vitals, meds, etc.)
  → Displays data respecting permissions
```

---

## 📝 Notes

- **Multiple Parents**: Guardian can link with multiple seniors (e.g., both parents)
- **Permission Changes**: If parent revokes permission, guardian's view updates immediately
- **Real-time**: Data updates in real-time using Firestore listeners
- **Privacy First**: All access controlled by parent's explicit permissions
