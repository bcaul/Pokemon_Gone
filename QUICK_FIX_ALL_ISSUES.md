# Quick Fix for All Current Issues

## Issues
1. Navigation sections not visible
2. Markers moving to left on hover
3. "Too far away" error when clicking creatures

## Quick Fixes Applied

### 1. Navigation Visibility
- Added `z-50` to BottomNav to ensure it's above the map
- Added `relative` positioning to BottomNav
- Navigation should now be visible at the bottom

### 2. Marker Hover Fix
- Removed `transform: scale()` - this was causing position shifts
- Changed hover to only modify `box-shadow` and `border`
- Markers should no longer move on hover

### 3. Distance Calculation Fix
- Direct coordinates now passed from Map to Modal
- Added coordinate validation
- Increased catch range to 100m for testing
- Better error messages with actual distance

## Testing

### Test Navigation
1. **Look at bottom of screen** - Should see 4 tabs
2. **Click each tab** - Should navigate
3. **If still not visible** - Check browser console for errors

### Test Markers
1. **Hover over marker** - Should only change shadow/border (no movement)
2. **Click marker** - Modal should open
3. **Check console** - Should see coordinates logged

### Test Distance
1. **Click marker** - Open modal
2. **Check console** - Should see distance logged
3. **Click "Catch!"** - Should work within 100m

## If Navigation Still Not Visible

Run this in browser console:
```javascript
// Check if BottomNav exists
document.querySelector('nav')
// Should return the nav element

// Check if it's visible
document.querySelector('nav').offsetHeight
// Should be > 0

// Check z-index
window.getComputedStyle(document.querySelector('nav')).zIndex
// Should be 50 or higher
```

## If Markers Still Moving

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check for CSS conflicts** - Inspect marker element
3. **Check transform** - Should NOT have transform on hover

## If Distance Still Wrong

Check console for:
```
CatchModal: Using direct coordinates: { lat: X, lon: Y }
Distance to creature: XX.XX meters
```

If coordinates are wrong, check the marker click handler in Map.jsx.

## Files Changed

1. **`src/components/BottomNav.jsx`** - Added z-50, relative positioning
2. **`src/components/Map.jsx`** - Fixed marker hover (no transform), better coordinate passing
3. **`src/components/CatchModal.jsx`** - Better coordinate handling, 100m range
4. **`src/index.css`** - Added flex layout to root

## Expected Results

✅ **Navigation visible** - BottomNav at bottom with 4 tabs
✅ **Markers stable** - No movement on hover
✅ **Distance works** - Can catch within 100m
✅ **Coordinates correct** - Properly parsed and passed

Refresh the page and test!

