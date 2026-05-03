# Requirements Document: Gamification System

## Introduction

The Gamification System is a comprehensive engagement and retention feature for FoodBridge that rewards users for their participation in the food redistribution ecosystem. The system aims to increase user engagement, encourage consistent participation, build community through friendly competition, and drive viral growth through referrals. By implementing karma points, badges, streaks, leaderboards, milestones, and referrals, the platform will transform food donation from a transactional activity into a rewarding and social experience.

## Glossary

- **Gamification_System**: The complete system managing karma points, badges, streaks, leaderboards, milestones, and referrals
- **Karma_Engine**: The service responsible for calculating and awarding karma points
- **Badge_Engine**: The service responsible for checking badge criteria and awarding badges
- **Streak_Tracker**: The service responsible for tracking consecutive days of user activity
- **Leaderboard_Service**: The service responsible for calculating and displaying user rankings
- **Milestone_Service**: The service responsible for detecting and celebrating user milestones
- **Referral_Service**: The service responsible for managing referral codes and rewards
- **User**: Any authenticated user on the FoodBridge platform (donor, receiver, or volunteer)
- **Karma_Points**: Numerical points awarded for various platform actions
- **Badge**: A digital achievement award given when specific criteria are met
- **Streak**: A count of consecutive days a user has been active on the platform
- **Leaderboard**: A ranked list of users based on karma points or other metrics
- **Milestone**: A significant achievement threshold (e.g., 100th donation)
- **Referral_Code**: A unique code assigned to each user for inviting others
- **Action**: Any user activity that can earn karma points (donation, claim, delivery, rating)
- **Tier**: A badge difficulty level (beginner, intermediate, advanced, special)
- **Grace_Period**: A time window allowing streak recovery after a missed day

## Requirements

### Requirement 1: Karma Points System

**User Story:** As a user, I want to earn karma points for my actions on the platform, so that I feel rewarded for my contributions to the community.

#### Acceptance Criteria

1. WHEN a user completes a donation, THE Karma_Engine SHALL award karma points based on the action type
2. WHEN a user completes a claim, THE Karma_Engine SHALL award karma points based on the action type
3. WHEN a user completes a delivery as a volunteer, THE Karma_Engine SHALL award karma points based on the action type
4. WHEN a user submits a rating, THE Karma_Engine SHALL award karma points based on the action type
5. THE Karma_Engine SHALL record each karma transaction with user_id, points, reason, and timestamp
6. THE Karma_Engine SHALL calculate the total karma points for a user by summing all karma transactions
7. WHEN a user views their profile, THE Gamification_System SHALL display their total karma points
8. THE Karma_Engine SHALL support different point values for different action types
9. THE Karma_Engine SHALL support bonus multipliers for urgent listings (high urgency actions earn more points)
10. WHEN a karma transaction is created, THE Karma_Engine SHALL link it to the related listing or claim if applicable

### Requirement 2: Karma Point Values Configuration

**User Story:** As a platform administrator, I want to configure karma point values for different actions, so that I can balance the reward system appropriately.

#### Acceptance Criteria

1. THE Karma_Engine SHALL award 10 points for creating a food listing
2. THE Karma_Engine SHALL award 20 points for completing a donation
3. THE Karma_Engine SHALL award 15 points for claiming food
4. THE Karma_Engine SHALL award 15 points for receiving food
5. THE Karma_Engine SHALL award 25 points for completing a volunteer delivery
6. THE Karma_Engine SHALL award 5 points for submitting a rating
7. THE Karma_Engine SHALL award 30 points for completing an urgent listing (pickup_by within 30 minutes)
8. THE Karma_Engine SHALL award 50 points for completing a first-time action (first donation, first claim, first delivery)
9. THE Karma_Engine SHALL award 100 points for referring a new user who completes their first action
10. THE Karma_Engine SHALL award 20 points for maintaining a 7-day streak

### Requirement 3: Badge Achievement Engine

**User Story:** As a user, I want to earn badges for reaching milestones, so that I can showcase my achievements and feel recognized for my contributions.

#### Acceptance Criteria

1. THE Badge_Engine SHALL check badge criteria after each user action
2. WHEN a user meets badge criteria, THE Badge_Engine SHALL award the badge to the user
3. WHEN a badge is awarded, THE Badge_Engine SHALL record the user_id, badge_id, and earned_at timestamp
4. THE Badge_Engine SHALL prevent duplicate badge awards for the same user and badge
5. WHEN a user views their profile, THE Gamification_System SHALL display all earned badges
6. THE Badge_Engine SHALL support criteria based on action counts (e.g., 10 donations)
7. THE Badge_Engine SHALL support criteria based on consecutive days (e.g., 7-day streak)
8. THE Badge_Engine SHALL support criteria based on ratings (e.g., maintain 4.8+ rating for 3 months)
9. THE Badge_Engine SHALL support criteria based on time-based patterns (e.g., 10 weekend deliveries)
10. WHEN a badge is awarded, THE Gamification_System SHALL send a notification to the user

### Requirement 4: Badge Definitions

**User Story:** As a platform administrator, I want to define badges with specific criteria, so that users have clear goals to work towards.

#### Acceptance Criteria

1. THE Gamification_System SHALL define a "First Meal" badge awarded after completing the first donation or claim
2. THE Gamification_System SHALL define a "Consistent Giver" badge awarded after completing 10 donations
3. THE Gamification_System SHALL define a "Community Pillar" badge awarded after completing 50 donations
4. THE Gamification_System SHALL define a "Food Hero" badge awarded after completing 200 donations
5. THE Gamification_System SHALL define a "Zero Waste Week" badge awarded after donating every day for 7 consecutive days
6. THE Gamification_System SHALL define a "Quick Responder" badge awarded after accepting 5 claims within 2 minutes
7. THE Gamification_System SHALL define a "Weekend Warrior" badge awarded after completing 10 volunteer deliveries on weekends
8. THE Gamification_System SHALL define a "Trusted Neighbour" badge awarded after maintaining a 4.8+ rating for 3 months with at least 20 ratings
9. THE Gamification_System SHALL define a "Community Builder" badge awarded after referring 5 users who each complete at least one action
10. THE Gamification_System SHALL categorize badges into tiers (beginner, intermediate, advanced, special)

### Requirement 5: Streak Tracking

**User Story:** As a user, I want to track my consecutive days of activity, so that I am motivated to stay engaged with the platform daily.

#### Acceptance Criteria

1. WHEN a user completes any action (donation, claim, delivery), THE Streak_Tracker SHALL update the user's last_active_date
2. WHEN a user completes an action on a new day, THE Streak_Tracker SHALL increment the current_streak by 1
3. WHEN a user completes an action after missing one day, THE Streak_Tracker SHALL check for grace period eligibility
4. IF a user completes an action within 36 hours of their last activity, THEN THE Streak_Tracker SHALL maintain the current_streak
5. IF a user completes an action after more than 36 hours of inactivity, THEN THE Streak_Tracker SHALL reset the current_streak to 1
6. WHEN the current_streak exceeds the longest_streak, THE Streak_Tracker SHALL update the longest_streak
7. WHEN a user views their profile, THE Gamification_System SHALL display the current_streak and longest_streak
8. WHEN a user reaches a 7-day streak, THE Streak_Tracker SHALL award bonus karma points
9. WHEN a user reaches a 30-day streak, THE Streak_Tracker SHALL award bonus karma points and send a celebration notification
10. WHEN a user is at risk of losing their streak (23 hours since last activity), THE Gamification_System SHALL send a reminder notification

### Requirement 6: Leaderboards

**User Story:** As a user, I want to see how I rank compared to other users, so that I feel motivated by friendly competition.

#### Acceptance Criteria

1. THE Leaderboard_Service SHALL calculate city-level leaderboards based on user location
2. THE Leaderboard_Service SHALL calculate global leaderboards across all users
3. THE Leaderboard_Service SHALL support weekly leaderboards showing karma points earned in the last 7 days
4. THE Leaderboard_Service SHALL support monthly leaderboards showing karma points earned in the last 30 days
5. THE Leaderboard_Service SHALL support all-time leaderboards showing total karma points
6. THE Leaderboard_Service SHALL create separate leaderboards for donors, receivers, and volunteers
7. THE Leaderboard_Service SHALL display the top 100 users for each leaderboard
8. WHEN a user views a leaderboard, THE Leaderboard_Service SHALL show the user's current rank even if outside the top 100
9. THE Leaderboard_Service SHALL cache leaderboard data with a 5-minute TTL for performance
10. THE Leaderboard_Service SHALL allow users to opt out of leaderboards through privacy settings

### Requirement 7: Leaderboard Privacy Controls

**User Story:** As a user, I want to control my visibility on leaderboards, so that I can maintain my privacy if desired.

#### Acceptance Criteria

1. THE Gamification_System SHALL provide a privacy setting for leaderboard visibility in user preferences
2. WHEN a user opts out of leaderboards, THE Leaderboard_Service SHALL exclude the user from all public leaderboards
3. WHEN a user opts out of leaderboards, THE Gamification_System SHALL still display the user's personal rank privately
4. THE Gamification_System SHALL default leaderboard visibility to enabled for new users
5. WHEN a user changes leaderboard visibility settings, THE Leaderboard_Service SHALL update leaderboards within 5 minutes

### Requirement 8: Milestone Celebrations

**User Story:** As a user, I want to celebrate significant achievements, so that I feel recognized for reaching important milestones.

#### Acceptance Criteria

1. WHEN a user completes their 10th donation, THE Milestone_Service SHALL trigger a celebration
2. WHEN a user completes their 50th donation, THE Milestone_Service SHALL trigger a celebration
3. WHEN a user completes their 100th donation, THE Milestone_Service SHALL trigger a celebration
4. WHEN a user reaches their 1-year anniversary on the platform, THE Milestone_Service SHALL trigger a celebration
5. WHEN a user saves 1000 kg of food, THE Milestone_Service SHALL trigger a celebration
6. WHEN a milestone is reached, THE Milestone_Service SHALL send a push notification with celebration message
7. WHEN a milestone is reached, THE Milestone_Service SHALL display a visual celebration in the app (confetti animation)
8. WHEN a milestone is reached, THE Milestone_Service SHALL award bonus karma points (50-200 points based on milestone significance)
9. THE Milestone_Service SHALL generate a shareable achievement card with milestone details and user stats
10. WHEN a user views a milestone achievement card, THE Gamification_System SHALL provide options to share on social media platforms

### Requirement 9: Social Sharing

**User Story:** As a user, I want to share my achievements on social media, so that I can inspire others and promote the platform.

#### Acceptance Criteria

1. WHEN a user earns a badge, THE Gamification_System SHALL provide a share button
2. WHEN a user reaches a milestone, THE Gamification_System SHALL provide a share button
3. WHEN a user clicks share, THE Gamification_System SHALL generate a shareable image with achievement details
4. THE Gamification_System SHALL support sharing to Facebook, Twitter, Instagram, and WhatsApp
5. THE Gamification_System SHALL include the user's referral code in shared content
6. THE Gamification_System SHALL include a call-to-action link to download the FoodBridge app
7. THE Gamification_System SHALL track social shares as a metric
8. WHEN a user shares an achievement, THE Karma_Engine SHALL award 10 bonus karma points
9. THE Gamification_System SHALL generate Open Graph meta tags for rich social media previews
10. THE Gamification_System SHALL respect user privacy settings when generating shareable content

### Requirement 10: Referral Program

**User Story:** As a user, I want to invite friends to join FoodBridge, so that I can grow the community and earn rewards.

#### Acceptance Criteria

1. WHEN a user account is created, THE Referral_Service SHALL generate a unique referral code
2. THE Referral_Service SHALL ensure referral codes are unique across all users
3. THE Referral_Service SHALL format referral codes as 6-8 alphanumeric characters (e.g., "FB-A3X9K2")
4. WHEN a user views their profile, THE Gamification_System SHALL display their referral code
5. THE Gamification_System SHALL provide a share button to send the referral code via SMS, email, or social media
6. WHEN a new user signs up with a referral code, THE Referral_Service SHALL link the new user to the referrer
7. WHEN a referred user completes their first action (donation, claim, or delivery), THE Referral_Service SHALL award 100 karma points to the referrer
8. WHEN a referred user completes their first action, THE Referral_Service SHALL award 50 karma points to the referee
9. THE Referral_Service SHALL track the total number of successful referrals per user
10. THE Referral_Service SHALL display a referral leaderboard showing top referrers

### Requirement 11: Referral Tracking and Validation

**User Story:** As a platform administrator, I want to track and validate referrals, so that I can prevent abuse and ensure fair rewards.

#### Acceptance Criteria

1. THE Referral_Service SHALL record the referral relationship with referrer_id, referee_id, and referral_date
2. THE Referral_Service SHALL validate that a user cannot refer themselves
3. THE Referral_Service SHALL validate that a user cannot use multiple referral codes
4. THE Referral_Service SHALL validate that a phone number can only be referred once
5. THE Referral_Service SHALL mark a referral as successful only after the referee completes their first action
6. THE Referral_Service SHALL track referral conversion rate (signups vs completed first action)
7. THE Referral_Service SHALL detect suspicious referral patterns (e.g., multiple referrals from same IP within short time)
8. WHEN suspicious activity is detected, THE Referral_Service SHALL flag the referrals for admin review
9. THE Referral_Service SHALL support admin actions to approve or reject flagged referrals
10. WHEN a referral is rejected, THE Referral_Service SHALL revoke any awarded karma points

### Requirement 12: Gamification API Endpoints

**User Story:** As a mobile app developer, I want to access gamification data through API endpoints, so that I can display achievements and progress in the app.

#### Acceptance Criteria

1. THE Gamification_System SHALL provide a GET endpoint to retrieve user karma points and transactions
2. THE Gamification_System SHALL provide a GET endpoint to retrieve user badges
3. THE Gamification_System SHALL provide a GET endpoint to retrieve user streak information
4. THE Gamification_System SHALL provide a GET endpoint to retrieve leaderboards with filters (city, global, timeframe, role)
5. THE Gamification_System SHALL provide a GET endpoint to retrieve user milestones
6. THE Gamification_System SHALL provide a GET endpoint to retrieve user referral code and referral stats
7. THE Gamification_System SHALL provide a POST endpoint to validate and apply a referral code during signup
8. THE Gamification_System SHALL provide a PUT endpoint to update leaderboard privacy settings
9. THE Gamification_System SHALL provide a GET endpoint to retrieve available badges with criteria and progress
10. THE Gamification_System SHALL require authentication for all gamification endpoints

### Requirement 13: Performance and Scalability

**User Story:** As a platform administrator, I want the gamification system to perform efficiently at scale, so that it does not impact overall platform performance.

#### Acceptance Criteria

1. THE Karma_Engine SHALL process karma transactions asynchronously to avoid blocking user actions
2. THE Badge_Engine SHALL check badge criteria asynchronously after user actions complete
3. THE Leaderboard_Service SHALL cache leaderboard data in Redis with a 5-minute TTL
4. THE Streak_Tracker SHALL update streak data in a single database transaction to prevent race conditions
5. THE Gamification_System SHALL use database indexes on user_id, created_at, and badge_id for query performance
6. THE Gamification_System SHALL batch process milestone checks for efficiency
7. THE Leaderboard_Service SHALL use materialized views or aggregated tables for leaderboard calculations
8. THE Gamification_System SHALL limit API responses to 100 items per page with pagination support
9. THE Gamification_System SHALL complete karma point calculations within 500 milliseconds
10. THE Gamification_System SHALL complete badge checks within 1 second

### Requirement 14: Notification Integration

**User Story:** As a user, I want to receive notifications about my gamification achievements, so that I am aware of my progress and rewards.

#### Acceptance Criteria

1. WHEN a badge is awarded, THE Gamification_System SHALL send a push notification with badge name and description
2. WHEN a milestone is reached, THE Gamification_System SHALL send a push notification with celebration message
3. WHEN a user reaches a 7-day streak, THE Gamification_System SHALL send a congratulatory notification
4. WHEN a user is at risk of losing their streak, THE Gamification_System SHALL send a reminder notification
5. WHEN a user moves up in leaderboard rankings significantly (e.g., enters top 10), THE Gamification_System SHALL send a notification
6. WHEN a referred user completes their first action, THE Gamification_System SHALL send a notification to the referrer
7. THE Gamification_System SHALL respect user notification preferences for gamification notifications
8. THE Gamification_System SHALL respect quiet hours settings when sending gamification notifications
9. THE Gamification_System SHALL include deep links in notifications to relevant gamification screens
10. THE Gamification_System SHALL batch multiple gamification notifications to avoid notification spam

### Requirement 15: Analytics and Reporting

**User Story:** As a platform administrator, I want to track gamification metrics, so that I can measure engagement and optimize the reward system.

#### Acceptance Criteria

1. THE Gamification_System SHALL track total karma points awarded per day
2. THE Gamification_System SHALL track badge awards per badge type per day
3. THE Gamification_System SHALL track average user streak length
4. THE Gamification_System SHALL track referral conversion rate
5. THE Gamification_System SHALL track leaderboard engagement (views, opt-out rate)
6. THE Gamification_System SHALL track milestone celebration engagement (views, shares)
7. THE Gamification_System SHALL track social sharing rate for achievements
8. THE Gamification_System SHALL provide an admin dashboard with gamification metrics
9. THE Gamification_System SHALL calculate correlation between gamification engagement and user retention
10. THE Gamification_System SHALL generate weekly reports on gamification system performance

