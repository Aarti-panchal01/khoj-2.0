# Implementation Plan: Complete Claims, Notifications, and Rewards System

## Overview

This implementation plan covers the complete claims, notifications, and rewards system for the Khoj Lost & Found application. The system is mostly implemented on the backend, with the primary work being frontend integration, testing, and deployment synchronization.

The implementation follows this approach:
1. Verify and fix backend infrastructure (DSI campus structure)
2. Verify existing backend routes work correctly
3. Build frontend pages and components
4. Integrate API clients
5. Test end-to-end flows
6. Write property-based tests for all 30 properties
7. Sync changes to root directory for Vercel deployment
8. Deploy to production

## Tasks

- [x] 1. Backend Infrastructure Verification and Fixes
  - [x] 1.1 Fix DSI university campus structure in universities.js
    - Update Dayananda Sagar Institutions entry to include four campuses: DSU, DSCE, DSATM, DSIT
    - Verify campus data structure matches requirements (ObjectId references)
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 1.2 Verify claims routes functionality
    - Test POST /claims endpoint (create claim)
    - Test GET /claims/item/:itemId endpoint (get claims for item)
    - Test GET /claims/mine endpoint (get user's claims)
    - Test PUT /claims/:id/approve endpoint (approve claim)
    - Test PUT /claims/:id/reject endpoint (reject claim)
    - Verify all validation logic (self-claiming, duplicate claims, ownership)
    - _Requirements: 2.4, 2.5, 2.6, 3.4, 3.9, 3.11_

  - [x] 1.3 Verify notifications routes functionality
    - Test GET /notifications endpoint (list notifications)
    - Test GET /notifications/unread endpoint (get unread count)
    - Test PUT /notifications/:id/read endpoint (mark as read)
    - Test PUT /notifications/read-all endpoint (mark all as read)
    - Verify notification creation on claim events
    - _Requirements: 6.7, 6.8, 6.9, 6.10_

  - [x] 1.4 Verify reputation system integration
    - Test reputation points awarded on claim approval (exactly 10 points)
    - Verify atomic increment using MongoDB $inc operator
    - Verify no points awarded to item owner
    - Verify no points for rejected or pending claims
    - _Requirements: 3.6, 9.1, 9.2, 9.4, 9.7_

- [x] 2. Frontend API Client Integration
  - [x] 2.1 Add ClaimsAPI to apiClient.js
    - Implement create method (POST /claims)
    - Implement getForItem method (GET /claims/item/:itemId)
    - Implement getMine method (GET /claims/mine)
    - Implement approve method (PUT /claims/:id/approve)
    - Implement reject method (PUT /claims/:id/reject)
    - Include authentication headers in all requests
    - Use apiRequest utility for consistent error handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 2.2 Add NotificationsAPI to apiClient.js
    - Implement list method (GET /notifications)
    - Implement getUnreadCount method (GET /notifications/unread)
    - Implement markAsRead method (PUT /notifications/:id/read)
    - Implement markAllAsRead method (PUT /notifications/read-all)
    - Include authentication headers in all requests
    - Use apiRequest utility for consistent error handling
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 3. Implement NotificationsPage Component
  - [x] 3.1 Create NotificationsPage component structure
    - Create src/pages/dashboard/Notifications.jsx
    - Set up state management (notifications, loading, markingAllRead)
    - Implement fetchNotifications function with API integration
    - Display loading state while fetching
    - Display empty state when no notifications exist
    - _Requirements: 8.1, 8.10_

  - [x] 3.2 Implement notification list display
    - Display all notifications sorted by creation date (newest first)
    - Show notification type, message, timestamp for each notification
    - Show associated item title and type when available
    - Visually distinguish unread notifications (background color/styling)
    - Auto-mark notifications as read when viewed
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 3.3 Implement "Mark All as Read" functionality
    - Add "Mark All as Read" button to page header
    - Call NotificationsAPI.markAllAsRead on button click
    - Update local state to reflect all notifications as read
    - Show loading state during operation
    - Handle errors gracefully
    - _Requirements: 8.6, 8.7_

  - [x] 3.4 Add navigation links for claim_request notifications
    - Display link to Claims Management page for claim_request notifications
    - Ensure link includes proper routing
    - _Requirements: 8.8_

  - [x] 3.5 Style NotificationsPage with premium design
    - Use card-based layout for notifications
    - Apply gradient backgrounds for unread notifications
    - Add hover effects and transitions
    - Ensure mobile responsiveness (320px+)
    - Use Tailwind CSS classes matching design system
    - _Requirements: 13.3_

  - [ ]* 3.6 Write unit tests for NotificationsPage
    - Test notification list rendering
    - Test empty state display
    - Test mark as read functionality
    - Test mark all as read functionality
    - Test error handling
    - Test loading states

- [x] 4. Implement ClaimsManagementPage Component
  - [x] 4.1 Create ClaimsManagementPage component structure
    - Create src/pages/dashboard/ClaimsManagement.jsx
    - Set up state management (claims, loading, processingClaimId, error)
    - Implement fetchClaims function to get claims for user's items
    - Display loading state while fetching
    - Display empty state when no pending claims exist
    - _Requirements: 3.1_

  - [x] 4.2 Implement claims list display
    - Display all pending claims in card layout
    - Show item thumbnail and title for each claim
    - Show claimer information (name, profile)
    - Display verification answers (whereList, whenList, specificDetails)
    - Use expandable sections for verification details
    - _Requirements: 3.1, 3.2_

  - [x] 4.3 Implement approve claim functionality
    - Add "Approve" button for each pending claim
    - Show confirmation dialog before approval
    - Call ClaimsAPI.approve on confirmation
    - Update local state to remove approved claim
    - Reveal contact information after approval (name, email, phone)
    - Show success message
    - Handle errors with user-friendly messages
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 4.4 Implement reject claim functionality
    - Add "Reject" button for each pending claim
    - Show confirmation dialog before rejection
    - Call ClaimsAPI.reject on confirmation
    - Update local state to remove rejected claim
    - Show success message
    - Handle errors with user-friendly messages
    - _Requirements: 3.9, 3.10_

  - [x] 4.5 Style ClaimsManagementPage with premium design
    - Use card-based layout with shadows and borders
    - Add gradient backgrounds for action buttons
    - Implement hover effects and transitions
    - Ensure mobile responsiveness (320px+)
    - Use Tailwind CSS classes matching design system
    - _Requirements: 13.2_

  - [ ]* 4.6 Write unit tests for ClaimsManagementPage
    - Test claims list rendering
    - Test empty state display
    - Test approve functionality
    - Test reject functionality
    - Test error handling
    - Test loading states
    - Test contact information reveal

- [x] 5. Enhance NotificationBell Component
  - [x] 5.1 Implement unread count fetching
    - Add state for unreadCount
    - Fetch unread count from NotificationsAPI.getUnreadCount on mount
    - Handle API errors gracefully (hide badge on error)
    - _Requirements: 7.2, 14.7_

  - [x] 5.2 Implement polling for unread count
    - Set up interval to fetch unread count every 30 seconds
    - Clean up interval on component unmount
    - Ensure polling doesn't block UI
    - _Requirements: 7.5_

  - [x] 5.3 Implement dynamic badge display
    - Display red badge with count number when unreadCount > 0
    - Hide badge when unreadCount = 0
    - Position badge absolutely on bell icon
    - Use appropriate sizing for mobile and desktop
    - _Requirements: 7.3, 7.4_

  - [x] 5.4 Add navigation to NotificationsPage
    - Navigate to /notifications on bell icon click
    - Use React Router navigation
    - _Requirements: 7.6_

  - [x] 5.5 Style NotificationBell with premium design
    - Use Bell icon from lucide-react
    - Apply hover effects
    - Ensure touch-friendly size on mobile (44px minimum)
    - Use Tailwind CSS classes matching design system
    - _Requirements: 7.7, 13.4_

  - [ ]* 5.6 Write unit tests for NotificationBell
    - Test unread count fetching
    - Test badge display logic
    - Test polling interval
    - Test navigation on click
    - Test error handling

- [x] 6. Verify and Enhance ClaimModal Component
  - [x] 6.1 Verify ClaimModal exists and has required fields
    - Check src/components/ui/ClaimModal.jsx exists
    - Verify whereList, whenList, specificDetails fields present
    - Verify all fields are required before submission
    - _Requirements: 2.2, 2.3_

  - [x] 6.2 Implement claim submission with API integration
    - Call ClaimsAPI.create with verification answers
    - Handle success with toast notification
    - Handle errors with specific error messages (own item, duplicate claim)
    - Close modal on success
    - _Requirements: 2.4, 14.3, 14.4_

  - [x] 6.3 Enhance ClaimModal validation
    - Add minimum character length validation (10 chars each)
    - Add whitespace-only validation
    - Display field-specific error messages
    - Disable submit button until all fields valid
    - _Requirements: 2.3, 14.2_

  - [x] 6.4 Style ClaimModal with premium design
    - Use backdrop blur effect
    - Add gradient styling for submit button
    - Implement smooth animations (Framer Motion)
    - Ensure mobile responsiveness (320px+)
    - Use Tailwind CSS classes matching design system
    - _Requirements: 13.1, 13.7_

  - [ ]* 6.5 Write unit tests for ClaimModal
    - Test form validation
    - Test submission with valid data
    - Test error handling (own item, duplicate)
    - Test modal open/close
    - Test field validation messages

- [x] 7. Implement Reward System Display
  - [x] 7.1 Add reward selection to PostItem page
    - Add reward selection interface for lost items only
    - Display six options: gratitude, food_treat, coffee, cash_reward, gift, none
    - Show emoji icons for each option
    - Store selected reward in form state
    - Include reward in item creation API call
    - _Requirements: 5.1, 5.2_

  - [x] 7.2 Add reward badge to Home page item cards
    - Display reward badge on lost item cards only
    - Show badge only when reward is not "none"
    - Use emoji mappings: gratitude→🙏, food_treat→🍕, coffee→☕, cash_reward→💵, gift→🎁
    - Apply premium gradient styling (amber/yellow)
    - Ensure mobile responsiveness
    - _Requirements: 5.3, 5.4, 5.7, 5.8_

  - [x] 7.3 Add reward section to ItemDetailModal
    - Display prominent reward section for lost items with rewards
    - Show large emoji icon (text-3xl)
    - Display reward type label
    - Add descriptive text: "The owner is offering [reward] for finding this item"
    - Apply gradient card styling with shadows
    - Hide section when reward is "none"
    - _Requirements: 5.5, 5.6, 5.7, 5.8_

  - [ ]* 7.4 Write unit tests for reward display
    - Test reward badge conditional rendering
    - Test emoji mapping correctness
    - Test reward section in detail modal
    - Test reward selection in PostItem form

- [x] 8. Implement Contact System for Lost Items
  - [x] 8.1 Add contact section to ItemDetailModal for lost items
    - Display "Contact Owner" section for lost items only
    - Show contact buttons based on contactPreference field
    - _Requirements: 4.1, 4.2_

  - [x] 8.2 Implement email contact button
    - Display email button when contactPreference is "email" or "both"
    - Use mailto: protocol with owner's email
    - Pre-fill subject line with item title
    - Ensure button is touch-friendly on mobile (44px minimum)
    - _Requirements: 4.3, 4.5, 13.6_

  - [x] 8.3 Implement phone contact button
    - Display phone button when contactPreference is "phone" or "both"
    - Use tel: protocol with owner's phone number
    - Ensure button is touch-friendly on mobile (44px minimum)
    - _Requirements: 4.4, 4.6, 13.6_

  - [x] 8.4 Style contact buttons with premium design
    - Use gradient backgrounds
    - Add hover effects and transitions
    - Use appropriate icons (Mail, Phone from lucide-react)
    - Ensure mobile responsiveness
    - _Requirements: 4.7_

  - [ ]* 8.5 Write unit tests for contact system
    - Test contact button conditional display
    - Test email button href format
    - Test phone button href format
    - Test contactPreference mapping

- [x] 9. Add Routing for New Pages
  - [x] 9.1 Add NotificationsPage route to App.jsx
    - Add route for /notifications path
    - Ensure route is protected (requires authentication)
    - Import NotificationsPage component
    - _Requirements: 7.6_

  - [x] 9.2 Add ClaimsManagementPage route to App.jsx
    - Add route for /claims path
    - Ensure route is protected (requires authentication)
    - Import ClaimsManagementPage component
    - _Requirements: 8.8_

- [x] 10. Checkpoint - Verify Core Functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. End-to-End Integration Testing
  - [x] 11.1 Test complete claim submission flow
    - User views found item → Opens claim modal → Fills verification → Submits claim
    - Verify claim created in database
    - Verify notification created for item owner
    - Verify success message displayed
    - _Requirements: 12.1_

  - [x] 11.2 Test claim approval flow
    - Item owner views claims management page → Sees pending claim → Approves claim
    - Verify claim status updated to "approved"
    - Verify item status updated to "resolved"
    - Verify claimer awarded 10 reputation points
    - Verify notification created for claimer
    - Verify contact information revealed
    - _Requirements: 12.3_

  - [x] 11.3 Test claim rejection flow
    - Item owner views claims management page → Sees pending claim → Rejects claim
    - Verify claim status updated to "rejected"
    - Verify notification created for claimer
    - Verify no reputation points awarded
    - _Requirements: 12.4_

  - [x] 11.4 Test notification system
    - Verify notification bell displays correct unread count
    - Verify notification bell polls every 30 seconds
    - Verify notifications page displays all notifications
    - Verify notifications marked as read when viewed
    - Verify "Mark All as Read" functionality
    - _Requirements: 12.5_

  - [x] 11.5 Test reward display system
    - Post lost item with reward → Verify reward badge on home page
    - Click item → Verify reward section in detail modal
    - Test all reward types and emoji mappings
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 11.6 Test contact system
    - View lost item → Verify contact buttons display based on contactPreference
    - Click email button → Verify mailto: link opens
    - Click phone button → Verify tel: link initiates call
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 11.7 Test error handling scenarios
    - Test self-claiming prevention
    - Test duplicate claim prevention
    - Test unauthorized claim processing
    - Test API error handling
    - Test validation errors
    - _Requirements: 14.3, 14.4, 14.5_

  - [x] 11.8 Test mobile responsiveness
    - Test all pages on mobile viewport (320px)
    - Verify touch targets are 44px minimum
    - Verify layouts adapt correctly
    - Test claim modal on mobile
    - Test notifications page on mobile
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 13.7_

- [x] 12. Property-Based Testing Implementation
  - [ ]* 12.1 Write property test for claim creation validation
    - **Property 1: Claim Creation Validation**
    - **Validates: Requirements 2.5, 2.6**
    - Test with random users and items
    - Verify rejection when user is owner or has pending claim
    - Use fast-check with 100 iterations

  - [ ]* 12.2 Write property test for claim record completeness
    - **Property 2: Claim Record Completeness**
    - **Validates: Requirements 2.4, 2.8**
    - Test with random claim data
    - Verify all required fields present in created claim
    - Use fast-check with 100 iterations

  - [ ]* 12.3 Write property test for notification creation on claim events
    - **Property 3: Notification Creation on Claim Events**
    - **Validates: Requirements 2.7, 3.7, 3.10, 6.2, 6.3, 6.4**
    - Test with random claim events (creation, approval, rejection)
    - Verify exactly one notification created for correct recipient
    - Use fast-check with 100 iterations

  - [ ]* 12.4 Write property test for claim approval side effects
    - **Property 4: Claim Approval Side Effects**
    - **Validates: Requirements 3.4, 3.5, 3.6, 3.7, 9.1, 9.2, 9.7**
    - Test with random approved claims
    - Verify all side effects: status update, item resolved, reputation +10, notification, owner reputation unchanged
    - Use fast-check with 100 iterations

  - [ ]* 12.5 Write property test for claim rejection side effects
    - **Property 5: Claim Rejection Side Effects**
    - **Validates: Requirements 3.9, 3.10, 9.7**
    - Test with random rejected claims
    - Verify status update, notification, no reputation changes
    - Use fast-check with 100 iterations

  - [ ]* 12.6 Write property test for claim processing authorization
    - **Property 6: Claim Processing Authorization**
    - **Validates: Requirements 3.11**
    - Test with random users and claims
    - Verify rejection when user is not owner or claim not pending
    - Use fast-check with 100 iterations

  - [ ]* 12.7 Write property test for contact preference mapping
    - **Property 7: Contact Preference Mapping**
    - **Validates: Requirements 4.2, 4.3, 4.4**
    - Test with random contactPreference values
    - Verify correct buttons displayed for each preference
    - Use fast-check with 100 iterations

  - [ ]* 12.8 Write property test for contact link format
    - **Property 8: Contact Link Format**
    - **Validates: Requirements 4.5, 4.6**
    - Test with random email and phone values
    - Verify correct protocol (mailto:, tel:) in href
    - Use fast-check with 100 iterations

  - [ ]* 12.9 Write property test for reward emoji mapping
    - **Property 9: Reward Emoji Mapping**
    - **Validates: Requirements 5.4**
    - Test with all reward types
    - Verify correct emoji for each reward type
    - Use fast-check with 100 iterations

  - [ ]* 12.10 Write property test for reward display conditional
    - **Property 10: Reward Display Conditional**
    - **Validates: Requirements 5.3, 5.5, 5.7**
    - Test with random items (lost/found, various rewards)
    - Verify badge displayed only for lost items with reward != "none"
    - Use fast-check with 100 iterations

  - [ ]* 12.11 Write property test for notification type validation
    - **Property 11: Notification Type Validation**
    - **Validates: Requirements 6.1**
    - Test with random notification types (valid and invalid)
    - Verify only four valid types accepted
    - Use fast-check with 100 iterations

  - [ ]* 12.12 Write property test for notification default state
    - **Property 12: Notification Default State**
    - **Validates: Requirements 6.6**
    - Test with random new notifications
    - Verify read status is false by default
    - Use fast-check with 100 iterations

  - [ ]* 12.13 Write property test for unread count accuracy
    - **Property 13: Unread Count Accuracy**
    - **Validates: Requirements 6.7**
    - Test with random notification sets
    - Verify count equals number of unread notifications for user
    - Use fast-check with 100 iterations

  - [ ]* 12.14 Write property test for mark as read operation
    - **Property 14: Mark As Read Operation**
    - **Validates: Requirements 6.8**
    - Test with random notifications and users
    - Verify read status updated only for notification owner
    - Use fast-check with 100 iterations

  - [ ]* 12.15 Write property test for mark all as read operation
    - **Property 15: Mark All As Read Operation**
    - **Validates: Requirements 6.9**
    - Test with random notification sets
    - Verify all user's unread notifications marked as read
    - Use fast-check with 100 iterations

  - [ ]* 12.16 Write property test for notification sorting
    - **Property 16: Notification Sorting**
    - **Validates: Requirements 6.10**
    - Test with random notification sets
    - Verify notifications sorted by createdAt descending
    - Use fast-check with 100 iterations

  - [ ]* 12.17 Write property test for notification bell badge display
    - **Property 17: Notification Bell Badge Display**
    - **Validates: Requirements 7.3, 7.4**
    - Test with random unread counts
    - Verify badge displayed when count > 0, hidden when count = 0
    - Use fast-check with 100 iterations

  - [ ]* 12.18 Write property test for notification bell polling
    - **Property 18: Notification Bell Polling**
    - **Validates: Requirements 7.5**
    - Test polling behavior with timers
    - Verify fetch on mount and every 30 seconds
    - Use fast-check with 100 iterations

  - [ ]* 12.19 Write property test for claims display filtering
    - **Property 19: Claims Display Filtering**
    - **Validates: Requirements 3.1**
    - Test with random claim sets
    - Verify only pending claims for user's items displayed
    - Use fast-check with 100 iterations

  - [ ]* 12.20 Write property test for verification fields display
    - **Property 20: Verification Fields Display**
    - **Validates: Requirements 3.2**
    - Test with random claims
    - Verify all three verification fields visible to owner
    - Use fast-check with 100 iterations

  - [ ]* 12.21 Write property test for reputation initialization
    - **Property 21: Reputation Initialization**
    - **Validates: Requirements 9.6**
    - Test with random new users
    - Verify reputation initialized to 0
    - Use fast-check with 100 iterations

  - [ ]* 12.22 Write property test for reputation atomic increment
    - **Property 22: Reputation Atomic Increment**
    - **Validates: Requirements 9.4**
    - Test with concurrent claim approvals
    - Verify final reputation = initial + (10 * approvals)
    - Use fast-check with 100 iterations

  - [ ]* 12.23 Write property test for campus selector options
    - **Property 23: Campus Selector Options**
    - **Validates: Requirements 1.2**
    - Test with universities having N campuses
    - Verify exactly N campus options displayed
    - Use fast-check with 100 iterations

  - [ ]* 12.24 Write property test for item storage references
    - **Property 24: Item Storage References**
    - **Validates: Requirements 1.4**
    - Test with random posted items
    - Verify universityId and campusId are ObjectId types
    - Use fast-check with 100 iterations

  - [ ]* 12.25 Write property test for item display cache usage
    - **Property 25: Item Display Cache Usage**
    - **Validates: Requirements 1.5**
    - Test with random displayed items
    - Verify UI renders cached string fields, not ObjectId references
    - Use fast-check with 100 iterations

  - [ ]* 12.26 Write property test for found item claim button
    - **Property 26: Found Item Claim Button**
    - **Validates: Requirements 2.1**
    - Test with random found items
    - Verify "Claim This Item" button present in detail modal
    - Use fast-check with 100 iterations

  - [ ]* 12.27 Write property test for lost item contact section
    - **Property 27: Lost Item Contact Section**
    - **Validates: Requirements 4.1**
    - Test with random lost items
    - Verify "Contact Owner" section present in detail modal
    - Use fast-check with 100 iterations

  - [ ]* 12.28 Write property test for claim modal validation
    - **Property 28: Claim Modal Validation**
    - **Validates: Requirements 2.3**
    - Test with random verification field values
    - Verify rejection when fields empty or whitespace-only
    - Use fast-check with 100 iterations

  - [ ]* 12.29 Write property test for error message specificity
    - **Property 29: Error Message Specificity**
    - **Validates: Requirements 14.3, 14.4, 14.5**
    - Test with various error scenarios
    - Verify specific error messages displayed (not generic)
    - Use fast-check with 100 iterations

  - [ ]* 12.30 Write property test for notification bell polling interval
    - **Property 30: Notification Bell Polling Interval**
    - **Validates: Requirements 15.1**
    - Test polling timing with timers
    - Verify at least 30 seconds between API calls
    - Use fast-check with 100 iterations

- [x] 13. Checkpoint - Verify All Tests Pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Deployment Preparation
  - [x] 14.1 Sync changes from khoj-2.0-main to root directory
    - Copy all modified files from khoj-2.0-main/src to src
    - Copy all modified files from khoj-2.0-main/server to server
    - Copy package.json changes if any
    - Verify all files synced correctly
    - _Requirements: Deployment to Vercel requires root directory_

  - [x] 14.2 Verify environment variables
    - Check .env.example files are up to date
    - Verify all required environment variables documented
    - Ensure no sensitive data in code
    - _Requirements: 15.5_

  - [x] 14.3 Run production build locally
    - Build frontend: npm run build
    - Test backend: npm start (in server directory)
    - Verify no build errors
    - Test critical flows in production build
    - _Requirements: 15.5_

- [x] 15. Backend Deployment to Render
  - [x] 15.1 Deploy backend to Render
    - Push changes to main branch
    - Verify Render auto-deploys from GitHub
    - Check deployment logs for errors
    - Verify all environment variables set in Render dashboard
    - _Requirements: Production deployment_

  - [x] 15.2 Verify backend deployment
    - Test all API endpoints in production
    - Verify database connection works
    - Test claims routes
    - Test notifications routes
    - Check server logs for errors
    - _Requirements: Production deployment_

- [x] 16. Frontend Deployment to Vercel
  - [x] 16.1 Deploy frontend to Vercel
    - Push changes to main branch
    - Verify Vercel auto-deploys from GitHub
    - Check deployment logs for errors
    - Verify all environment variables set in Vercel dashboard
    - _Requirements: Production deployment_

  - [x] 16.2 Verify frontend deployment
    - Test all pages load correctly
    - Test NotificationsPage
    - Test ClaimsManagementPage
    - Test NotificationBell polling
    - Test claim submission flow
    - Test reward display
    - Test contact system
    - _Requirements: Production deployment_

- [x] 17. Production Verification
  - [x] 17.1 Test complete end-to-end flows in production
    - Test claim submission → approval → notification flow
    - Test claim submission → rejection → notification flow
    - Test notification bell updates
    - Test reward display on lost items
    - Test contact system for lost items
    - Verify reputation points awarded correctly
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 17.2 Test mobile experience in production
    - Test on real mobile devices (iOS and Android)
    - Verify touch targets are appropriate size
    - Test claim modal on mobile
    - Test notifications page on mobile
    - Test claims management page on mobile
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 13.7_

  - [x] 17.3 Monitor production logs
    - Check for any errors in Render logs
    - Check for any errors in Vercel logs
    - Monitor API response times
    - Verify no performance issues
    - _Requirements: 15.4, 15.5, 15.6, 15.7_

- [x] 18. Final Checkpoint - Production Ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (all 30 properties)
- Unit tests validate specific examples and edge cases
- Backend routes (claims, notifications) already exist and need verification only
- Primary work is frontend integration and testing
- Deployment requires syncing from khoj-2.0-main to root directory for Vercel
- All property-based tests use fast-check library with 100 iterations minimum
