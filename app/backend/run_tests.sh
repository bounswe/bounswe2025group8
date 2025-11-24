#!/bin/bash

# Test sonuçları için dosya
OUTPUT_FILE="test_results.txt"

# Testleri çalıştır
python manage.py test \
  core.tests.test_user_models \
  core.tests.test_task_models \
  core.tests.test_volunteer_models \
  core.tests.test_notification_models \
  core.tests.test_review_models \
  core.tests.test_enhanced_review_models \
  core.tests.test_bookmark_models \
  core.tests.test_tag_models \
  core.tests.test_photo_models \
  core.tests.test_comment_models \
  core.tests.test_report_models \
  core.tests.test_feed_class \
  core.tests.test_search_class \
  core.tests.test_integration \
  core.tests.test_report_integration \
  core.tests.test_admin_functionality > "$OUTPUT_FILE" 2>&1

# Test sonuçlarını kontrol et
if [ $? -eq 0 ]; then
  echo "Successful Results at: $OUTPUT_FILE "
else
  echo "Unsuccessful. Details at: $OUTPUT_FILE"
fi

echo "Result file: $(pwd)/$OUTPUT_FILE"