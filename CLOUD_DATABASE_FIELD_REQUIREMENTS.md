# PerfectRatio Cloud Database Field Requirements
## Complete Field List from iOS App Core Data Models

This document lists ALL fields (required and optional) that need to be synchronized with the cloud database, organized by entity type.

---

## 1. FRAGRANCE OILS (FragranceOil Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **name** (String) - Product name
- **dateAdded** (Date) - When added to system
- **isInLibrary** (Boolean) - Whether in user's library
- **isCustom** (Boolean) - Whether user-created custom fragrance

### Supplier Information
- **supplier** (Relationship) - Link to supplier
- **supplierSKU** (String, optional) - Supplier's SKU/product code

### Technical Properties
- **flashPointF** (Double, optional) - Flash point in Fahrenheit
- **solventNote** (String, optional) - Solvent information (e.g., DPG)
- **specificGravity** (Double, optional) - Specific gravity value
- **vanillinPct** (Double, optional) - Vanillin percentage

### IFRA Information
- **ifraVersion** (String, optional) - IFRA amendment version
- **ifraDate** (Date, optional) - IFRA certificate date
- **ifraEntries** (Relationship) - IFRA max percentages by product type

### User Interaction Data
- **isFavorite** (Boolean, optional) - User favorited
- **lastUsedDate** (Date, optional) - Last time used in formula
- **categories** (String, optional) - Fragrance categories

### Rating & Analytics
- **intensityRating** (Double, optional) - Intensity rating 0-5
- **overallRating** (Double, optional) - Overall rating 0-5
- **totalRatings** (Int32, optional) - Total number of ratings
- **libraryAddCount** (Int32) - Times added to libraries
- **recentAddCount** (Int32) - Recent additions count
- **uniqueUserCount** (Int32) - Unique users count
- **batchCount** (Int32) - Number of batches made

### Custom Item Fields
- **customCreatedDate** (Date, optional) - When custom item created
- **customUserId** (String, optional) - User who created custom item

### Pricing (via PriceTier relationship)
- **priceTiers** (Relationship) - Multiple price tiers

### Additional Product Details (via ProductDetails)
- **fragranceNotesTop** (String, optional) - Top notes
- **fragranceNotesMiddle** (String, optional) - Middle notes
- **fragranceNotesBase** (String, optional) - Base/bottom notes
- **themeFamily** (String, optional) - Fragrance family/theme
- **scentDescription** (String, optional, max 500 chars) - Description
- **soapAcceleration** (String, optional) - Soap acceleration info
- **productURL** (String, optional) - Product URL
- **usageNotes** (String, optional) - Usage instructions
- **blendingNotes** (String, optional) - Blending tips

---

## 2. BASE PRODUCTS (BaseProduct Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **name** (String) - Product name
- **maxLoadPct** (Double) - Maximum fragrance load percentage
- **unitMode** (String) - Weight or volume mode
- **isInLibrary** (Boolean) - Whether in user's library
- **isCustom** (Boolean) - Whether user-created custom base

### Supplier Information
- **supplier** (Relationship) - Link to supplier

### Technical Properties
- **specificGravity** (Double, optional) - Specific gravity
- **baseType** (String, optional) - Type of base
- **waxType** (String, optional) - Wax type (for candles)

### IFRA Categories
- **ifraCategory** (String, optional) - Primary IFRA category
- **ifraCategory2** (String, optional) - Secondary IFRA category (dual purpose)
- **isDualPurpose** (Boolean, optional) - Whether dual purpose base

### Ratings
- **easeOfUseRating** (Double, optional) - Ease of use rating 0-5
- **performanceRating** (Double, optional) - Performance rating 0-5
- **totalRatings** (Int32, optional) - Total number of ratings

### Custom Item Fields
- **customCreatedDate** (Date, optional) - When custom item created
- **customUserId** (String, optional) - User who created custom item

### Additional Fields
- **notes** (String, optional) - Additional notes

### Pricing (via PriceTier relationship)
- **priceTiers** (Relationship) - Multiple price tiers

---

## 3. VESSELS/CONTAINERS (Vessel Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **name** (String) - Product name
- **vesselType** (String) - jar, bottle, spray_bottle, etc.
- **size** (Double) - Size value
- **sizeUnit** (String) - oz, ml, g, L
- **pricePerUnit** (Double) - Price per unit
- **isInLibrary** (Boolean) - Whether in user's library
- **isCustom** (Boolean) - Whether user-created custom vessel
- **createdAt** (Date) - Creation date
- **updatedAt** (Date) - Last update date

### Supplier Information
- **supplier** (Relationship) - Link to supplier
- **sku** (String, optional) - Supplier SKU

### Physical Properties
- **material** (String, optional) - glass, plastic, aluminum, etc.
- **color** (String, optional) - Color of vessel
- **shape** (String, optional) - round, square, oval, etc.
- **neckSize** (String, optional) - Neck size (e.g., "20-410")
- **weightGrams** (Double, optional) - Empty weight in grams

### Volume Specifications
- **maxFillVolume** (Double, optional) - Maximum fill volume
- **recommendedFillSize** (Double, optional) - Recommended fill size
- **overflowFillSize** (Double, optional) - Overflow fill size

### Ordering Information
- **caseCount** (Int32) - Units per case
- **casePrice** (Double, optional) - Price per case
- **minimumOrderQuantity** (Int32) - Minimum order quantity

### Custom Item Fields
- **customCreatedDate** (Date, optional) - When custom item created
- **customUserId** (String, optional) - User who created custom item

### Additional Fields
- **notes** (String, optional) - Additional notes
- **productURL** (String, optional) - Product URL
- **imageURL** (String, optional) - Image URL

### Inventory (via VesselInventory relationship)
- **quantityOnHand** (Int32) - Current inventory
- **quantityUnit** (String) - units or cases
- **location** (String, optional) - Storage location
- **reorderPoint** (Int32, optional) - Reorder threshold
- **lastOrderedDate** (Date, optional) - Last order date

### Specifications (via VesselSpecifications relationship)
- **diameterMM** (Double, optional) - Diameter in mm
- **heightMM** (Double, optional) - Height in mm
- **openingDiameterMM** (Double, optional) - Opening diameter
- **wallThicknessMM** (Double, optional) - Wall thickness
- **labelPanelHeightMM** (Double, optional) - Label panel height
- **labelPanelWidthMM** (Double, optional) - Label panel width
- **isFoodSafe** (Boolean) - Food safe certification
- **isLeakProof** (Boolean) - Leak proof
- **isChildResistant** (Boolean) - Child resistant cap
- **uvProtection** (Boolean) - UV protection

---

## 4. SUPPLIERS (Supplier Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **name** (String) - Supplier name

### Contact Information (Optional)
- **email** (String, optional) - Email address
- **websiteURL** (String, optional) - Website URL

### Relationships
- **baseProducts** - Associated base products
- **fragranceOils** - Associated fragrance oils
- **vessels** - Associated vessels
- **priceTiers** - Associated price tiers

---

## 5. PRICE TIERS (PriceTier Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **productID** (UUID) - Product identifier
- **productType** (String) - Type of product (base, oil, vessel)
- **supplierID** (UUID) - Supplier identifier
- **lastUpdated** (Date) - Last update date

### Tier Pricing (Up to 5 tiers, all optional)
For each tier (1-5):
- **tier[N]Size** (Double, optional) - Quantity for tier
- **tier[N]Unit** (String, optional) - Unit (oz, ml, lbs, etc.)
- **tier[N]Price** (Double, optional) - Price for tier

### Additional Fields
- **notes** (String, optional) - Pricing notes

### Relationships
- **supplier** - Link to supplier
- **baseProduct** (optional) - Link to base product
- **fragranceOil** (optional) - Link to fragrance oil

---

## 6. IFRA ENTRIES (IFRAEntry Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **productTypeKey** (String) - Product type identifier
- **categoryID** (String) - IFRA category ID
- **maxPct** (Double) - Maximum percentage allowed

### Certificate Information (Optional)
- **certificateDate** (Date, optional) - Certificate date
- **certificateVersion** (String, optional) - Certificate version

### Relationships
- **fragrance** - Link to fragrance oil

---

## 7. INVENTORY (Inventory Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **productID** (UUID) - Product identifier
- **productType** (String) - Type of product
- **quantityOnHand** (Double) - Current quantity
- **unit** (String) - Unit of measurement
- **lastUpdated** (Date) - Last update date

### Optional Fields
- **location** (String, optional) - Storage location
- **expirationDate** (Date, optional) - Expiration date
- **notes** (String, optional) - Inventory notes

---

## 8. FORMULAS (Formula Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **name** (String) - Formula name
- **bottleSize** (Double) - Container size
- **bottleUnit** (String) - Size unit (oz, ml, etc.)
- **quantity** (Int32) - Number of units to make
- **useCount** (Int32) - Times used

### Calculation Fields
- **calculatedMaxPct** (Double) - System calculated max %
- **customMaxPct** (Double) - User override max %
- **useCustomMaxPct** (Boolean) - Use custom vs calculated
- **limitingFactor** (String, optional) - What limits the formula

### Cost & Vessel
- **costPerBatch** (Double, optional) - Total cost per batch
- **vesselQuantity** (Int32) - Number of vessels needed
- **vessel** (Relationship, optional) - Selected vessel

### Metadata
- **createdAt** (Date, optional) - Creation date
- **updatedAt** (Date, optional) - Last update
- **lastUsedAt** (Date, optional) - Last time made
- **productTypeId** (String, optional) - Product type

### Additional Fields
- **formulaDescription** (String, optional) - Description
- **notes** (String, optional) - Formula notes
- **tags** (String, optional) - Searchable tags

### Relationships
- **formulaBases** - Base products in formula
- **formulaOils** - Fragrance oils in formula

---

## 9. USER LIBRARY ITEMS (UserLibraryItem Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **itemID** (UUID) - ID of the item (base, oil, or vessel)
- **itemType** (String) - Type of item
- **dateAdded** (Date) - When added to library
- **isActive** (Boolean) - Whether currently active

### Optional Fields
- **notes** (String, optional) - User notes about item

---

## 10. SHOPPING LIST (ShoppingList Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **createdDate** (Date) - Creation date
- **modifiedDate** (Date) - Last modified
- **status** (String) - active, completed, etc.
- **totalDirectCost** (Double) - Total direct costs
- **totalIndirectCost** (Double) - Total indirect costs

### Optional Fields
- **name** (String, optional) - List name
- **notes** (String, optional) - List notes

### Relationships
- **items** - Shopping list items

---

## 11. SHOPPING LIST ITEMS (ShoppingListItem Entity)

### Core Fields (Required)
- **id** (UUID) - Unique identifier
- **itemType** (String) - Type of item
- **itemID** (UUID) - Product ID
- **itemName** (String) - Product name
- **quantityNeeded** (Double) - Required quantity
- **quantityOnHand** (Double) - Current inventory
- **quantityToPurchase** (Double) - Amount to buy
- **unitType** (String) - Unit of measurement
- **directCost** (Double) - Direct cost
- **indirectCost** (Double) - Indirect cost
- **isPurchased** (Boolean) - Purchase status

### Optional Fields
- **supplierName** (String, optional) - Supplier name
- **selectedTier** (Int16, optional) - Selected price tier
- **notes** (String, optional) - Item notes

---

## IMPLEMENTATION NOTES

### Priority Fields for Cloud Sync
1. **Critical**: All Core Fields marked as (Required)
2. **High**: Pricing, IFRA data, Supplier info
3. **Medium**: Ratings, Analytics, Inventory
4. **Low**: User-specific data (favorites, custom items)

### Data Types Mapping
- UUID → PostgreSQL: UUID or String
- String → PostgreSQL: VARCHAR or TEXT
- Double → PostgreSQL: DECIMAL or DOUBLE PRECISION
- Int32/Int16 → PostgreSQL: INTEGER
- Boolean → PostgreSQL: BOOLEAN
- Date → PostgreSQL: TIMESTAMP

### Sync Considerations
1. Custom items should remain local unless user opts for cloud backup
2. User ratings and favorites need user authentication
3. Inventory data should sync bidirectionally
4. Price tiers should update from server periodically
5. IFRA data must be kept current from authoritative source