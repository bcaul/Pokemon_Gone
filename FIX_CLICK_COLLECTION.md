# Fix: Collection on Click (Not Hover)

## Issues Fixed

1. **Collection only happens on explicit click** - Not on hover
2. **Modal only opens on click** - Not on hover
3. **Layout restored** - Marker size back to 40px (was 50px)
4. **Better event handling** - Prevents accidental triggers

## Changes Made

### 1. Marker Size Reduced
- Changed from 50px to 40px (better layout)
- Reduced border from 4px to 3px
- Reduced emoji size from 28px to 22px
- Less intrusive on the map

### 2. Click-Only Interaction
- **Click event**: Opens modal (explicit click required)
- **Hover effect**: Visual only (scale 1.15x, no action)
- **Event isolation**: `stopPropagation()` prevents map clicks
- **No auto-catch**: Requires clicking "Catch!" button in modal

### 3. Modal Behavior
- **Backdrop click**: Closes modal
- **Modal content click**: Does NOT close modal
- **Explicit buttons**: "Cancel" or "Catch!" required
- **No auto-catch**: Must click "Catch!" button explicitly

### 4. Event Handling
- Added `e.stopPropagation()` to prevent event bubbling
- Added `e.preventDefault()` to prevent default behavior
- Isolated hover events from click events
- Proper pointer events handling

## How It Works Now

### Step 1: Click Marker
- User **clicks** on a creature marker
- Modal opens showing creature info
- **Hover does nothing** (just visual feedback)

### Step 2: Catch Decision
- User sees creature details in modal
- Two options:
  - **"Cancel"** - Closes modal, creature remains
  - **"Catch!"** - Attempts to catch creature

### Step 3: Catch Process
- Click "Catch!" button
- Checks if within 50 meters
- If yes: Catches creature, adds to collection
- If no: Shows error message

## Testing

### Test 1: Hover Behavior
1. **Hover over marker** - Should only scale up (no modal)
2. **Move mouse away** - Marker returns to normal
3. **No collection** - Creature should still be there

### Test 2: Click Behavior
1. **Click marker** - Modal should open
2. **See creature info** - Name, rarity, type
3. **Click "Cancel"** - Modal closes, creature remains
4. **Click marker again** - Modal opens again

### Test 3: Catch Process
1. **Click marker** - Modal opens
2. **Click "Catch!"** - Attempts to catch
3. **If within range** - Creature caught, modal shows success
4. **If too far** - Error message, can try again

## Files Changed

1. **`src/components/Map.jsx`**:
   - Reduced marker size to 40px
   - Added event isolation (`stopPropagation`)
   - Hover effect is visual only
   - Click event opens modal

2. **`src/components/CatchModal.jsx`**:
   - Added WKB hex parsing support
   - Improved backdrop click handling
   - Modal content click doesn't close modal
   - Explicit button clicks required

## Expected Behavior

✅ **Hover**: Visual feedback only (scale up)
✅ **Click**: Opens modal
✅ **Modal**: Shows creature info
✅ **Catch Button**: Explicit click required
✅ **No Auto-Catch**: Must click "Catch!" button
✅ **Layout**: Markers are 40px (balanced size)

## Troubleshooting

### Issue: Modal opens on hover
**Fix**: Check browser console for event errors. Hover should only trigger visual feedback.

### Issue: Creature caught without clicking
**Fix**: Make sure you're clicking the "Catch!" button, not just the marker. The marker only opens the modal.

### Issue: Layout still looks wrong
**Fix**: Clear browser cache and refresh. Marker size should be 40px now.

## Summary

- ✅ **Collection on click only** - Not on hover
- ✅ **Modal opens on click** - Not on hover  
- ✅ **Layout fixed** - Markers are 40px
- ✅ **Better UX** - Explicit actions required

The fix ensures that creatures are only collected when you explicitly click the marker and then click the "Catch!" button in the modal. Hovering only provides visual feedback.

