# Setting Up Fakemon Sprites on the Map

## Quick Setup

The map is already configured to display fakemon sprites! You just need to update the database.

## Step 1: Update Database with Sprite URLs

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click on **SQL Editor**

2. **Run the SQL File**
   - Open `UPDATE_SPRITE_URLS_51.sql`
   - Copy all the SQL statements
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Verify the Update**
   - The SQL includes verification queries
   - You should see:
     - **51 creatures** with sprites
     - **49 creatures** with emoji (fallback)
     - **100 total** creatures

## Step 2: Test the Map

1. **Open your app**
   - Make sure your dev server is running: `npm run dev`
   - Navigate to the map view

2. **Generate Spawns**
   - The map should automatically generate spawns when you allow location access
   - Or click the "Generate Spawns" button in the bottom-right

3. **Check for Sprites**
   - The 51 creatures with Pokengine sprites should display their images
   - The 49 creatures without sprites will show emoji icons (🐾)
   - Both types are fully functional!

## How It Works

### Sprite Display Logic

The map component (`src/components/Map.jsx`) automatically:

1. **Checks for sprite URL** in the creature data
2. **Validates the URL** (checks for `{SPRITE_ID}` placeholder)
3. **Displays sprite** if valid URL exists
4. **Falls back to emoji** if no valid sprite URL

### Sprite Loading

- Sprites are loaded from: `https://pokengine.b-cdn.net/play/images/mons/fronts/{SPRITE_ID}.webp?t=26`
- Images are displayed with `imageRendering: 'pixelated'` for better pixel art display
- If a sprite fails to load, it automatically falls back to emoji

## Troubleshooting

### Sprites Not Showing?

1. **Check Database**
   ```sql
   SELECT name, image_url 
   FROM creature_types 
   WHERE image_url LIKE '%pokengine.b-cdn.net%' 
   LIMIT 10;
   ```
   - Should return 51 creatures with valid URLs

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors loading images
   - Check if sprites are being requested

3. **Check Network Tab**
   - Open DevTools → Network
   - Filter by "Img"
   - Check if sprite URLs are returning 200 OK

### Only Emoji Showing?

- This means sprites aren't in the database yet
- Run the `UPDATE_SPRITE_URLS_51.sql` file
- Refresh the app

### Some Sprites Missing?

- The 49 creatures without Pokengine sprites will show emoji
- This is expected behavior
- They're still fully functional (can be caught, displayed in collection, etc.)

## What You Should See

### On the Map:
- **51 creatures** with Pokengine sprites (circular markers with images)
- **49 creatures** with emoji icons (🐾) in circular markers
- All markers are clickable to catch creatures
- Markers have rarity-based border colors:
  - 🟢 Common: Teal
  - 🟡 Uncommon: Yellow
  - 🟣 Rare: Purple
  - 🔴 Epic: Red
  - 🟠 Legendary: Orange

### In the Collection:
- Sprites display for the 51 creatures with Pokengine URLs
- Emoji display for the 49 creatures without sprites

### In the Catch Modal:
- Large sprite/emoji display when catching a creature
- Same logic applies (sprite if available, emoji if not)

## Next Steps

1. ✅ Run the SQL update
2. ✅ Test the map
3. ✅ Verify sprites are displaying
4. ✅ Catch some creatures to test!

The app is ready to go! 🎮

