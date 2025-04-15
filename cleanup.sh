#!/bin/bash

echo "Running cleanup script..."

# Files to remove now that they've been moved
OLD_FILES=(
  "search_all_medications.js"
  "convert_to_json.js"
  "convert_keys.js"
  "medication_mapping.js"
  "medication_list.json"
  "medication_list_en.json"
  "image_urls.json"
  "medication_list.md"
)

# Loop through the list and remove files
for file in "${OLD_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing old file: $file"
    rm "$file"
  else
    echo "File already removed: $file"
  fi
done

echo "Cleanup completed successfully." 