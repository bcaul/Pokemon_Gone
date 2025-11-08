# Fix: Creatures Spawning But Not Visible

## Problem

Creatures are spawning (database shows spawns), but you can't see them on the map.

## Root Causes

1. **Location parsing failing** - PostGIS format might not be parsed correctly
2. **Markers created but invisible** - Z-index, size, or positioning issues
3. **Coordinates swapped** - Longitude/latitude might be reversed
4. **Markers outside viewport** - Spawns might be too far away
5. **Map not ready** - Markers created before map is loaded

## Quick Fixes Applied

### ✅ 1. Better Location Parsing
- Handles multiple location formats
- Better error handling
- Logs parsing failures

### ✅ 2. Larger, More Visible Markers
- Increased size from 40px to 50px
- Thicker border (4px)
- Better shadow for visibility
- Hover effects

### ✅ 3. Better Debugging
- Console logs show marker creation
- Shows how many markers were created
- Shows which spawns were skipped and why
- Debug panel shows creature list

### ✅ 4. Coordinate Validation
- Checks if coordinates are valid numbers
- Checks if coordinates are in valid range (-90 to 90 for lat, -180 to 180 for lon)
- Logs invalid coordinates

## How to Debug

### Step 1: Check Browser Console

Open DevTools (F12) and look for:

```
Creating markers for X creatures
Created marker 1 for Beach Buddy at [-73.9857, 40.7580]
Marker creation complete: X created, Y skipped
```

**If you see "0 created"**: 
- Check why markers were skipped
- Look for "invalid coordinates" warnings
- Check location format

### Step 2: Check Debug Panel

Look at the debug panel (bottom-right):
- "Creatures nearby: X" - Should be > 0
- "Markers created: X" - Should match creatures count
- Creature list - Should show creature names

### Step 3: Check Database

Run this SQL:

```sql
-- Check spawns with locations
SELECT 
  s.id,
  s.location,
  s.spawned_at,
  s.expires_at,
  ct.name as creature_name,
  ST_AsText(s.location) as location_text,
  ST_X(s.location::geometry) as longitude,
  ST_Y(s.location::geometry) as latitude
FROM spawns s
LEFT JOIN creature_types ct ON s.creature_type_id = ct.id
WHERE s.expires_at > NOW()
ORDER BY s.spawned_at DESC
LIMIT 10;
```

**Check**:
- Are spawns being created? (should see rows)
- Are locations valid? (not null)
- Are coordinates reasonable? (not 0,0 or extreme values)

### Step 4: Check Location Format

In browser console, look for:
```
Sample spawn: { location: "...", locationType: "string" }
```

**If location is a string**: Should be "POINT(lon lat)" format
**If location is an object**: Should have coordinates array

## Common Issues

### Issue: "Invalid coordinates" in console

**Cause**: Location parsing failed
**Fix**: Check location format in database, might need to use ST_AsText() in query

### Issue: "Markers created: 0" but "Creatures nearby: 5"

**Cause**: Location parsing is failing
**Fix**: 
1. Check console for parsing errors
2. Check location format in database
3. Try this SQL to see location format:
   ```sql
   SELECT ST_AsText(location) FROM spawns LIMIT 1;
   ```

### Issue: Markers created but not visible

**Possible causes**:
1. **Too small** - Fixed (now 50px)
2. **Wrong z-index** - Fixed (now 1000)
3. **Outside viewport** - Zoom out or check coordinates
4. **Same color as map** - Fixed (added border and shadow)

### Issue: Coordinates seem wrong

**Check**: Longitude and latitude might be swapped
- Longitude should be -180 to 180 (X axis, left-right)
- Latitude should be -90 to 90 (Y axis, up-down)

**If swapped**: The parseLocation function handles this, but check the database format.

## Testing

### Test 1: Check Console Logs

1. **Open browser console** (F12)
2. **Click "Generate Spawns"**
3. **Look for**:
   - "Generated X spawns"
   - "Found X creatures nearby"
   - "Creating markers for X creatures"
   - "Created marker X for..."

### Test 2: Check Debug Panel

1. **Look at bottom-right panel**
2. **Check "Creatures nearby"** - Should be > 0
3. **Check "Markers created"** - Should match creatures count
4. **Check creature list** - Should show names

### Test 3: Inspect Map

1. **Right-click on map** → "Inspect"
2. **Look for `.mapboxgl-marker` elements**
3. **Should see marker divs** with creature emojis
4. **Check if they're visible** (not hidden by CSS)

### Test 4: Manual Marker Test

Run this in browser console:

```javascript
// Create a test marker at your location
const testMarker = new mapboxgl.Marker({
  element: document.createElement('div'),
})
testMarker.getElement().style.width = '50px'
testMarker.getElement().style.height = '50px'
testMarker.getElement().style.backgroundColor = 'red'
testMarker.getElement().style.border = '4px solid white'
testMarker.setLngLat([YOUR_LONGITUDE, YOUR_LATITUDE])
testMarker.addTo(map)

// If you see a red circle, markers work!
// If not, there's a map/marker issue
```

## Advanced Debugging

### Check Location Format from Supabase

Supabase might return PostGIS geography in different formats. Check:

```javascript
// In browser console, after fetching creatures
console.log('Sample creature location:', creatures[0]?.location)
console.log('Location type:', typeof creatures[0]?.location)
```

**Expected formats**:
- String: `"POINT(-73.9857 40.7580)"`
- Object: `{ coordinates: [-73.9857, 40.7580] }`
- Object: `{ x: -73.9857, y: 40.7580 }`

### Force Location Format

If location format is wrong, you can modify the query to return it as text:

```sql
-- Modify get_nearby_spawns function to return location as text
-- Or use this query directly:
SELECT 
  s.*,
  ST_AsText(s.location) as location_text,
  ct.*
FROM spawns s
LEFT JOIN creature_types ct ON s.creature_type_id = ct.id
WHERE s.expires_at > NOW();
```

## Still Not Working?

1. **Check console for errors** - Share the exact error
2. **Check "Markers created" count** - Is it 0 or matching creatures?
3. **Check location format** - What does `creatures[0]?.location` show?
4. **Try manual marker test** - Does a red test marker appear?
5. **Check map zoom** - Are you zoomed in enough? (should be zoom 15-16)

## Files Updated

1. **`src/components/Map.jsx`**:
   - Better location parsing (handles multiple formats)
   - Larger, more visible markers (50px, better styling)
   - Better debugging (logs marker creation)
   - Coordinate validation
   - Enhanced debug panel

2. **`src/lib/spawning.js`**:
   - Better logging for location format
   - Logs sample spawn data

## Expected Behavior

After fixes:
- ✅ Markers are 50px (larger, more visible)
- ✅ Console shows marker creation logs
- ✅ Debug panel shows marker count
- ✅ Invalid coordinates are logged
- ✅ Markers have better styling (shadow, border)

## Next Steps

1. **Refresh the page**
2. **Check browser console** for marker creation logs
3. **Check debug panel** for marker count
4. **Look for markers** on map (should be larger now)
5. **Share console logs** if still not working

Good luck! 🎮

