# Fix: WKB Hex Location Parsing

## Problem

Supabase returns PostGIS geography as **WKB (Well-Known Binary) hex strings**, not as text like `"POINT(lon lat)"`.

Example location value: `'0101000020E61000005F28141DE50B02C04CC0A2F9F0B94A40'`

This caused all markers to be skipped because the location couldn't be parsed.

## Solution

Added WKB hex parsing function that:
1. Detects WKB hex format (starts with "0101")
2. Extracts coordinates from the hex string
3. Converts hex bytes to Float64 coordinates
4. Returns `{lon, lat}` for use in markers

## How It Works

### WKB Format (Extended with SRID)

```
0101000020E61000005F28141DE50B02C04CC0A2F9F0B94A40
││││││││││││││││││││││││││││││││││││││││││││││││││
││││││││││││││││││││││││││││││││││││││││││││││││││
││││││││││││││││││││││││││││││││││││││││││││││││││
│└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ │ │ │ └─────────┴─────────┘ │ │ │
│ │ │ │ │ │ │ │ │ │ │ │      Longitude         │ │ │
│ │ │ │ │ │ │ │ │ │ │ │                        │ │ │
│ │ │ │ │ │ │ │ │ │ │ └────────────────────────┴─┴─┘
│ │ │ │ │ │ │ │ │ │ │         Latitude
│ │ │ │ │ │ │ │ │ │ │
│ │ │ │ │ │ │ │ │ │ └── SRID (4326)
│ │ │ │ │ │ │ │ │ │
│ │ │ │ │ └─┴─┴─┴─┴── Geometry Type (Point)
│ │ │ │ │
│ └─┴─┴─┴── Endianness (01 = little endian)
```

**Breakdown**:
- Bytes 0-1: `01` = Little endian
- Bytes 2-9: `01000000` = Point geometry type (with SRID flag)
- Bytes 10-17: `20E61000` = SRID 4326 (WGS84)
- Bytes 18-33: `5F28141DE50B02C0` = Longitude (X) as Float64
- Bytes 34-49: `4CC0A2F9F0B94A40` = Latitude (Y) as Float64

## Code Changes

### 1. Added WKB Parser (`src/lib/spawning.js`)

```javascript
function parseWKBHex(hex) {
  // Extract coordinate hex strings
  const xHex = hex.substring(18, 34) // Longitude
  const yHex = hex.substring(34, 50) // Latitude
  
  // Convert to Float64 (little endian)
  const lon = parseDoubleLittleEndian(xHex)
  const lat = parseDoubleLittleEndian(yHex)
  
  return { lon, lat }
}
```

### 2. Updated Location Parser

```javascript
function parseLocationString(location) {
  // Handle WKB hex format (starts with "0101")
  if (typeof location === 'string' && location.startsWith('0101')) {
    return parseWKBHex(location)
  }
  // ... other formats
}
```

### 3. Updated Map Component

```javascript
// Try to get coordinates from spawn object first
let lon, lat
if (spawn.longitude !== undefined && spawn.latitude !== undefined) {
  lon = parseFloat(spawn.longitude)
  lat = parseFloat(spawn.latitude)
} else {
  // Fall back to parsing location string/WKB
  const coords = parseLocation(spawn.location)
  if (coords) {
    lon = coords.lon
    lat = coords.lat
  }
}
```

## Testing

After the fix:
1. ✅ WKB hex strings are parsed correctly
2. ✅ Coordinates are extracted as numbers
3. ✅ Markers are created successfully
4. ✅ Creatures appear on the map

## Alternative Solutions

### Option 1: Modify Database Query (Preferred for Production)

Modify the `get_nearby_spawns` function to return coordinates as separate columns:

```sql
CREATE OR REPLACE FUNCTION get_nearby_spawns(...)
RETURNS TABLE (
  id UUID,
  creature_type_id INT,
  longitude DOUBLE PRECISION,  -- Add this
  latitude DOUBLE PRECISION,   -- Add this
  ...
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.creature_type_id,
    ST_X(s.location::geometry) as longitude,  -- Add this
    ST_Y(s.location::geometry) as latitude,   -- Add this
    ...
  FROM spawns s
  ...
END;
$$;
```

This is more efficient but requires database changes.

### Option 2: Use Supabase PostgREST Features

Supabase might support PostGIS functions in select queries:

```javascript
.select(`
  *,
  longitude:ST_X(location::geometry),
  latitude:ST_Y(location::geometry),
  creature_types (*)
`)
```

But this might not work with all Supabase configurations.

## Current Solution

The WKB parser works client-side and handles the hex format automatically. This is the most compatible solution that doesn't require database changes.

## Verification

To verify the fix is working:

1. Check browser console - should see "Created marker X for..."
2. Check debug panel - "Markers created" should match "Creatures nearby"
3. Look at map - creatures should appear as colored markers

## Files Changed

1. `src/lib/spawning.js` - Added WKB parser
2. `src/components/Map.jsx` - Updated to use parsed coordinates
3. `supabase/migrations/004_add_coords_to_spawns_query.sql` - Optional database function (not required)

The fix is now complete! Creatures should appear on the map. 🎉

