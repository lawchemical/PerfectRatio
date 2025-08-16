# PerfectRatio Database Sync Documentation

## Overview
This document describes the enhanced database sync system that enables full data synchronization between the iOS app and the admin panel.

## Database Schema Updates

The following tables and fields have been added to support enhanced features:

### New Tables
1. **product_details** - Extended product information
   - Theme family, fragrance notes, usage notes, blending notes
   - Product URLs and descriptions

2. **price_tiers** - 5-tier pricing structure
   - Supports up to 5 pricing tiers per product
   - Each tier has size, unit, and price

3. **inventory** - Inventory tracking
   - Quantity on hand, unit, location
   - Supports both bases and oils

4. **shopping_lists** & **shopping_list_items** - Shopping list management
   - Tracks items to purchase with direct/indirect costs
   - Purchase status tracking

5. **formulas**, **formula_bases**, **formula_oils** - Formula management
   - Complete formula definitions with bases and oils
   - Percentage tracking for each component

### Enhanced Fields

#### FragranceOils
- `specific_gravity` - Physical property
- `vanillin_pct` - Vanillin percentage
- `intensity_rating` - Customer rating (0-5)
- `overall_rating` - Customer rating (0-5)
- `total_ratings` - Number of ratings
- `library_add_count` - Popularity metric
- `batch_count` - Usage metric

#### BaseProducts
- `ease_of_use_rating` - Customer rating (0-5)
- `performance_rating` - Customer rating (0-5)
- `total_ratings` - Number of ratings
- `library_add_count` - Popularity metric
- `batch_count` - Usage metric

## Setup Instructions

### 1. Database Setup

```bash
# Navigate to the project directory
cd /Users/seanlaw/Downloads/PerfectRatio

# Install dependencies if not already installed
npm install

# Run the enhanced migration
node scripts/migrate-enhanced.js

# This will:
# - Add all new tables
# - Add missing columns to existing tables
# - Create necessary indexes
# - Show a summary of changes
```

### 2. Server Setup

The enhanced server (`server-enhanced.js`) has been copied to `server.js` and includes:
- Enhanced API endpoints that return all new fields
- Support for updating all fields from the admin panel
- Proper transaction handling for complex updates

To start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### 3. iOS App Configuration

The iOS app has been updated with:
- `EnhancedBackgroundSyncService` - Handles all new fields
- Updated Core Data model with rating fields
- Real-time sync of all enhanced data

The app will automatically sync when:
- App launches
- Network becomes available
- Every 5 minutes while app is active
- Pull-to-refresh in catalog views

## API Endpoints

### GET /api/bases
Returns all bases with:
- Basic fields (name, max_load_pct, etc.)
- Supplier information
- Product details (theme, descriptions)
- Price tiers (5 levels)
- Inventory status
- Customer ratings

### GET /api/oils
Returns all oils with:
- Basic fields (name, flash_point, etc.)
- Supplier information
- Product details (fragrance notes, descriptions)
- Price tiers (5 levels)
- Inventory status
- Customer ratings
- Categories and IFRA entries

### PUT /api/bases/:id
Updates a base with all enhanced fields

### PUT /api/oils/:id
Updates an oil with all enhanced fields

### GET /api/formulas
Returns all formulas with components

### GET /api/shopping-lists
Returns shopping lists with items and costs

## Data Flow

1. **Admin Panel → Database**
   - Admin enters/updates data through web interface
   - Data saved to PostgreSQL with all enhanced fields

2. **Database → iOS App**
   - EnhancedBackgroundSyncService fetches data
   - Maps database fields to Core Data entities
   - Preserves user library selections

3. **iOS App → User**
   - Expandable tiles show all product details
   - Customer ratings displayed in UI
   - Price tiers available for cost calculations
   - Inventory status shown in management views

## Testing the Sync

1. **Add test data via admin panel:**
   - Add ratings to a fragrance oil
   - Set price tiers for products
   - Add inventory quantities

2. **Verify in iOS app:**
   - Launch app or pull-to-refresh
   - Check expandable tiles for new data
   - Verify ratings appear correctly
   - Check price information

3. **Bi-directional sync:**
   - Library additions in app persist across syncs
   - Formula creations sync to server
   - Shopping lists sync between devices

## Troubleshooting

### If sync fails:
1. Check network connectivity
2. Verify server is running
3. Check server logs for errors
4. Ensure database migrations completed

### If data doesn't appear:
1. Force refresh (pull down in catalog)
2. Check Core Data model matches database
3. Verify field mappings in sync service
4. Check for null values in required fields

### Common Issues:
- **Missing ratings**: Ensure rating fields are numeric in database
- **Price tiers not showing**: Check supplier_id linkage
- **Inventory not syncing**: Verify product_id and product_type match

## Production Deployment

When deploying to production:

1. Update `DATABASE_URL` in .env to production database
2. Run migrations on production database
3. Deploy enhanced server code
4. Update iOS app's `serverURL` in EnhancedBackgroundSyncService
5. Test sync with production data

## Monitoring

Monitor sync health by checking:
- Server logs for sync requests
- Database for updated timestamps
- iOS console for sync success/failure messages
- UserDefaults "LastSyncDate" for sync frequency