/**
 * Mock Data Integration Example
 * 
 * This file demonstrates how to use the mock data services in your application.
 * Copy and adapt these examples to use the mock data in your components.
 */

import React, { useEffect, useState } from 'react';
import { 
  taskService, 
  userService, 
  volunteerService,
  notificationService,
  reviewService,
  categoryService,
  statisticsService
} from '../services/mockServiceAdapter';

/**
 * Example of fetching and displaying tasks
 */
export const TaskListExample = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch tasks on component mount and when page changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const result = await taskService.getTasks({
          page: pagination.page,
          limit: pagination.limit
        });
        
        setTasks(result.tasks);
        setPagination({
          ...pagination,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages
        });
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [pagination.page, pagination.limit]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Render loading state, tasks, and pagination
  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <h2>Task List</h2>
      <div>
        {tasks.map(task => (
          <div key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Category: {task.category}</p>
            <p>Status: {task.status}</p>
          </div>
        ))}
      </div>

      {/* Simple pagination */}
      <div>
        <button 
          disabled={pagination.page === 1} 
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button 
          disabled={pagination.page === pagination.totalPages} 
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

/**
 * Example of task details with volunteer functionality
 */
export const TaskDetailExample = ({ taskId }) => {
  const [task, setTask] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState(1); // This would come from your auth system

  // Fetch task details and volunteers
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        const taskData = await taskService.getTaskById(taskId);
        setTask(taskData);
        
        // If current user is task creator, fetch volunteers
        if (taskData.creatorId === currentUserId) {
          const volunteerData = await volunteerService.getTaskVolunteers(taskId);
          setVolunteers(volunteerData.volunteers);
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, currentUserId]);

  // Handle volunteering for a task
  const handleVolunteer = async () => {
    try {
      await volunteerService.volunteerForTask(currentUserId, taskId);
      alert('Successfully volunteered for this task!');
      // Refresh task data
      const updatedTask = await taskService.getTaskById(taskId);
      setTask(updatedTask);
    } catch (error) {
      console.error('Error volunteering for task:', error);
      alert('Failed to volunteer for task: ' + error.message);
    }
  };

  // Handle accepting a volunteer
  const handleAcceptVolunteer = async (volunteerId) => {
    try {
      await volunteerService.updateVolunteerStatus(volunteerId, 'ACCEPTED');
      alert('Volunteer accepted!');
      // Refresh volunteers and task data
      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);
      const volunteerData = await volunteerService.getTaskVolunteers(taskId);
      setVolunteers(volunteerData.volunteers);
    } catch (error) {
      console.error('Error accepting volunteer:', error);
      alert('Failed to accept volunteer: ' + error.message);
    }
  };

  if (loading) {
    return <div>Loading task details...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  const isTaskCreator = task.creatorId === currentUserId;
  const canVolunteer = task.status === 'POSTED' && !isTaskCreator;

  return (
    <div>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p>Category: {task.category}</p>
      <p>Location: {task.location}</p>
      <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
      <p>Status: {task.status}</p>
      
      {/* Show different actions based on user role */}
      {isTaskCreator && (
        <div>
          <h3>Volunteers</h3>
          {volunteers.length > 0 ? (
            <ul>
              {volunteers.map(volunteer => (
                <li key={volunteer.id}>
                  {volunteer.user.name} {volunteer.user.surname} - {volunteer.status}
                  {volunteer.status === 'PENDING' && (
                    <button onClick={() => handleAcceptVolunteer(volunteer.id)}>
                      Accept
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No volunteers yet</p>
          )}
        </div>
      )}

      {canVolunteer && (
        <button onClick={handleVolunteer}>
          Volunteer for this Task
        </button>
      )}
    </div>
  );
};

/**
 * Example of user profile with tasks and reviews
 */
export const UserProfileExample = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserProfile(userId);
        setProfile(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h2>Profile: {profile.name} {profile.surname}</h2>
      <p>Username: {profile.username}</p>
      <p>Rating: {profile.rating} / 5</p>
      <p>Completed Tasks: {profile.completedTaskCount}</p>
      
      <h3>Created Tasks</h3>
      {profile.createdTasks.length > 0 ? (
        <ul>
          {profile.createdTasks.map(task => (
            <li key={task.id}>
              {task.title} - {task.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No created tasks</p>
      )}
      
      <h3>Assigned Tasks</h3>
      {profile.assignedTasks.length > 0 ? (
        <ul>
          {profile.assignedTasks.map(task => (
            <li key={task.id}>
              {task.title} - {task.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No assigned tasks</p>
      )}
      
      <h3>Reviews</h3>
      {profile.receivedReviews.length > 0 ? (
        <ul>
          {profile.receivedReviews.map(review => (
            <li key={review.id}>
              {review.score}/5 - "{review.comment}"
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews yet</p>
      )}
    </div>
  );
};

/**
 * Example of notifications list with mark as read functionality
 */
export const NotificationsExample = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const result = await notificationService.getUserNotifications(userId);
        setNotifications(result.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead(userId);
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      
      {unreadCount > 0 && (
        <button onClick={handleMarkAllAsRead}>
          Mark All as Read
        </button>
      )}
      
      {notifications.length > 0 ? (
        <ul>
          {notifications.map(notification => (
            <li 
              key={notification.id}
              style={{ 
                fontWeight: notification.isRead ? 'normal' : 'bold',
                backgroundColor: notification.isRead ? 'transparent' : '#f0f8ff'
              }}
            >
              <div>{notification.content}</div>
              <div>{new Date(notification.timestamp).toLocaleString()}</div>
              {!notification.isRead && (
                <button onClick={() => handleMarkAsRead(notification.id)}>
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications</p>
      )}
    </div>
  );
};

/**
 * Example of categories list with task counts
 */
export const CategoriesExample = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, statsData] = await Promise.all([
          categoryService.getAllCategories(),
          statisticsService.getStatistics()
        ]);
        
        setCategories(categoriesData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching categories and statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div>
      <h2>Task Categories</h2>
      
      {categories.map(category => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
          {statistics && (
            <p>
              Tasks: {statistics.categoryCounts[category.id] || 0}
            </p>
          )}
        </div>
      ))}
      
      {statistics && (
        <div>
          <h2>Platform Statistics</h2>
          <p>Total Users: {statistics.totalUsers}</p>
          <p>Total Tasks: {statistics.totalTasks}</p>
          <p>Completed Tasks: {statistics.completedTasks}</p>
          <p>Active Volunteers: {statistics.activeVolunteers}</p>
        </div>
      )}
    </div>
  );
};

// Export all example components
export default {
  TaskListExample,
  TaskDetailExample,
  UserProfileExample,
  NotificationsExample,
  CategoriesExample
};
