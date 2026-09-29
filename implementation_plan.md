# Vastré: Product Design & Strategy Document

As a Senior Product Designer, before we write a single line of code, we need to map out the **User Journey**, the **Core Loop** (why users keep coming back), and how our features behave across mobile and web. 

We are building this cross-platform using **React Native (Expo)** to ensure a unified codebase while delivering native-like experiences on both platforms.

---

## 1. The Core Loop: Building the "Vastré Habit"
A wardrobe app only works if the user actually logs their clothes. We must make logging frictionless and rewarding.
1. **Trigger:** It's morning. The user needs to get dressed.
2. **Action:** They open Vastré and use the "Style Swipe" to pick an outfit (from their past uploaded photos).
3. **Reward:** They don't have to think. The app logs what they wore automatically upon selection.
4. **Investment:** Because they wore it, the app updates analytics (wear frequency, laundry status), making the system smarter for tomorrow.

---

## 2. Feature Deep Dives & UX Flows

### A. The "Style Swipe" (Outfit Discovery)
*Based on your feedback, we will rely on the user's own photos rather than AI-generated combos.*
*   **The Concept:** When a user creates an outfit they love, they take a quick mirror selfie and upload it.
*   **The Flow:** When they are feeling uninspired, they open the "Swipe" tab. The app presents their *own* past outfit selfies as full-screen Tinder-style cards.
*   **Gestures:** 
    *   **Swipe Right:** "I'll wear this today." -> Instantly logs the outfit for today.
    *   **Swipe Left:** "Not feeling it." -> Shows the next outfit.
*   **Platform Nuance:** Mobile is perfect for physical swiping. On the Web, we will use left/right arrow keys or a grid-based "Lookbook" view.

### B. The Closet (Inventory, Combinations & Filters)
*   **The View:** A beautiful grid of all clothing items.
*   **Tracking & Filters:** When logging what you wear, users can add tags like *event*, *season*, or *mood*. The closet can be filtered by these tags to quickly find specific items.
*   **Custom Combinations:** Users can manually select multiple items from their closet to build and save custom outfits, right within the whole closet view.
*   **Adding Items:** Users snap pictures; AI removes the background for a clean aesthetic.

### C. Laundry & Cleaning Status
Clothes shouldn't be suggested if they are dirty.
*   **The Logic:** Laundry is entirely manual. The user explicitly marks an item as "In Laundry". 
*   **The UX:** Items currently in the laundry are hidden from the active Closet view and won't appear in the Style Swipe or available combinations.
*   **The "Wash Day" Feature:** A satisfying button called "Mark as Clean" in the Laundry section. Clicking it moves items back to the active Closet.

### D. Packing Capsules (Travel)
*   **The Flow:** User clicks "New Trip" and inputs the location, dates, and weather.
*   **The UI:** A split-screen view. Top half is an empty suitcase. Bottom half is their closet. They can drag-and-drop or tap to add items to the suitcase.
*   **The Value:** The app calculates: "You have packed 5 tops and 3 bottoms, yielding 15 potential outfits." This prevents overpacking.

---

## 3. Information Architecture (App Structure)

We will use a bottom tab navigation for Mobile, and a side-rail navigation for Web.

1. **Dashboard (Home):** "What are you wearing today?", recent stats, and the "Style Swipe" entry point.
2. **Closet:** Grid view of all individual items, sorted by category. Access to Laundry Bin.
3. **Lookbook:** Gallery of full outfit selfies.
4. **Trips (Capsules):** Saved packing lists.
5. **Analytics:** Beautiful charts of Wear Frequency, Cost Per Wear, and Color distribution.

---

> [!IMPORTANT]
> ## Next Steps
> The core design decisions (Manual Laundry, Custom Combinations, Filtering) are locked in. The next phase is scaffolding the Expo project and translating the wireframes into React Native UI components.
