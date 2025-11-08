# Debug Checklist

## Issue 1: Navigation Not Visible

### Check in Browser Console:
```javascript
// Check if BottomNav exists
document.querySelector('nav')
// Should return nav element

// Check if it's visible
const nav = document.querySelector('nav')
console.log('Nav height:', nav?.offsetHeight)
console.log('Nav display:', window.getComputedStyle(nav).display)
console.log('Nav z-index:', window.getComputedStyle(nav).zIndex)
```

### Check App Layout:
- Open DevTools → Elements tab
- Look for `<nav>` element
- Check if it's hidden or covered by map
- Check z-index (should be 50)

### If Not Visible:
1. Check if `BottomNav` component is imported in `App.jsx`
2. Check if routes are working
3. Check CSS for `display: none` or `visibility: hidden`

## Issue 2: Markers Moving on Hover

### Check Marker Element:
```javascript
// Inspect a marker
const marker = document.querySelector('.creature-marker')
console.log('Transform:', window.getComputedStyle(marker).transform)
console.log('Position:', window.getComputedStyle(marker).position)
```

### Expected:
- `transform: none` (or empty)
- `position: absolute` (set by Mapbox)
- No position changes on hover

### If Still Moving:
1. Clear browser cache
2. Check for CSS conflicts
3. Disable hover effects temporarily

## Issue 3: "Too Far Away" Error

### Check Coordinates:
Open console when clicking a marker and look for:
```
Creature marker clicked: ...
Passing coordinates to modal: { lat: X, lon: Y }
CatchModal: Using direct coordinates: { lat: X, lon: Y }
Distance to creature: XX.XX meters
```

### Check Distance:
- Should show actual distance
- If > 100m, that's why it fails
- If < 100m but still fails, coordinates might be wrong

### Common Issues:
1. **Coordinates swapped** - Check if lat/lon are correct
2. **User location not updating** - Check if location is current
3. **Spawns too far** - Spawns are generated in 500m radius, might be far

## Quick Fixes

### Fix Navigation:
```css
/* Add to index.css if needed */
nav {
  position: relative !important;
  z-index: 50 !important;
}
```

### Fix Markers:
```javascript
// In Map.jsx, ensure no transform
el.style.transform = 'none'
el.style.willChange = 'auto'
```

### Fix Distance:
```javascript
// Temporarily increase range to 200m for testing
if (distance > 200) { // instead of 50 or 100
```

## Test Steps

1. **Refresh page** - Hard refresh (Ctrl+Shift+R)
2. **Check navigation** - Should see 4 tabs at bottom
3. **Hover marker** - Should NOT move
4. **Click marker** - Modal should open
5. **Check console** - Look for distance logs
6. **Try catch** - Should work if within range

## Still Not Working?

Share:
1. Browser console errors
2. Network tab errors
3. Elements tab screenshot
4. Console logs when clicking marker

