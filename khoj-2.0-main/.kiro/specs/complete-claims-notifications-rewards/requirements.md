# Requirements Document

## Introduction

This document specifies the requirements for implementing a complete claims, notifications, and reward system for the Khoj Lost & Found application. The system enables users to claim found items through a verification process, receive real-time notifications about claim activities, offer rewards for lost items, and earn reputation points for successful item returns. Additionally, the system includes fixes for the university campus structure to properly support multi-campus institutions.

## Glossary

- **Item_Owner**: The user who posted an item (either found or lost)
- **Claimer**: A user who submits a claim for a found item
- **Finder**: A user who successfully returns a found item to its rightful owner (approved claimer)
- **Claim_System**: The backend service that manages claim requests, approvals, and rejections
- **Notification_System**: The backend service that creates and manages user notifications
- **Reward_System**: The feature that allows lost item owners to offer incentives for item return
- **Reputation_System**: The point-based system that tracks user contributions
- **Campus_Selector**: The UI component that displays campus options for multi-campus universities
- **Notification_Bell**: The UI component in the navbar that displays unread notification count
- **Claims_Management_Page**: The page where item owners review and process pending claims
- **Notifications_Page**: The page where users view all their notifications
- **Contact_System**: The feature that enables direct contact for lost items
- **Verification_Questions**: The set of questions (where, when, specific details) used to verify ownership
- **University_Directory**: The data structure containing universities and their campuses

## Requirements

### Requirement 1: University Campus Structure

**User Story:** As a user from a multi-campus institution, I want to select my specific campus during signup and see campus-specific items, so that I can find relevant lost and found items from my campus.

#### Acceptance Criteria

1. THE University_Directory SHALL include Dayananda Sagar Institutions with four campuses: DSU, DSCE, DSATM, and DSIT
2. WHEN a user selects Dayananda Sagar Institutions during signup, THE Campus_Selector SHALL display all four campus options
3. THE Home_Page SHALL display campus names in properly formatted text alongside university names
4. WHEN an item is posted, THE System SHALL store both universityId and campusId as ObjectId references
5. WHEN displaying items, THE System SHALL show the cached universityName and campusName for rendering

### Requirement 2: Claims System for Found Items

**User Story:** As a user who lost an item, I want to claim found items by answering verification questions, so that I can prove ownership and retrieve my belongings.

#### Acceptance Criteria

1. WHEN a user views a found item detail, THE Item_Detail_Modal SHALL display a "Claim This Item" button
2. WHEN a user clicks the claim button, THE Claim_Modal SHALL open with three verification question fields: whereList, whenList, and specificDetails
3. THE Claim_Modal SHALL require all three verification fields to be filled before submission
4. WHEN a claim is submitted, THE Claim_System SHALL create a claim record with status "pending"
5. THE Claim_System SHALL prevent users from claiming their own items
6. THE Claim_System SHALL prevent duplicate pending claims from the same user for the same item
7. WHEN a claim is created, THE Notification_System SHALL create a "claim_request" notification for the Item_Owner
8. THE Claim_System SHALL store the claimerId, ownerId, itemId, and verification answers in the claim record

### Requirement 3: Claims Management for Item Owners

**User Story:** As an item owner who posted a found item, I want to review claim requests and approve or reject them, so that I can verify ownership and return items to their rightful owners.

#### Acceptance Criteria

1. THE Claims_Management_Page SHALL display all pending claims for items owned by the current user
2. FOR EACH pending claim, THE Claims_Management_Page SHALL display the claimer's verification answers (whereList, whenList, specificDetails)
3. FOR EACH pending claim, THE Claims_Management_Page SHALL display approve and reject action buttons
4. WHEN an owner approves a claim, THE Claim_System SHALL update the claim status to "approved"
5. WHEN a claim is approved, THE Claim_System SHALL update the item status to "resolved"
6. WHEN a claim is approved, THE Reputation_System SHALL award 10 reputation points to the Finder (claimer)
7. WHEN a claim is approved, THE Notification_System SHALL create a "claim_approved" notification for the Claimer
8. WHEN a claim is approved, THE Claims_Management_Page SHALL reveal the claimer's contact information (name, email, phone)
9. WHEN an owner rejects a claim, THE Claim_System SHALL update the claim status to "rejected"
10. WHEN a claim is rejected, THE Notification_System SHALL create a "claim_rejected" notification for the Claimer
11. THE Claim_System SHALL prevent processing of claims that are not in "pending" status

### Requirement 4: Contact System for Lost Items

**User Story:** As a user who found an item, I want to contact the owner of a lost item directly, so that I can arrange to return it without going through a verification process.

#### Acceptance Criteria

1. WHEN a user views a lost item detail, THE Item_Detail_Modal SHALL display a "Contact Owner" section
2. THE Contact_System SHALL display contact buttons based on the owner's contactPreference field (email, phone, or both)
3. WHEN contactPreference is "email" or "both", THE Contact_System SHALL display an email contact button
4. WHEN contactPreference is "phone" or "both", THE Contact_System SHALL display a phone contact button
5. WHEN a user clicks the email button, THE System SHALL open the user's default email client with a pre-filled subject line
6. WHEN a user clicks the phone button, THE System SHALL initiate a phone call using the tel: protocol
7. THE Contact_System SHALL NOT require claim verification for lost items

### Requirement 5: Reward System for Lost Items

**User Story:** As a user who lost an item, I want to offer a reward to incentivize people to help find it, so that I increase the chances of getting my item back.

#### Acceptance Criteria

1. WHEN posting a lost item, THE Post_Item_Form SHALL display a reward selection interface with six options: gratitude, food_treat, coffee, cash_reward, gift, and none
2. THE Reward_System SHALL store the selected reward value in the item's reward field
3. WHEN displaying a lost item on the home page, THE Item_Card SHALL display a premium-styled reward badge with an appropriate emoji icon
4. THE Reward_System SHALL use the following emoji mappings: gratitude (🙏), food_treat (🍕), coffee (☕), cash_reward (💵), gift (🎁)
5. WHEN displaying a lost item in the detail modal, THE Item_Detail_Modal SHALL display a prominent reward section with gradient styling
6. THE Reward_System SHALL display reward badges with amber/yellow gradient backgrounds and border styling
7. WHEN reward is "none", THE System SHALL NOT display any reward badge or section
8. THE Reward_System SHALL use premium visual styling including gradients, shadows, and rounded corners

### Requirement 6: Notifications System

**User Story:** As a user, I want to receive notifications about claim activities, so that I stay informed about the status of my items and claims.

#### Acceptance Criteria

1. THE Notification_System SHALL support four notification types: claim_request, claim_approved, claim_rejected, and item_resolved
2. WHEN a claim is submitted, THE Notification_System SHALL create a "claim_request" notification for the Item_Owner with message "Someone is trying to claim your item."
3. WHEN a claim is approved, THE Notification_System SHALL create a "claim_approved" notification for the Claimer with message "Your claim has been approved! You earned +10 reputation points."
4. WHEN a claim is rejected, THE Notification_System SHALL create a "claim_rejected" notification for the Claimer with message "Your claim has been rejected."
5. THE Notification_System SHALL store notifications with userId, type, itemId, claimId, message, and read status
6. THE Notification_System SHALL mark all new notifications with read status false by default
7. THE Notification_System SHALL provide an API endpoint to fetch unread notification count
8. THE Notification_System SHALL provide an API endpoint to mark individual notifications as read
9. THE Notification_System SHALL provide an API endpoint to mark all notifications as read
10. THE Notification_System SHALL sort notifications by creation date in descending order

### Requirement 7: Notification Bell UI

**User Story:** As a user, I want to see an unread notification count in the navbar, so that I know when I have new notifications without navigating away from my current page.

#### Acceptance Criteria

1. THE Notification_Bell SHALL display in the navbar for all authenticated users
2. THE Notification_Bell SHALL fetch the unread notification count from the API on component mount
3. WHEN there are unread notifications, THE Notification_Bell SHALL display a red badge with the count number
4. WHEN the unread count is zero, THE Notification_Bell SHALL NOT display a count badge
5. THE Notification_Bell SHALL refresh the unread count every 30 seconds while the user is active
6. WHEN a user clicks the Notification_Bell, THE System SHALL navigate to the Notifications_Page
7. THE Notification_Bell SHALL use a bell icon (Bell component from lucide-react)

### Requirement 8: Notifications Page

**User Story:** As a user, I want to view all my notifications in one place, so that I can review claim activities and take appropriate actions.

#### Acceptance Criteria

1. THE Notifications_Page SHALL display all notifications for the current user sorted by creation date
2. FOR EACH notification, THE Notifications_Page SHALL display the notification type, message, timestamp, and read status
3. FOR EACH notification, THE Notifications_Page SHALL display the associated item title and type when available
4. THE Notifications_Page SHALL visually distinguish unread notifications from read notifications using background color or styling
5. WHEN a user views a notification, THE Notifications_Page SHALL mark it as read automatically
6. THE Notifications_Page SHALL provide a "Mark All as Read" button
7. WHEN the "Mark All as Read" button is clicked, THE Notification_System SHALL update all unread notifications to read status
8. FOR claim_request notifications, THE Notifications_Page SHALL provide a link to the Claims_Management_Page
9. FOR claim_approved and claim_rejected notifications, THE Notifications_Page SHALL display the final status clearly
10. WHEN there are no notifications, THE Notifications_Page SHALL display an empty state message

### Requirement 9: Reputation Points System

**User Story:** As a user who helps return lost items, I want to earn reputation points, so that my contributions to the community are recognized.

#### Acceptance Criteria

1. THE Reputation_System SHALL award exactly 10 reputation points to the Finder when a claim is approved
2. THE Reputation_System SHALL NOT award reputation points to the Item_Owner
3. THE Reputation_System SHALL store reputation points in the User model's reputation field
4. THE Reputation_System SHALL increment reputation points atomically using MongoDB's $inc operator
5. THE Reputation_System SHALL display the user's total reputation points on their profile page
6. THE Reputation_System SHALL initialize new users with 0 reputation points
7. THE Reputation_System SHALL only award points for approved claims, not for rejected or pending claims

### Requirement 10: Claims API Integration

**User Story:** As a frontend developer, I want a complete API client for claims operations, so that I can integrate claims functionality into the UI seamlessly.

#### Acceptance Criteria

1. THE ClaimsAPI SHALL provide a create method that accepts itemId, whereList, whenList, and specificDetails
2. THE ClaimsAPI SHALL provide a getForItem method that fetches all claims for a specific item
3. THE ClaimsAPI SHALL provide a getMine method that fetches all claims made by the current user
4. THE ClaimsAPI SHALL provide an approve method that approves a claim by ID
5. THE ClaimsAPI SHALL provide a reject method that rejects a claim by ID
6. THE ClaimsAPI SHALL include authentication headers in all requests
7. THE ClaimsAPI SHALL handle API errors and return meaningful error messages
8. THE ClaimsAPI SHALL use the apiRequest utility for consistent error handling and token refresh

### Requirement 11: Notifications API Integration

**User Story:** As a frontend developer, I want a complete API client for notifications operations, so that I can integrate notifications functionality into the UI seamlessly.

#### Acceptance Criteria

1. THE NotificationsAPI SHALL provide a list method that fetches all notifications for the current user
2. THE NotificationsAPI SHALL provide a getUnreadCount method that returns the count of unread notifications
3. THE NotificationsAPI SHALL provide a markAsRead method that marks a specific notification as read
4. THE NotificationsAPI SHALL provide a markAllAsRead method that marks all notifications as read
5. THE NotificationsAPI SHALL include authentication headers in all requests
6. THE NotificationsAPI SHALL handle API errors and return meaningful error messages
7. THE NotificationsAPI SHALL use the apiRequest utility for consistent error handling and token refresh

### Requirement 12: End-to-End Claim Flow

**User Story:** As a system administrator, I want the complete claim flow to work seamlessly from submission to resolution, so that users can successfully reunite with their lost items.

#### Acceptance Criteria

1. WHEN a Claimer submits a claim for a found item, THE System SHALL create the claim, send a notification to the owner, and display a success message
2. WHEN an Item_Owner views their claims management page, THE System SHALL display all pending claims with verification details
3. WHEN an Item_Owner approves a claim, THE System SHALL update the claim status, mark the item as resolved, award reputation points, send a notification to the claimer, and reveal contact information
4. WHEN an Item_Owner rejects a claim, THE System SHALL update the claim status and send a notification to the claimer
5. WHEN a Claimer views their notifications, THE System SHALL display the approval or rejection notification with appropriate messaging
6. THE System SHALL maintain data consistency across all claim state transitions
7. THE System SHALL prevent race conditions when multiple claims are processed simultaneously for the same item

### Requirement 13: Mobile Responsiveness

**User Story:** As a mobile user, I want all claims, notifications, and rewards features to work seamlessly on my device, so that I can manage lost and found items on the go.

#### Acceptance Criteria

1. THE Claim_Modal SHALL be fully responsive and usable on mobile devices with screen widths down to 320px
2. THE Claims_Management_Page SHALL adapt its layout for mobile screens using responsive grid systems
3. THE Notifications_Page SHALL display notifications in a mobile-friendly card layout
4. THE Notification_Bell SHALL be appropriately sized for touch interactions on mobile devices
5. THE Reward_System badges SHALL scale appropriately for mobile screens
6. THE Contact_System buttons SHALL be large enough for touch interactions (minimum 44px touch target)
7. ALL text inputs in the Claim_Modal SHALL be easily accessible on mobile keyboards

### Requirement 14: Error Handling and Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN a claim submission fails, THE Claim_Modal SHALL display a user-friendly error message
2. WHEN verification fields are empty, THE Claim_Modal SHALL display field-specific validation errors
3. WHEN a user tries to claim their own item, THE System SHALL display the error message "You cannot claim your own item"
4. WHEN a user tries to submit a duplicate claim, THE System SHALL display the error message "You already have a pending claim for this item"
5. WHEN an API request fails, THE System SHALL display the error message from the server or a generic fallback message
6. WHEN a notification fails to load, THE Notifications_Page SHALL display an error state with retry option
7. WHEN the unread count fails to fetch, THE Notification_Bell SHALL gracefully hide the count badge
8. THE System SHALL log all errors to the console for debugging purposes

### Requirement 15: Performance and Optimization

**User Story:** As a user, I want the claims and notifications features to load quickly, so that I can efficiently manage my items and claims.

#### Acceptance Criteria

1. THE Notification_Bell SHALL cache the unread count for 30 seconds to reduce API calls
2. THE Notifications_Page SHALL limit the initial notification fetch to 50 most recent notifications
3. THE Claims_Management_Page SHALL use pagination when displaying more than 20 claims
4. THE System SHALL use MongoDB indexes on userId, itemId, claimId, and status fields for fast queries
5. THE System SHALL use compound indexes for common query patterns (userId + read status, itemId + status)
6. THE Claim_System SHALL populate user and item data in a single query to avoid N+1 problems
7. THE Notification_System SHALL use lean queries when full Mongoose documents are not needed
