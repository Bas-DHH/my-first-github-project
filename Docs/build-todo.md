

 # DHH MVP – Step-by-Step Build To-Do List
 
 ## 1. Project Setup
 1. Create GitHub repository for DHH
 2. Initialize new Next.js project (App Router)
 3. Install Tailwind CSS and configure PostCSS
 4. Install and configure shadcn/ui for components
 5. Set up basic folder structure (pages, components, lib, etc.)
 6. Deploy initial version to Vercel
 
 ## 2. Supabase Setup
 1. Create a Supabase project
 2. Configure database tables:
    - `users`
    - `businesses`
    - `categories`
    - `tasks`
    - `task_instances`
 3. Enable Supabase Auth (email/password)
 4. Configure SMTP to send invite emails
 
 ## 3. Authentication & User Management
 1. Build login page
 2. Build registration/invite-only flow:
    - Admin enters name + email
    - System sends welcome email with login link and temp password
 3. Create user context (session management)
 4. Protect routes based on role (admin vs staff)
 
 ## 4. Business & User Admin
 1. Business Admin can view all users in their business
 2. Add user creation form (name + email)
 3. Admin can assign roles (`admin`, `staff`)
 4. Business linked on user creation
 
 ## 5. Category Display
 1. Preload category data (hardcoded or seeded)
 2. Create category selection UI for task creation
 3. Display category-specific form fields
 
 ## 6. Task Management
 1. Create task form for admin:
    - Title
    - Frequency (daily, weekly [with days], monthly)
    - Assign to user or public
    - Select category
 2. Save tasks in Supabase
 3. Create logic to auto-generate task instances based on frequency
 4. Build cron/scheduled function to run daily
 
 ## 7. Task Completion (Staff View)
 1. Build “Today’s Tasks” view
 2. Filter tasks by assigned/public and due today
 3. Render category-specific forms:
    - Temperature input with validation
    - Goods receiving form
    - Cooking process form
    - Device verification form
    - Cleaning confirmation
 4. Save completion data to `task_instances`
 5. Mark task as completed, store timestamp and comment
 6. Display overdue tasks clearly
 
 ## 8. Admin Dashboard (Light)
 1. List of created tasks
 2. Filter by category, user, status, and date
 3. View completion logs per task
 4. Basic status indicators: pending, completed, overdue
 
 ## 9. UI/UX Polish
 1. Ensure full mobile responsiveness
 2. Use card-style layout for tasks on mobile
 3. Implement loading states and error messages
 4. Add basic theming and branding
 
 ## 10. Final Prep & Launch
 1. Test end-to-end flows
 2. Clean up codebase
 3. Final deployment to Vercel
 4. Share internal demo link for testing
 5. Plan future updates (billing, notifications, teams, etc.)