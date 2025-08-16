# CSV Import Validation System

## Overview
The enhanced CSV import system now includes comprehensive validation and test mode features to ensure data integrity before importing into the database.

## ✨ New Features

### 1. Pre-Import Validation
- **Validate CSV** button checks file before import
- Identifies missing required fields
- Validates data types and ranges
- Shows detailed error and warning reports
- Prevents import if critical errors exist

### 2. Test Mode
- Checkbox option to run validation without importing
- Verifies all data would import successfully
- No changes made to database
- Perfect for testing CSV files before production import

### 3. Enhanced Field Support

#### Base Products CSV Fields
**Required Fields:**
- `supplier` - Supplier name (creates if doesn't exist)
- `name` or `base_name` - Product name
- `max_load_pct` or `base_max_load_pct` - Maximum load percentage (0-100)
- `unit_mode` - Must be "weight" or "volume"

**Optional Fields:**
- `base_type` - liquid, powder, or wax
- `specific_gravity` - For volume calculations
- `ifra_category` - Primary IFRA category
- `is_dual_purpose` - true/false
- `ifra_category_2` - Secondary IFRA category
- `wax_type` - For wax bases (soy, paraffin, coconut, etc.)
- `notes` - Product notes
- `ease_of_use_rating` - 0-5 rating
- `performance_rating` - 0-5 rating
- Price tier fields: `tier1_size`, `tier1_unit`, `tier1_price`, etc.
- Product details: `theme_family`, `scent_description`, `usage_notes`, `product_url`

#### Fragrance Oils CSV Fields
**Required Fields:**
- `supplier` - Supplier name
- `product_name` or `name` - Fragrance name
- `flash_point_f` - Flash point in Fahrenheit

**Optional Fields:**
- `sku` - Product SKU
- `solvent_note` - Solvent information
- `ifra_version` - IFRA amendment version
- `ifra_date` - IFRA certificate date (YYYY-MM-DD)
- `specific_gravity` - Physical property
- `vanillin_pct` - Vanillin percentage (0-100)
- `intensity_rating` - 0-5 rating
- `overall_rating` - 0-5 rating
- IFRA values: `ifra__foaming_hand_soap`, `ifra__liquid_hand_soap`, etc.
- Fragrance notes: `fragrance_notes_top`, `fragrance_notes_middle`, `fragrance_notes_base`
- Additional details: `theme_family`, `scent_description`, `soap_acceleration`
- `usage_notes`, `blending_notes`, `product_url`
- Price tiers and categories

## 📋 Validation Rules

### Data Type Validation
- **Numeric fields**: Must be valid numbers
- **Percentages**: Must be 0-100
- **Ratings**: Must be 0-5
- **Dates**: Must be YYYY-MM-DD format
- **Booleans**: Accepts true/false, 1/0

### Business Rule Validation
- Supplier names cannot be empty
- Product names must be unique per supplier
- Flash points must be positive numbers
- Specific gravity must be > 0
- IFRA categories validated against known list

### Validation Levels
1. **Errors** (Red) - Must fix before import
   - Missing required fields
   - Invalid data types
   - Out of range values

2. **Warnings** (Yellow) - Optional fixes
   - Unusual but valid values
   - Missing recommended fields
   - Potential data issues

## 🔄 Import Process Flow

```
1. Select CSV File
   ↓
2. Click "Validate CSV"
   ↓
3. Review Validation Report
   ↓
4. Fix any errors in CSV
   ↓
5. Re-validate if needed
   ↓
6. Choose Test Mode (optional)
   ↓
7. Click "Import CSV"
   ↓
8. Review import results
```

## 📝 Sample CSV Templates

### Base Products Template
```csv
supplier,name,base_type,max_load_pct,unit_mode,specific_gravity,ifra_category,is_dual_purpose,ifra_category_2,wax_type,notes,ease_of_use_rating,performance_rating
Peach State,Foaming Hand Soap Base,liquid,3.0,weight,,9,false,,,Clouds above 0.5%,4.5,4.0
Makesy,Liquid Hand Soap Base,liquid,2.0,weight,,9,false,,,Easy to work with,5.0,4.5
```

### Fragrance Oils Template
```csv
supplier,product_name,sku,flash_point_f,solvent_note,ifra_version,ifra_date,specific_gravity,vanillin_pct,intensity_rating,overall_rating,ifra__foaming_hand_soap,ifra__liquid_hand_soap
Peach State,Autumn Leaves,PS123,180,DPG,Amendment 51,2024-06-01,0.98,2.5,4.2,4.5,1.2,1.2
```

## 🛠️ Implementation Files

### Client-Side
- **admin-import-enhanced.js** - Enhanced import UI with validation
  - CSV parsing and validation logic
  - Test mode implementation
  - Detailed error reporting
  - Template downloads

### Server-Side
- **import-endpoints-enhanced.js** - Enhanced import endpoints
  - Transaction-based imports
  - All field support
  - Conflict resolution (ON CONFLICT DO UPDATE)
  - Error collection and reporting

## 🔍 Testing Your CSV

1. **Prepare your CSV file**
   - Use the template as a starting point
   - Ensure all required fields are present
   - Check data formats match requirements

2. **Run validation first**
   - Click "Validate CSV" button
   - Review all errors and warnings
   - Fix critical errors in your CSV

3. **Use Test Mode**
   - Check "Test mode" checkbox
   - Click "Import" to simulate import
   - Verify success message
   - No data is actually imported

4. **Perform actual import**
   - Uncheck "Test mode"
   - Click "Import CSV"
   - Monitor progress
   - Review import results

## ⚠️ Common Issues and Solutions

### Issue: "Missing required columns"
**Solution**: Check your CSV headers match exactly (case-insensitive)

### Issue: "Invalid max_load_pct"
**Solution**: Ensure values are numbers between 0-100

### Issue: "Invalid date format"
**Solution**: Use YYYY-MM-DD format (e.g., 2024-06-01)

### Issue: "Row X: Missing supplier"
**Solution**: Every row must have a supplier name

### Issue: Import succeeds but data doesn't appear
**Solution**: Check "Automatically add to library" checkbox

## 🚀 Best Practices

1. **Always validate before importing**
   - Catches errors early
   - Prevents partial imports
   - Saves debugging time

2. **Use Test Mode for new files**
   - Verify file format is correct
   - Check all validations pass
   - Ensure data mapping is correct

3. **Keep backups**
   - Export existing data before bulk imports
   - Save validated CSV files
   - Document import dates and results

4. **Batch similar products**
   - Group by supplier for easier management
   - Use consistent naming conventions
   - Apply similar settings to product groups

5. **Review import results**
   - Check imported count matches expected
   - Verify any warnings are acceptable
   - Test syncing to iOS app after import

## 📊 Validation Report Details

The validation report shows:
- **Total rows**: Number of data rows in CSV
- **Valid rows**: Rows that pass all validations
- **Errors**: Critical issues that prevent import
- **Warnings**: Non-critical issues to review

Example report:
```
✓ Validation Passed
Valid rows: 45 of 50

⚠️ 5 Warnings (optional fixes)
- Row 3: Invalid base_type (should be: liquid, powder, wax)
- Row 7: Unusual IFRA category: 13
- Row 12: Invalid specific_gravity (must be > 0)
- Row 23: Invalid ease_of_use_rating (must be 0-5)
- Row 41: Invalid date format for ifra_date (use YYYY-MM-DD)

✓ CSV is ready to import!
```

## 🔐 Data Integrity

The enhanced import system ensures:
- **Atomic transactions** - All or nothing imports
- **Duplicate prevention** - ON CONFLICT handling
- **Referential integrity** - Supplier relationships maintained
- **Data validation** - Type and range checking
- **Error recovery** - Rollback on failures