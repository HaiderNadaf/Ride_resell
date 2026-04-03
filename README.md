# Dekho Gadi

Dekho Gadi is a vehicle marketplace app built with Expo, React Native, Expo Router, Clerk, and a custom Node/Express backend. It is designed for buying, selling, and browsing vehicles with an India-first flow.

## What The App Does

- Sign in and sign up with Clerk
- Create and edit vehicle listings
- Upload a vehicle photo
- Generate listing details like overview, summary, and mileage assistance
- Browse listings in a search tab with:
  - vehicle type filters
  - brand filters
  - fuel and transmission filters
  - draggable price range slider
- View listings in a two-column card grid
- Filter location by:
  - State
  - District
  - Taluk / Area
  - Village
- Show profile listings for the signed-in seller
- Send notifications when a new post is created
- Open a notifications inbox from the bell icon

## Tech Stack

- Expo / React Native
- Expo Router
- Clerk authentication
- Expo Notifications
- React Native Picker
- Custom backend API

## Main Screens

- Auth screens: sign in, sign up, verify email
- Home tab
- Search tab
- Create listing tab
- Profile tab
- Details page
- Notifications page

## Environment Variables

Create a `.env` file in this folder with the values your app needs:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_BASE_URL=http://your-backend-url
EXPO_PUBLIC_LOCATION_API_BASE_URL=https://your-location-api-url
NEXT_PUBLIC_API_URL_location=https://your-location-api-url
```

## Run The App

```bash
npm install
npm run start
```

Useful scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Project Structure

- `app/` - Expo Router screens
- `assets/` - logos, splash image, and app media
- `components/` - shared UI components
- `lib/` - marketplace and location helpers
- `utils/` - shared app utilities

## Notes

- The app uses file-based routing.
- The backend lives separately in the parent project folder.
- Notifications and location dropdowns rely on your backend APIs being reachable.
