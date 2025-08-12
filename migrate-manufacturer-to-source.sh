#!/bin/bash

echo "🔄 Migrating Manufacturer to Source..."
echo "======================================"

# Function to replace text in files
replace_in_files() {
    local pattern="$1"
    local replacement="$2"
    local files="$3"
    
    echo "Replacing '$pattern' with '$replacement' in $files files..."
    find . -name "$files" -type f -exec sed -i '' "s/$pattern/$replacement/g" {} \;
}

# Function to replace case-insensitive patterns
replace_in_files_ci() {
    local pattern="$1"
    local replacement="$2"
    local files="$3"
    
    echo "Replacing '$pattern' with '$replacement' (case-insensitive) in $files files..."
    find . -name "$files" -type f -exec sed -i '' "s/$pattern/$replacement/gi" {} \;
}

# Update TypeScript/JavaScript files
echo "📝 Updating TypeScript/JavaScript files..."

# Replace Manufacturer interface with Source
replace_in_files "export interface Manufacturer" "export interface Source" "*.ts"
replace_in_files "export interface Manufacturer" "export interface Source" "*.tsx"

# Replace manufacturerId with sourceId
replace_in_files "manufacturerId:" "sourceId:" "*.ts"
replace_in_files "manufacturerId:" "sourceId:" "*.tsx"

# Replace manufacturers array with sources
replace_in_files "manufacturers:" "sources:" "*.ts"
replace_in_files "manufacturers:" "sources:" "*.tsx"

# Replace Manufacturer type with Source
replace_in_files "Manufacturer\[\]" "Source[]" "*.ts"
replace_in_files "Manufacturer\[\]" "Source[]" "*.tsx"
replace_in_files ": Manufacturer" ": Source" "*.ts"
replace_in_files ": Manufacturer" ": Source" "*.tsx"

# Replace action types
replace_in_files "SET_MANUFACTURERS" "SET_SOURCES" "*.ts"
replace_in_files "SET_MANUFACTURERS" "SET_SOURCES" "*.tsx"
replace_in_files "ADD_MANUFACTURER" "ADD_SOURCE" "*.ts"
replace_in_files "ADD_MANUFACTURER" "ADD_SOURCE" "*.tsx"
replace_in_files "UPDATE_MANUFACTURER" "UPDATE_SOURCE" "*.ts"
replace_in_files "UPDATE_MANUFACTURER" "UPDATE_SOURCE" "*.tsx"
replace_in_files "DELETE_MANUFACTURER" "DELETE_SOURCE" "*.ts"
replace_in_files "DELETE_MANUFACTURER" "DELETE_SOURCE" "*.tsx"

# Replace function names
replace_in_files "addManufacturer" "addSource" "*.ts"
replace_in_files "addManufacturer" "addSource" "*.tsx"
replace_in_files "updateManufacturer" "updateSource" "*.ts"
replace_in_files "updateManufacturer" "updateSource" "*.tsx"
replace_in_files "deleteManufacturer" "deleteSource" "*.ts"
replace_in_files "deleteManufacturer" "deleteSource" "*.tsx"
replace_in_files "getManufacturers" "getSources" "*.ts"
replace_in_files "getManufacturers" "getSources" "*.tsx"
replace_in_files "saveManufacturer" "saveSource" "*.ts"
replace_in_files "saveManufacturer" "saveSource" "*.tsx"

# Replace variable names
replace_in_files "manufacturer\." "source." "*.ts"
replace_in_files "manufacturer\." "source." "*.tsx"
replace_in_files "manufacturers\." "sources." "*.ts"
replace_in_files "manufacturers\." "sources." "*.tsx"

# Replace UI text (case-insensitive)
replace_in_files_ci "Manufacturer" "Source" "*.tsx"
replace_in_files_ci "manufacturer" "source" "*.tsx"

# Update database references
echo "🗄️ Updating database references..."
replace_in_files "manufacturers" "sources" "*.sql"
replace_in_files "manufacturer_id" "source_id" "*.sql"

# Update storage keys
replace_in_files "MANUFACTURERS" "SOURCES" "*.ts"
replace_in_files "manufacturers" "sources" "*.ts"

# Update subscription features
replace_in_files "maxManufacturers" "maxSources" "*.ts"
replace_in_files "maxManufacturers" "maxSources" "*.tsx"

echo "✅ Migration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes"
echo "2. Update database schema if needed"
echo "3. Test the application"
echo "4. Commit the changes"
