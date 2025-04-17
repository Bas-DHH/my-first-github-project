

 # 1. DHH MVP – Product Requirements Document (PRD)
 
 ## 1.1 Overview
 DHH (De Horeca Helper) is a mobile-friendly web application that enables hospitality businesses to manage hygiene-related tasks digitally. The app replaces traditional paper-based systems with structured, category-based to-do tasks. Tasks can be assigned to users or left open for anyone. Each task belongs to a predefined category, with logic tailored to the task type.
 
 This MVP will focus on mobile-first usability, essential task functionality, flexible scheduling, and role-based access.
 
 ## 1.2 Goals
 1. Launch a working version of DHH for real-world use
 2. Allow businesses to manage hygiene tasks per category
 3. Enable users to complete tasks with category-specific logic
 4. Provide clear task schedules (daily, weekly, monthly)
 5. Ensure mobile-first UI
 
 ## 1.3 User Roles
 
 ### 1.3.1 Platform Owner (DHH Admin)
 - Manages customers and platform usage (manually via Supabase)
 - Predefines task categories and templates
 
 ### 1.3.2 Business Admin
 - Manages users (creates via name + email)
 - Creates and assigns tasks
 - Views task progress, completion, and overdue statuses
 
 ### 1.3.3 Staff User
 - Views daily/weekly/monthly tasks
 - Completes tasks using forms based on category logic
 - Can leave optional comments
 
 ## 1.4 Core Concepts
 
 ### 1.4.1 Predefined Categories
 - Categories are hardcoded and cannot be created by businesses
 - Categories:
   1. Temperature Control
   2. Goods Receiving
   3. Critical Cooking Processes
   4. Verification of Measurement Devices
   5. Cleaning Records
 
 ### 1.4.2 Tasks
 - Created by Business Admins
 - Assigned to: specific user or public (available to all staff)
 - Frequencies:
   - Daily
   - Weekly (select days of the week)
   - Monthly (select day of the month)
 - Generates a new task instance for each scheduled due date
 - Missed tasks are marked as overdue and shown as high priority
 
 ### 1.4.3 Task Logic per Category
 
 #### Temperature Control
 - °C input
 - Validate within defined range (e.g., 0–7°C)
 - Mark as alert if out of range
 - Optional comment
 
 #### Goods Receiving
 - Supplier name
 - Product temperature (with range validation)
 - Optional comment
 - Checkbox: “No issues” / “Damaged packaging”
 
 #### Critical Cooking Processes
 - Food name
 - Temperature input (e.g., ≥75°C)
 - Threshold validation
 - Optional comment
 
 #### Verification of Measurement Devices
 - Device name
 - Checkbox: “Verified”
 - Optional comment
 
 #### Cleaning Records
 - Area cleaned
 - Timestamp
 - Optional comment
 
 ## 1.5 Authentication & User Creation
 - Admin creates staff users by entering name + email
 - System sends welcome email with login link and temporary password
 - Auth handled via Supabase
 
 ## 1.6 Database Schema (Simplified)
 
 ### users
 - id, name, email, role (admin/staff), business_id
 
 ### businesses
 - id, name
 
 ### categories
 - id, name
 
 ### tasks
 - id, title, category_id, created_by, assigned_to_user_id (nullable), frequency, business_id, schedule_days, created_at
 
 ### task_instances
 - id, task_id, due_date, completed_by, completed_at, is_overdue, data (JSON), comment
 
 ## 1.7 Tech Stack
 - Frontend: Next.js (App Router)
 - Styling: Tailwind CSS
 - UI Components: shadcn/ui
 - Backend: Supabase (auth + db)
 - Hosting: Vercel
 - Version Control: GitHub
 - IDE: Cursor
 
 ## 1.8 Mobile UX
 - All interfaces are mobile-first
 - Focus on:
   - Today’s tasks
   - Task forms (category-specific logic)
   - Overdue highlights
 
 ## 1.9 Not in MVP (Planned for Later)
 - Billing and subscriptions
 - Teams & team-based task assignment
 - Photo uploads
 - Native apps or PWA
 - Platform admin panel for platform owner
 
 ## 1.10 Open Design Decisions
 1. Task creation UI per category – use shared form component with dynamic fields?
 2. Overdue logic – do we mark at midnight or allow grace period?
 3. Task editability – can admins change inputs after submission?
 
 ## 1.11 Confirmed Scope
 - No team-based assignments (yet)
 - No image uploads in MVP
 - 1 business = 1 location
 
 ## 1.12 Step-by-Step Build Plan
 
 ### 1.12.1 Setup
 1. Create GitHub repo for DHH
 2. Initialize Next.js app with App Router
 3. Add Tailwind CSS and configure styling
 4. Install and configure shadcn/ui
 5. Deploy initial version to Vercel
 
 ### 1.12.2 Supabase Configuration
 6. Set up Supabase project
 7. Define database schema (users, businesses, categories, tasks, task_instances)
 8. Enable Supabase Auth (email/password)
 9. Configure SMTP to send invitation emails
 
 ### 1.12.3 Auth & User Flow
 10. Build login and registration pages
 11. Create admin flow to add users (name + email)
 12. Handle welcome email with temp password and link
 
 ### 1.12.4 Task System
 13. Display predefined categories from Supabase
 14. Build admin interface to create tasks with:
     - Title
     - Frequency (daily, weekly with days, monthly)
     - Assigned user or public
     - Category
 15. Set up scheduled logic to generate task instances
 
 ### 1.12.5 Task Completion UI
 16. Build staff view: “Today’s Tasks”
 17. Render task completion form based on category
 18. Save completed data with timestamp and optional comment
 19. Highlight overdue tasks in UI
 
 ### 1.12.6 Admin Dashboard
 20. Show list of tasks with status (done, overdue)
 21. Filter by category, date, and user
 22. View task details and completion logs
 
 ### 1.12.7 Polish and Deploy
 23. Test entire flow (create → assign → complete)
 24. Polish responsive UI and UX
 25. Deploy stable version to Vercel