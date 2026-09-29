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

### B. AI Auto-Tagging & Background Removal (The "Closet")
Adding individual clothing items must be magical, not tedious.
*   **The Flow:** User snaps a picture of a shirt on their bed. 
*   **The Magic:** In the background, an AI endpoint removes the messy background, leaving a clean cutout of the shirt. It automatically tags it as `[Top]`, `[Blue]`, `[Cotton]`.
*   **Platform Nuance:** 
    *   **Mobile:** Relies heavily on the device camera. "Batch capture" mode allows taking 10 photos in a row.
    *   **Web:** Drag-and-drop interface. Users can drag 20 photos from an online shopping receipt or their hard drive directly into their Vastré digital closet.

### C. Laundry & Cleaning Status
Clothes shouldn't be suggested if they are dirty.
*   **The Logic:** Every item has a threshold (e.g., Jeans = 5 wears, Shirts = 1 wear). When an item hits the threshold, its status changes to "Dirty".
*   **The UX:** Dirty items are grayed out in the Closet and won't appear in the Style Swipe. 
*   **The "Wash Day" Feature:** A satisfying button called "Do Laundry." Clicking it resets all "Dirty" items back to "Clean" with a beautiful celebration animation.

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
> ## User Review Required
> Please review this deeper product design strategy. 

> [!WARNING]
> ## Open Questions (Product Design)
> 1. **The "Style Swipe" Concept:** Does the idea of users uploading their own "mirror selfies" as the source for the swipe cards sound exactly like what you envisioned? 
> 2. **Laundry Logic:** Should the app *automatically* mark things as dirty after X wears, or should it be a *manual* toggle by the user (e.g., swiping an item into a "hamper" within the app)?
> 3. Once you approve these flows, I will start scaffolding the Expo project and building the UI foundation. Are we ready to start coding?
