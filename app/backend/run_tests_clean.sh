#!/bin/bash

# Test sonuçları için dosya
OUTPUT_FILE="test_results.txt"

echo "🧹 Cleaning up test environment..."

# Force clean test database (--keepdb olmadan çalıştır, böylece her seferinde yeniden oluşturulur)
python manage.py test --noinput \
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
  echo ""
  echo "✅ ALL TESTS PASSED!"
  echo ""
  grep -E "Ran [0-9]+ test" "$OUTPUT_FILE"
  grep "OK" "$OUTPUT_FILE"
else
  echo ""
  echo "❌ TESTS FAILED!"
  echo ""
  echo "Last 30 lines of output:"
  tail -30 "$OUTPUT_FILE"
fi

echo ""
echo "📄 Full results: $(pwd)/$OUTPUT_FILE"