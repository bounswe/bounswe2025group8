#!/usr/bin/env python
"""
Test Runner script to organize and run tests for the Neighborhood Assistance Board.
This can be used to run specific test groups or all tests.
"""

import unittest
import sys
import os

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import test modules
from core.tests.test_user_models import RegisteredUserModelTests, AdministratorModelTests, GuestUserTests
from core.tests.test_task_models import TaskModelTests, TaskEnumTests
from core.tests.test_volunteer_models import VolunteerModelTests, VolunteerStatusEnumTests
from core.tests.test_notification_models import NotificationModelTests, NotificationTypeEnumTests
from core.tests.test_review_models import ReviewModelTests
from core.tests.test_bookmark_models import BookmarkModelTests, BookmarkTagModelTests
from core.tests.test_tag_models import TagModelTests
from core.tests.test_photo_models import PhotoModelTests
from core.tests.test_comment_models import CommentModelTests
from core.tests.test_feed_class import FeedClassTests
from core.tests.test_search_class import SearchClassTests
from core.tests.test_integration import TaskWorkflowIntegrationTests

# Import new test modules
from core.tests.test_report_models import (
    TaskReportModelTests, UserReportModelTests, ReportEnumTests
)
from core.tests.test_enhanced_review_models import EnhancedReviewModelTests
from core.tests.test_report_integration import ReportWorkflowIntegrationTests
from core.tests.test_admin_functionality import AdminFunctionalityTests


def create_test_suite():
    """Create and return a test suite with all tests."""
    test_suite = unittest.TestSuite()
    
    # User model tests
    test_suite.addTest(unittest.makeSuite(RegisteredUserModelTests))
    test_suite.addTest(unittest.makeSuite(AdministratorModelTests))
    test_suite.addTest(unittest.makeSuite(GuestUserTests))
    
    # Task model tests
    test_suite.addTest(unittest.makeSuite(TaskModelTests))
    test_suite.addTest(unittest.makeSuite(TaskEnumTests))
    
    # Volunteer model tests
    test_suite.addTest(unittest.makeSuite(VolunteerModelTests))
    test_suite.addTest(unittest.makeSuite(VolunteerStatusEnumTests))
    
    # Notification model tests
    test_suite.addTest(unittest.makeSuite(NotificationModelTests))
    test_suite.addTest(unittest.makeSuite(NotificationTypeEnumTests))
    
    # Review model tests
    test_suite.addTest(unittest.makeSuite(ReviewModelTests))
    test_suite.addTest(unittest.makeSuite(EnhancedReviewModelTests))  # NEW
    
    # Bookmark model tests
    test_suite.addTest(unittest.makeSuite(BookmarkModelTests))
    test_suite.addTest(unittest.makeSuite(BookmarkTagModelTests))
    
    # Tag model tests
    test_suite.addTest(unittest.makeSuite(TagModelTests))
    
    # Photo model tests
    test_suite.addTest(unittest.makeSuite(PhotoModelTests))
    
    # Comment model tests
    test_suite.addTest(unittest.makeSuite(CommentModelTests))
    
    # Report model tests - NEW
    test_suite.addTest(unittest.makeSuite(TaskReportModelTests))
    test_suite.addTest(unittest.makeSuite(UserReportModelTests))
    test_suite.addTest(unittest.makeSuite(ReportEnumTests))
    
    # Utility class tests
    test_suite.addTest(unittest.makeSuite(FeedClassTests))
    test_suite.addTest(unittest.makeSuite(SearchClassTests))
    
    # Integration tests
    test_suite.addTest(unittest.makeSuite(TaskWorkflowIntegrationTests))
    test_suite.addTest(unittest.makeSuite(ReportWorkflowIntegrationTests))  # NEW
    
    # Admin functionality tests - NEW
    test_suite.addTest(unittest.makeSuite(AdminFunctionalityTests))
    
    return test_suite


def run_tests():
    """Run all tests and display results."""
    test_suite = create_test_suite()
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


def run_model_tests():
    """Run only model-specific tests."""
    test_suite = unittest.TestSuite()
    
    # Add all model tests
    test_suite.addTest(unittest.makeSuite(RegisteredUserModelTests))
    test_suite.addTest(unittest.makeSuite(AdministratorModelTests))
    test_suite.addTest(unittest.makeSuite(TaskModelTests))
    test_suite.addTest(unittest.makeSuite(VolunteerModelTests))
    test_suite.addTest(unittest.makeSuite(NotificationModelTests))
    test_suite.addTest(unittest.makeSuite(ReviewModelTests))
    test_suite.addTest(unittest.makeSuite(EnhancedReviewModelTests))  # NEW
    test_suite.addTest(unittest.makeSuite(BookmarkModelTests))
    test_suite.addTest(unittest.makeSuite(TagModelTests))
    test_suite.addTest(unittest.makeSuite(PhotoModelTests))
    test_suite.addTest(unittest.makeSuite(CommentModelTests))
    test_suite.addTest(unittest.makeSuite(TaskReportModelTests))  # NEW
    test_suite.addTest(unittest.makeSuite(UserReportModelTests))  # NEW
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


def run_utility_tests():
    """Run only utility class tests."""
    test_suite = unittest.TestSuite()
    
    # Add utility class tests
    test_suite.addTest(unittest.makeSuite(FeedClassTests))
    test_suite.addTest(unittest.makeSuite(SearchClassTests))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


def run_integration_tests():
    """Run only integration tests."""
    test_suite = unittest.TestSuite()
    
    test_suite.addTest(unittest.makeSuite(TaskWorkflowIntegrationTests))
    test_suite.addTest(unittest.makeSuite(ReportWorkflowIntegrationTests))  # NEW
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


def run_report_tests():
    """Run only report-related tests."""
    test_suite = unittest.TestSuite()
    
    test_suite.addTest(unittest.makeSuite(TaskReportModelTests))
    test_suite.addTest(unittest.makeSuite(UserReportModelTests))
    test_suite.addTest(unittest.makeSuite(ReportEnumTests))
    test_suite.addTest(unittest.makeSuite(ReportWorkflowIntegrationTests))
    test_suite.addTest(unittest.makeSuite(AdminFunctionalityTests))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


def run_admin_tests():
    """Run only admin-related tests."""
    test_suite = unittest.TestSuite()
    
    test_suite.addTest(unittest.makeSuite(AdministratorModelTests))
    test_suite.addTest(unittest.makeSuite(AdminFunctionalityTests))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


def run_review_tests():
    """Run only review-related tests."""
    test_suite = unittest.TestSuite()
    
    test_suite.addTest(unittest.makeSuite(ReviewModelTests))
    test_suite.addTest(unittest.makeSuite(EnhancedReviewModelTests))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)


if __name__ == "__main__":
    # Check if there are command line arguments
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        if arg == 'models':
            run_model_tests()
        elif arg == 'utility':
            run_utility_tests()
        elif arg == 'integration':
            run_integration_tests()
        elif arg == 'reports':
            run_report_tests()
        elif arg == 'admin':
            run_admin_tests()
        elif arg == 'reviews':
            run_review_tests()
        else:
            print(f"Unknown test category: {arg}")
            print("Available options: models, utility, integration, reports, admin, reviews, or no argument for all tests")
    else:
        # Run all tests by default
        run_tests()