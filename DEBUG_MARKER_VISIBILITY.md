# Debug: Creatures Spawning But Not Visible

## Quick Diagnosis

### Step 1: Check Browser Console

Open DevTools (F12) → Console tab, and look for:

```
Creating markers for X creatures
Created marker 1 for Beach Buddy at [-73.9857, 40.7580]
Marker creation complete: X created, Y skipped
```

**What to look for**:
- **"Creating markers for 0 creatures"** → No creatures being fetched
- **"X created, 0 skipped"** → Markers created but not visible (styling issue)
- **"0 created, X skipped"** → Location parsing failing
- **"Invalid coordinates"** → Location format issue

### Step 2: Check Debug Panel

Look at bottom-right panel:
- **"Creatures nearby: X"** - Should match spawns in database
- **"Markers created: X"** - Should match creatures count
- **Creature list** - Should show creature names

**If "Creatures nearby: 5" but "Markers created: 0"**:
→ Location parsing is failing

### Step 3: Check Location Format

In console, look for:
```
Sample location from Supabase: { location: "...", type: "string" }
```

**Common formats**:
- `"POINT(-73.9857 40.7580)"` - String format (should work)
- `{ coordinates: [-73.9857, 40.7580] }` - Object format (should work)
- `null` or `undefined` - Problem!

## Common Issues & Fixes

### Issue 1: Location Format Not Parsed

**Symptom**: Console shows "Invalid coordinates" or "Failed to parse location"

**Fix**: Check what format Supabase returns:

```javascript
// In browser console, after creatures load:
console.log('First creature location:', creatures[0]?.location)
console.log('Location type:', typeof creatures[0]?.location)
```

**If it's an object**: The parsing should handle it, but check the structure.

**If it's null**: The location wasn't saved correctly in the database.

### Issue 2: Markers Created But Invisible

**Symptom**: Console shows "Created marker X" but you don't see them

**Possible causes**:
1. **Too small** - Fixed (now 50px)
2. **Wrong z-index** - Fixed (now 1000)
3. **Outside viewport** - Zoom out or check coordinates
4. **Hidden by CSS** - Check browser inspector

**Test**: Create a test marker:
```javascript
// In browser console:
const testDiv = document.createElement('div')
testDiv.style.width = '50px'
testDiv.style.height = '50px'
testDiv.style.backgroundColor = 'red'
testDiv.style.border = '4px solid white'
const testMarker = new mapboxgl.Marker({ element: testDiv })
testMarker.setLngLat([YOUR_LONGITUDE, YOUR_LATITUDE])
testMarker.addTo(map)
```

If you see a red circle, markers work! If not, there's a map issue.

### Issue 3: Coordinates Swapped

**Symptom**: Markers appear in wrong location (maybe in ocean or wrong country)

**Fix**: Check if lon/lat are swapped. The parseLocation function should handle this, but verify:

```javascript
// In console:
console.log('User location:', location.latitude, location.longitude)
console.log('First creature location:', parseLocation(creatures[0]?.location))
```

### Issue 4: Supabase Returns Location as Object

Supabase might return PostGIS geography as a GeoJSON object. Check:

```javascript
// In console:
console.log('Location object:', creatures[0]?.location)
console.log('Has coordinates?', creatures[0]?.location?.coordinates)
```

**If it's GeoJSON format**: The parser should handle it, but we might need to adjust.

## Quick Test

Run this in browser console to test marker creation:

```javascript
// Get map instance
const mapInstance = document.querySelector('.mapboxgl-map').__mapboxgl_map

// Create a test marker at your location
const testEl = document.createElement('div')
testEl.style.cssText = 'width: 50px; height: 50px; background: red; border: 4px solid white; border-radius: 50%;'
const testMarker = new mapboxgl.Marker({ element: testEl })
testMarker.setLngLat([location.longitude, location.latitude])
testMarker.addTo(mapInstance)

// If you see a red circle, markers work!
```

## What Was Fixed

1. ✅ **Larger markers** - 50px (was 40px)
2. ✅ **Better visibility** - Thicker border, better shadow
3. ✅ **Better parsing** - Handles multiple location formats
4. ✅ **Better logging** - Shows exactly what's happening
5. ✅ **Coordinate validation** - Checks for valid numbers and ranges
6. ✅ **Debug panel** - Shows marker count and creature list

## Next Steps

1. **Refresh the page**
2. **Open browser console** (F12)
3. **Look for marker creation logs**
4. **Check debug panel** for marker count
5. **Share console output** if still not working

The markers should now be much more visible (50px with white border and shadow). If you still can't see them, the console logs will tell us exactly why!

