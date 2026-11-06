const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/corporate-task-tracker';

async function seed() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!');

    // 1. Ensure realistic team members exist
    let users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Creating default team accounts...');
      const defaultPassword = await bcrypt.hash('password123', 10);
      const defaultUsers = [
        {
          name: 'Alex Morgan',
          email: 'alex.morgan@company.com',
          password: defaultPassword,
          role: 'Admin',
        },
        {
          name: 'Elena Rostova',
          email: 'elena.rostova@company.com',
          password: defaultPassword,
          role: 'User',
        },
        {
          name: 'Marcus Chen',
          email: 'marcus.chen@company.com',
          password: defaultPassword,
          role: 'User',
        },
        {
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@company.com',
          password: defaultPassword,
          role: 'User',
        },
      ];
      users = await User.insertMany(defaultUsers);
      console.log(`Created ${users.length} team members (password: password123):`);
      users.forEach((u) => console.log(` - ${u.name} (${u.email}) [${u.role}]`));
    }

    const adminUser = users.find((u) => u.role === 'Admin') || users[0];
    const devUsers = users.filter((u) => u._id.toString() !== adminUser._id.toString());
    const member1 = devUsers[0] || adminUser;
    const member2 = devUsers[1] || member1;
    const member3 = devUsers[2] || member1;

    console.log(`Assigning tasks among: ${adminUser.name} (Admin), ${member1.name}, ${member2.name}, ${member3.name}`);

    // Clear existing tasks to ensure clean, consistent data
    const existingCount = await Task.countDocuments();
    if (existingCount > 0) {
      console.log(`Clearing ${existingCount} existing tasks...`);
      await Task.deleteMany({});
    }

    // Define rich corporate tasks populated specifically for Scrum View, Kanban, and Project Management
    const now = new Date();
    const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    const taskData = [
      // =========================================================================
      // SPRINT 1: ACTIVE EXECUTION SPRINT (To-Do, In Progress, Completed)
      // =========================================================================

      // --- SPRINT 1: COMPLETED ---
      {
        title: 'Architect JWT Auth & Role-Based Access Control',
        description: 'Implement secure JSON Web Token generation with HTTP-only cookies, refresh token rotations, and Admin/User role authorization middleware.',
        status: 'Completed',
        priority: 'High',
        sprint: 'Sprint 1',
        storyPoints: 8,
        milestone: 'Security & Auth Hardening',
        startDate: daysAgo(12),
        dueDate: daysAgo(2),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
        comments: [
          {
            text: 'JWT authentication and route protection middleware have been thoroughly tested and passed code review.',
            author: adminUser._id,
            mentions: [member1._id],
            createdAt: daysAgo(3),
          },
          {
            text: 'Verified role enforcement on the admin endpoints. Looking great!',
            author: member1._id,
            mentions: [adminUser._id],
            createdAt: daysAgo(2),
          },
        ],
      },
      {
        title: 'Design System & Dark / Light Theme Tokens',
        description: 'Set up unified Tailwind CSS color palettes, glassmorphism card surfaces, and persistent theme switcher using React context and local storage.',
        status: 'Completed',
        priority: 'Medium',
        sprint: 'Sprint 1',
        storyPoints: 5,
        milestone: 'UI/UX Design System',
        startDate: daysAgo(10),
        dueDate: daysAgo(3),
        createdBy: adminUser._id,
        assignedTo: member1._id,
        comments: [
          {
            text: 'Theme tokens are integrated with system preferences detection and instant smooth toggle.',
            author: member1._id,
            mentions: [],
            createdAt: daysAgo(4),
          },
        ],
      },
      {
        title: 'Database Schema & Index Optimization',
        description: 'Create Mongoose models for Users, Tasks, and Notifications with proper foreign key references, timestamps, and indexes on email and status.',
        status: 'Completed',
        priority: 'High',
        sprint: 'Sprint 1',
        storyPoints: 5,
        milestone: 'Core Pipeline & Architecture',
        startDate: daysAgo(14),
        dueDate: daysAgo(6),
        createdBy: adminUser._id,
        assignedTo: member2._id,
        comments: [
          {
            text: 'Indexes created on task createdBy and status fields to guarantee fast queries.',
            author: member2._id,
            mentions: [],
            createdAt: daysAgo(7),
          },
        ],
      },

      // --- SPRINT 1: IN PROGRESS ---
      {
        title: 'Interactive Kanban Drag-and-Drop Column Sync',
        description: 'Implement drag-and-drop task card interactions across Backlog, To-Do, In Progress, and Completed columns with optimistic UI updates.',
        status: 'In Progress',
        priority: 'High',
        sprint: 'Sprint 1',
        storyPoints: 8,
        milestone: 'UI/UX Design System',
        startDate: daysAgo(4),
        dueDate: daysFromNow(2),
        createdBy: adminUser._id,
        assignedTo: member1._id,
        comments: [
          {
            text: 'Column state transitions are working locally. Adding mobile touch gesture support today.',
            author: member1._id,
            mentions: [adminUser._id],
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        title: 'Real-Time @Mention Notification Dispatcher',
        description: 'Build backend parser for @username mentions in task comments and dispatch real-time in-app notifications and email summaries.',
        status: 'In Progress',
        priority: 'High',
        sprint: 'Sprint 1',
        storyPoints: 5,
        milestone: 'Core Pipeline & Architecture',
        startDate: daysAgo(3),
        dueDate: daysFromNow(3),
        createdBy: adminUser._id,
        assignedTo: member2._id,
        comments: [
          {
            text: 'Regex parser parses user mentions accurately. Working on the notification bell dropdown UI.',
            author: member2._id,
            mentions: [member3._id],
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        title: 'Scrum Sprint Burndown & Velocity Metrics',
        description: 'Calculate sprint velocity, completed vs total story points, and render real-time progress gauges across active sprints.',
        status: 'In Progress',
        priority: 'Medium',
        sprint: 'Sprint 1',
        storyPoints: 5,
        milestone: 'Q4 Production Release',
        startDate: daysAgo(2),
        dueDate: daysFromNow(4),
        createdBy: adminUser._id,
        assignedTo: member3._id,
        comments: [
          {
            text: 'Velocity calculations matching team targets at 85% completion rate so far.',
            author: member3._id,
            mentions: [],
            createdAt: daysAgo(1),
          },
        ],
      },

      // --- SPRINT 1: TO-DO ---
      {
        title: 'Multi-Criteria Task Sorting & Filter Dropdown',
        description: 'Support multi-field sorting by Due Date, Story Points, Priority, and Creation Date across all Kanban and Scrum views.',
        status: 'To-Do',
        priority: 'Medium',
        sprint: 'Sprint 1',
        storyPoints: 3,
        milestone: 'UI/UX Design System',
        startDate: daysFromNow(1),
        dueDate: daysFromNow(4),
        createdBy: adminUser._id,
        assignedTo: member1._id,
        comments: [
          {
            text: 'Need to ensure sorting preserves active sprint filter state in Scrum view.',
            author: member1._id,
            mentions: [adminUser._id],
            createdAt: daysAgo(1),
          },
        ],
      },
      {
        title: 'Safe Task Deletion Confirmation Dialog',
        description: 'Introduce double-confirmation modal with clear warning text for permanent task removals, restricted to creator and admins.',
        status: 'To-Do',
        priority: 'High',
        sprint: 'Sprint 1',
        storyPoints: 5,
        milestone: 'Security & Auth Hardening',
        startDate: daysFromNow(1),
        dueDate: daysFromNow(5),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
        comments: [],
      },
      {
        title: 'Interactive Tooltips & Keyboard Shortcuts',
        description: 'Add accessible aria-labels, shortcut hints (n = new task, / = search, esc = close), and responsive tooltips to all icon actions.',
        status: 'To-Do',
        priority: 'Low',
        sprint: 'Sprint 1',
        storyPoints: 2,
        milestone: 'UI/UX Design System',
        startDate: daysFromNow(2),
        dueDate: daysFromNow(5),
        createdBy: adminUser._id,
        assignedTo: member3._id,
        comments: [],
      },

      // =========================================================================
      // SPRINT 2: UPCOMING ITERATION (To-Do, In Progress, Completed)
      // =========================================================================

      // --- SPRINT 2: COMPLETED ---
      {
        title: 'REST API Rate Limiting & Helmet Security Headers',
        description: 'Configure express-rate-limit and Helmet security HTTP headers to protect against brute-force attacks and cross-site scripting.',
        status: 'Completed',
        priority: 'High',
        sprint: 'Sprint 2',
        storyPoints: 3,
        milestone: 'Security & Auth Hardening',
        startDate: daysAgo(5),
        dueDate: daysAgo(1),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
        comments: [
          {
            text: 'Rate limiting verified at 100 requests per 15-minute window for public endpoints.',
            author: adminUser._id,
            mentions: [],
            createdAt: daysAgo(1),
          },
        ],
      },

      // --- SPRINT 2: IN PROGRESS ---
      {
        title: 'Granular User Permission Sets & Audit Trail',
        description: 'Enable custom permission matrices for team leaders and maintain an immutable audit log of administrative actions.',
        status: 'In Progress',
        priority: 'High',
        sprint: 'Sprint 2',
        storyPoints: 5,
        milestone: 'Security & Auth Hardening',
        startDate: daysAgo(1),
        dueDate: daysFromNow(6),
        createdBy: adminUser._id,
        assignedTo: member2._id,
        comments: [],
      },
      {
        title: 'Sub-second Search Query Caching with Redis',
        description: 'Implement memory caching layer for common search and tag queries to keep response times under 20ms under heavy concurrency.',
        status: 'In Progress',
        priority: 'Medium',
        sprint: 'Sprint 2',
        storyPoints: 5,
        milestone: 'Core Pipeline & Architecture',
        startDate: daysAgo(1),
        dueDate: daysFromNow(7),
        createdBy: adminUser._id,
        assignedTo: member3._id,
        comments: [],
      },

      // --- SPRINT 2: TO-DO ---
      {
        title: 'Project Management Milestone Roadmap View',
        description: 'Create tabular deliverable overview grouped by project milestones with progress tracking, completion badges, and assignee tags.',
        status: 'To-Do',
        priority: 'Medium',
        sprint: 'Sprint 2',
        storyPoints: 5,
        milestone: 'Q4 Production Release',
        startDate: daysFromNow(3),
        dueDate: daysFromNow(9),
        createdBy: adminUser._id,
        assignedTo: member2._id,
        comments: [],
      },
      {
        title: 'CSV & JSON Task Export Utility',
        description: 'Allow managers to export sprint task logs, story point distributions, and completion records into CSV and JSON formats.',
        status: 'To-Do',
        priority: 'Low',
        sprint: 'Sprint 2',
        storyPoints: 3,
        milestone: 'Q4 Production Release',
        startDate: daysFromNow(4),
        dueDate: daysFromNow(10),
        createdBy: adminUser._id,
        assignedTo: member3._id,
        comments: [],
      },
      {
        title: 'Automated Team Member Email Invitations',
        description: 'Generate secure cryptographically signed invite tokens and dispatch HTML invitation emails to onboard new team members.',
        status: 'To-Do',
        priority: 'High',
        sprint: 'Sprint 2',
        storyPoints: 5,
        milestone: 'Security & Auth Hardening',
        startDate: daysFromNow(2),
        dueDate: daysFromNow(8),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
        comments: [],
      },

      // =========================================================================
      // PRODUCT BACKLOG: UNASSIGNED SPRINT DELIVERABLES
      // =========================================================================
      {
        title: 'Slack & Microsoft Teams Webhook Integrations',
        description: 'Configure outgoing webhooks to broadcast critical task updates and sprint completion alerts into enterprise team channels.',
        status: 'Backlog',
        priority: 'Low',
        sprint: 'Backlog',
        storyPoints: 8,
        milestone: 'Core Pipeline & Architecture',
        startDate: null,
        dueDate: daysFromNow(20),
        createdBy: adminUser._id,
        assignedTo: null,
        comments: [],
      },
      {
        title: 'Single Sign-On (SSO) with Okta and Google Workspace',
        description: 'Add SAML 2.0 and OAuth2 OpenID Connect enterprise identity provider support for automated provisioning and login.',
        status: 'Backlog',
        priority: 'High',
        sprint: 'Backlog',
        storyPoints: 13,
        milestone: 'Security & Auth Hardening',
        startDate: null,
        dueDate: daysFromNow(25),
        createdBy: adminUser._id,
        assignedTo: null,
        comments: [],
      },
      {
        title: 'AI Sprint Story Point Estimation Assistant',
        description: 'Train an intelligent assistant to predict story points and implementation complexity based on past sprint historical velocity.',
        status: 'Backlog',
        priority: 'Low',
        sprint: 'Backlog',
        storyPoints: 8,
        milestone: 'Q4 Production Release',
        startDate: null,
        dueDate: daysFromNow(30),
        createdBy: adminUser._id,
        assignedTo: null,
        comments: [],
      },
      {
        title: 'Mobile PWA Offline Sync & Background Sync API',
        description: 'Enable service worker caching and IndexedDB background sync for offline task creation and optimistic updates on mobile devices.',
        status: 'Backlog',
        priority: 'Medium',
        sprint: 'Backlog',
        storyPoints: 8,
        milestone: 'Core Pipeline & Architecture',
        startDate: null,
        dueDate: daysFromNow(35),
        createdBy: adminUser._id,
        assignedTo: null,
        comments: [],
      },
    ];

    console.log(`Inserting ${taskData.length} tasks...`);
    const insertedTasks = await Task.insertMany(taskData);
    console.log(`Successfully populated ${insertedTasks.length} tasks into the database!`);

    console.log('\n--- Scrum Board Breakdown ---');
    const sprint1Tasks = insertedTasks.filter((t) => t.sprint === 'Sprint 1');
    const sprint2Tasks = insertedTasks.filter((t) => t.sprint === 'Sprint 2');
    const backlogTasks = insertedTasks.filter((t) => t.sprint === 'Backlog');
    console.log(`Sprint 1: ${sprint1Tasks.length} tasks (${sprint1Tasks.reduce((acc, t) => acc + t.storyPoints, 0)} Story Points)`);
    console.log(`Sprint 2: ${sprint2Tasks.length} tasks (${sprint2Tasks.reduce((acc, t) => acc + t.storyPoints, 0)} Story Points)`);
    console.log(`Backlog:  ${backlogTasks.length} tasks (${backlogTasks.reduce((acc, t) => acc + t.storyPoints, 0)} Story Points)`);

    await mongoose.disconnect();
    console.log('\nMongoDB disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding tasks:', err);
    process.exit(1);
  }
}

seed();
