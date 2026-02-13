import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Share2,
  FileText,
  Zap,
  AlertCircle,
  MessageCircle,
  Lightbulb,
  Target,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  Keyboard,
  Calendar,
  Mail,
  Shield,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  X,
  Home,
  ClipboardList,
  PieChart,
  Globe,
  Bell
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useUIStore } from '../../store';
import { cn } from '../../lib/utils';

// Help Categories
const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics and set up your first survey',
    color: 'teal',
    articles: [
      { id: 'welcome', title: 'Welcome to Survey360', readTime: '2 min', popular: true },
      { id: 'create-first-survey', title: 'Creating Your First Survey', readTime: '5 min', popular: true },
      { id: 'dashboard-overview', title: 'Dashboard Overview', readTime: '3 min' },
      { id: 'account-setup', title: 'Setting Up Your Account', readTime: '4 min' },
      { id: 'invite-team', title: 'Inviting Team Members', readTime: '3 min' },
    ]
  },
  {
    id: 'surveys',
    title: 'Surveys',
    icon: ClipboardList,
    description: 'Create, customize, and manage your surveys',
    color: 'blue',
    articles: [
      { id: 'survey-builder', title: 'Using the Survey Builder', readTime: '6 min', popular: true },
      { id: 'question-types', title: 'Question Types Explained', readTime: '8 min', popular: true },
      { id: 'survey-logic', title: 'Adding Survey Logic & Branching', readTime: '5 min' },
      { id: 'survey-templates', title: 'Using Survey Templates', readTime: '3 min' },
      { id: 'survey-settings', title: 'Survey Settings & Options', readTime: '4 min' },
      { id: 'publishing-survey', title: 'Publishing Your Survey', readTime: '2 min' },
      { id: 'survey-scheduling', title: 'Scheduling Surveys', readTime: '4 min' },
    ]
  },
  {
    id: 'sharing',
    title: 'Sharing & Distribution',
    icon: Share2,
    description: 'Share surveys and collect responses',
    color: 'purple',
    articles: [
      { id: 'share-link', title: 'Sharing via Link', readTime: '2 min', popular: true },
      { id: 'qr-codes', title: 'Using QR Codes', readTime: '3 min' },
      { id: 'email-invitations', title: 'Sending Email Invitations', readTime: '4 min' },
      { id: 'embed-website', title: 'Embedding on Your Website', readTime: '5 min' },
      { id: 'link-shortener', title: 'Using the Link Shortener', readTime: '2 min' },
    ]
  },
  {
    id: 'responses',
    title: 'Responses',
    icon: FileText,
    description: 'View and manage survey responses',
    color: 'green',
    articles: [
      { id: 'viewing-responses', title: 'Viewing Responses', readTime: '3 min' },
      { id: 'filtering-responses', title: 'Filtering & Searching Responses', readTime: '4 min' },
      { id: 'export-responses', title: 'Exporting Responses to Excel', readTime: '3 min', popular: true },
      { id: 'response-notifications', title: 'Response Notifications', readTime: '2 min' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart3,
    description: 'Analyze data and generate reports',
    color: 'orange',
    articles: [
      { id: 'analytics-overview', title: 'Analytics Dashboard Overview', readTime: '4 min', popular: true },
      { id: 'response-charts', title: 'Understanding Response Charts', readTime: '5 min' },
      { id: 'completion-rates', title: 'Tracking Completion Rates', readTime: '3 min' },
      { id: 'export-reports', title: 'Exporting Analytics Reports', readTime: '3 min' },
      { id: 'trends-analysis', title: 'Response Trends Analysis', readTime: '4 min' },
    ]
  },
  {
    id: 'team',
    title: 'Team & Collaboration',
    icon: Users,
    description: 'Manage your team and permissions',
    color: 'pink',
    articles: [
      { id: 'team-management', title: 'Managing Team Members', readTime: '4 min' },
      { id: 'roles-permissions', title: 'Roles & Permissions', readTime: '5 min' },
      { id: 'organization-settings', title: 'Organization Settings', readTime: '3 min' },
    ]
  },
  {
    id: 'settings',
    title: 'Account & Settings',
    icon: Settings,
    description: 'Configure your account preferences',
    color: 'gray',
    articles: [
      { id: 'profile-settings', title: 'Profile Settings', readTime: '2 min' },
      { id: 'notification-preferences', title: 'Notification Preferences', readTime: '3 min' },
      { id: 'language-settings', title: 'Language & Region Settings', readTime: '2 min' },
      { id: 'theme-settings', title: 'Theme & Appearance', readTime: '2 min' },
      { id: 'security-settings', title: 'Security Settings', readTime: '4 min' },
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    icon: CreditCard,
    description: 'Manage subscriptions and payments',
    color: 'yellow',
    articles: [
      { id: 'pricing-plans', title: 'Understanding Pricing Plans', readTime: '4 min' },
      { id: 'upgrade-plan', title: 'Upgrading Your Plan', readTime: '3 min' },
      { id: 'billing-history', title: 'Viewing Billing History', readTime: '2 min' },
      { id: 'payment-methods', title: 'Managing Payment Methods', readTime: '3 min' },
    ]
  },
];

// FAQ Data
const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Survey360?',
        a: 'Survey360 is a comprehensive survey management platform that helps you create, distribute, and analyze surveys. It offers features like drag-and-drop survey builder, multiple question types, real-time analytics, team collaboration, and more.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! Survey360 offers a free tier that includes up to 3 surveys and 100 responses per month. You can upgrade anytime to access more features and higher limits.'
      },
      {
        q: 'How many surveys can I create?',
        a: 'The number of surveys depends on your plan. Free users can create up to 3 surveys, while paid plans offer unlimited surveys.'
      },
    ]
  },
  {
    category: 'Surveys',
    questions: [
      {
        q: 'How do I create a survey?',
        a: 'Click "New Survey" from the dashboard or surveys page. You can start from scratch or use a template. Add questions using the drag-and-drop builder, configure settings, and publish when ready.'
      },
      {
        q: 'Can I add logic/branching to my surveys?',
        a: 'Yes! Survey360 supports conditional logic. You can show/hide questions based on previous answers, skip pages, or end the survey early based on responses.'
      },
      {
        q: 'How do I share my survey?',
        a: 'After publishing, click the Share button to get your survey link. You can also generate QR codes, send email invitations, or embed the survey on your website.'
      },
      {
        q: 'Can respondents save and continue later?',
        a: 'Yes, this feature is available on Pro and Enterprise plans. Respondents can save their progress and return later to complete the survey.'
      },
    ]
  },
  {
    category: 'Responses & Analytics',
    questions: [
      {
        q: 'How do I export my responses?',
        a: 'Go to your survey\'s Responses tab and click "Export Excel". This downloads all responses as an Excel spreadsheet with formatted headers and data.'
      },
      {
        q: 'Can I get notified of new responses?',
        a: 'Yes! Enable response notifications in your survey settings. You\'ll receive email alerts whenever someone completes your survey.'
      },
      {
        q: 'How is the completion rate calculated?',
        a: 'Completion rate = (Completed responses / Total started responses) × 100. A response is considered complete when the respondent submits the final page.'
      },
    ]
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Settings > Billing and click "Upgrade Plan". Choose your desired plan and complete the payment process. Your new features will be available immediately.'
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel anytime from Settings > Billing. Your access continues until the end of your billing period, then reverts to the free tier.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Enterprise plans.'
      },
    ]
  },
];

// Troubleshooting Data
const TROUBLESHOOTING_DATA = [
  {
    id: 'survey-not-loading',
    title: 'Survey not loading for respondents',
    symptoms: ['Blank page', 'Loading forever', 'Error message'],
    solutions: [
      'Check if the survey is published (status should be "Published")',
      'Verify the survey link is correct and not expired',
      'Ensure the survey hasn\'t reached its response limit',
      'Check if the survey is scheduled and within the active period',
      'Try opening the link in an incognito/private browser window',
    ]
  },
  {
    id: 'responses-not-showing',
    title: 'Responses not appearing in dashboard',
    symptoms: ['Response count is 0', 'Missing responses', 'Delayed updates'],
    solutions: [
      'Refresh the page or click the refresh button',
      'Check if you\'re viewing the correct survey',
      'Verify the date filter isn\'t excluding recent responses',
      'Wait a few minutes - there may be a slight delay',
      'Check if responses are being filtered by status',
    ]
  },
  {
    id: 'export-issues',
    title: 'Export not working',
    symptoms: ['Download fails', 'Empty file', 'Corrupted file'],
    solutions: [
      'Ensure you have responses to export (cannot export empty surveys)',
      'Check your internet connection',
      'Try a different browser',
      'Clear browser cache and try again',
      'If the file is large, wait for the download to complete fully',
    ]
  },
  {
    id: 'email-not-sending',
    title: 'Email invitations not being delivered',
    symptoms: ['Emails not received', 'Bounced emails', 'Spam folder'],
    solutions: [
      'Check if email addresses are correctly formatted',
      'Ask recipients to check their spam/junk folder',
      'Verify your sending quota hasn\'t been exceeded',
      'Ensure recipient email servers aren\'t blocking our domain',
      'Try resending after a few minutes',
    ]
  },
  {
    id: 'login-issues',
    title: 'Cannot log in to account',
    symptoms: ['Invalid password', 'Account locked', 'Email not found'],
    solutions: [
      'Double-check your email address for typos',
      'Use the "Forgot Password" link to reset your password',
      'Clear browser cookies and cache',
      'Try a different browser or device',
      'Contact support if your account may be locked',
    ]
  },
];

// Keyboard Shortcuts
const KEYBOARD_SHORTCUTS = [
  { category: 'Navigation', shortcuts: [
    { keys: ['Ctrl', 'K'], action: 'Open search' },
    { keys: ['Ctrl', 'D'], action: 'Go to Dashboard' },
    { keys: ['Ctrl', 'S'], action: 'Go to Surveys' },
    { keys: ['Ctrl', 'R'], action: 'Go to Responses' },
    { keys: ['Esc'], action: 'Close modal/dialog' },
  ]},
  { category: 'Survey Builder', shortcuts: [
    { keys: ['Ctrl', 'N'], action: 'New survey' },
    { keys: ['Ctrl', 'S'], action: 'Save survey' },
    { keys: ['Ctrl', 'P'], action: 'Preview survey' },
    { keys: ['Ctrl', 'Enter'], action: 'Publish survey' },
    { keys: ['Ctrl', 'Z'], action: 'Undo' },
    { keys: ['Ctrl', 'Y'], action: 'Redo' },
  ]},
  { category: 'General', shortcuts: [
    { keys: ['Ctrl', '/'], action: 'Show keyboard shortcuts' },
    { keys: ['Ctrl', 'L'], action: 'Toggle light/dark mode' },
    { keys: ['?'], action: 'Open help center' },
  ]},
];

// What's New Data
const WHATS_NEW = [
  {
    version: '2.5.0',
    date: 'February 2026',
    highlights: [
      { type: 'feature', title: 'Multi-language Support', description: 'Survey360 now supports 6 languages including Arabic RTL' },
      { type: 'feature', title: 'Advanced Scheduling', description: 'Schedule recurring surveys with timezone support' },
      { type: 'feature', title: 'Email Invitations', description: 'Send beautiful email invitations with Resend integration' },
      { type: 'improvement', title: 'Excel Export', description: 'Enhanced Excel exports with formatted headers and styling' },
    ]
  },
  {
    version: '2.4.0',
    date: 'January 2026',
    highlights: [
      { type: 'feature', title: 'Link Shortener', description: 'Shorten survey links for easy sharing via SMS' },
      { type: 'feature', title: 'Interactive Demo', description: 'Try Survey360 without signing up' },
      { type: 'improvement', title: 'Analytics Charts', description: 'New interactive charts with hover tooltips' },
    ]
  },
  {
    version: '2.3.0',
    date: 'December 2025',
    highlights: [
      { type: 'feature', title: 'QR Code Generation', description: 'Generate and download QR codes for surveys' },
      { type: 'feature', title: 'Embed Code', description: 'Embed surveys directly on your website' },
      { type: 'improvement', title: 'Response Table', description: 'Better response viewing with sorting and filtering' },
    ]
  },
];

// Article Content - Comprehensive documentation for all articles
const ARTICLE_CONTENT = {
  'welcome': {
    title: 'Welcome to Survey360',
    content: `Survey360 is your complete survey lifecycle management platform. Whether you're collecting customer feedback, conducting research, or gathering team insights, we've got you covered.

## What You Can Do

### Create Beautiful Surveys
Use our intuitive drag-and-drop builder to create professional surveys in minutes. Choose from multiple question types including:
- Multiple choice & single select
- Rating scales & star ratings
- Open-ended text responses
- Date & number inputs
- And more!

### Share Everywhere
Distribute your surveys through:
- **Direct links** - Share via email, social media, or messaging apps
- **QR codes** - Perfect for print materials and in-person events
- **Email invitations** - Send personalized invitations with tracking
- **Website embed** - Add surveys directly to your site

### Analyze Results
Get real-time insights with our analytics dashboard:
- Response trends over time
- Completion rate tracking
- Satisfaction breakdowns
- Export to Excel for further analysis

## Quick Start Guide

1. **Create a survey** - Click "New Survey" on your dashboard
2. **Add questions** - Use the builder to add and customize questions
3. **Publish** - Click "Publish" when you're ready
4. **Share** - Get your link and start collecting responses
5. **Analyze** - View responses and analytics in real-time

## Need Help?

- Browse our help articles by category
- Use the search to find specific topics
- Check the FAQ for common questions
- Contact support if you need assistance
    `,
  },
  'dashboard-overview': {
    title: 'Dashboard Overview',
    content: `The Dashboard is your command center for managing all survey activities. Here's what you'll find:

## Main Dashboard Elements

### Statistics Cards
At the top, you'll see key metrics:
- **Total Surveys** - Number of surveys you've created
- **Total Responses** - Combined responses across all surveys
- **Active Surveys** - Currently published surveys
- **Response Rate** - Average completion percentage

### Response Trends Chart
A visual graph showing response activity over the last 14 days. Hover over data points to see exact counts for each day.

### Quick Actions Panel
Fast access to common tasks:
- Create New Survey
- View All Surveys
- View Responses

### Recent Activity Feed
Shows the latest responses and survey activities, including:
- New response submissions
- Survey status changes
- Team member actions

## Navigation Tips

- Use the sidebar to navigate between sections
- The search bar helps you find specific surveys quickly
- Toggle between light and dark mode using the theme button
- Access help anytime via the question mark icon
    `,
  },
  'account-setup': {
    title: 'Setting Up Your Account',
    content: `Get your Survey360 account configured for the best experience.

## Profile Settings

### Update Your Information
1. Click your avatar in the bottom-left corner
2. Select "Settings"
3. Update your name, email, and profile picture

### Change Password
1. Go to Settings > Security
2. Enter your current password
3. Enter and confirm your new password
4. Click "Update Password"

## Organization Setup

### Create an Organization
Organizations help you manage team surveys:
1. Go to Settings > Organization
2. Click "Create Organization"
3. Enter organization name and details
4. Invite team members

### Invite Team Members
1. Navigate to your organization settings
2. Click "Invite Member"
3. Enter their email address
4. Select their role (Admin, Editor, or Viewer)
5. They'll receive an email invitation

## Notification Preferences

Control what notifications you receive:
- **Email notifications** - New responses, survey completion
- **Browser notifications** - Real-time updates
- **Weekly digest** - Summary of survey activity

Go to Settings > Notifications to customize your preferences.
    `,
  },
  'invite-team': {
    title: 'Inviting Team Members',
    content: `Collaborate with your team on Survey360 by inviting members to your organization.

## How to Invite Members

1. Go to **Settings** from the sidebar
2. Click on **Team** or **Organization**
3. Click **"Invite Member"** button
4. Enter their email address
5. Select their role
6. Click **Send Invitation**

## Understanding Roles

### Admin
- Full access to all features
- Can manage team members
- Can delete surveys and responses
- Access to billing settings

### Editor
- Create and edit surveys
- View all responses
- Export data
- Cannot manage team or billing

### Viewer
- View surveys and responses only
- Cannot create or edit surveys
- Can export their own reports

## Managing Team Members

### Change Roles
1. Go to Team settings
2. Find the member
3. Click the role dropdown
4. Select the new role

### Remove Members
1. Go to Team settings
2. Find the member
3. Click the remove button
4. Confirm removal

## Best Practices

- Invite team members before starting projects
- Use appropriate roles for security
- Regularly review team access
- Remove inactive members promptly
    `,
  },
  'create-first-survey': {
    title: 'Creating Your First Survey',
    content: `
# Creating Your First Survey

Follow this step-by-step guide to create and publish your first survey.

## Step 1: Start a New Survey

From your dashboard, click the **"New Survey"** button. You have two options:
- **Start from scratch** - Build your survey from the ground up
- **Use a template** - Choose from our library of pre-built templates

## Step 2: Name Your Survey

Give your survey a clear, descriptive name. This helps you organize your surveys and gives respondents context.

**Tips for naming:**
- Be specific (e.g., "Q1 2026 Customer Satisfaction" vs just "Survey")
- Include the purpose or audience
- Add dates if it's recurring

## Step 3: Add Questions

Click **"Add Question"** to start building. Choose from question types:

| Type | Best For |
|------|----------|
| Short Text | Names, brief answers |
| Long Text | Detailed feedback, comments |
| Single Choice | One answer from options |
| Multiple Choice | Select multiple options |
| Rating | 1-5 star ratings |
| Number | Quantities, ages |
| Email | Collecting email addresses |
| Date | Dates, appointments |

## Step 4: Configure Settings

Click the **Settings** icon to configure:
- **Brand colors** - Match your company colors
- **Logo** - Upload your logo
- **Thank you message** - Customize the completion message
- **Response limits** - Set maximum responses (optional)

## Step 5: Preview Your Survey

Always preview before publishing! Click **"Preview"** to see exactly what respondents will experience.

Check for:
- Question clarity
- Proper flow
- Mobile responsiveness
- Spelling/grammar

## Step 6: Publish

When you're satisfied, click **"Publish"**. Your survey is now live!

After publishing, you'll see the Share dialog with your survey link, QR code, and embed options.

## Next Steps

- [Share your survey](/help/sharing) →
- [View responses](/help/responses) →
- [Analyze results](/help/analytics) →
    `,
  },
  'survey-builder': {
    title: 'Using the Survey Builder',
    content: `
# Using the Survey Builder

The Survey Builder is your workspace for creating and editing surveys. Here's everything you need to know.

## Builder Layout

The builder is divided into three main areas:

1. **Left Panel** - Question types to add
2. **Center Canvas** - Your survey questions
3. **Right Panel** - Settings and properties

## Adding Questions

### Drag and Drop
Simply drag a question type from the left panel and drop it where you want it in your survey.

### Quick Add
Click the **+ Add Question** button at the bottom of your survey to quickly add a new question.

## Editing Questions

Click on any question to edit it:

- **Title** - The main question text
- **Description** - Optional helper text
- **Required** - Toggle if answer is mandatory
- **Options** - For choice questions, add/remove/reorder options

## Reordering Questions

Drag questions using the grip handle (⋮⋮) on the left side to reorder them.

## Question Settings

Each question type has specific settings:

### Rating Questions
- Set maximum rating (1-10)
- Choose icon style (stars, hearts, etc.)

### Choice Questions
- Add/remove options
- Enable "Other" option
- Randomize option order

### Text Questions
- Set character limits
- Add placeholder text
- Enable rich text formatting

## Survey Settings

Click the **gear icon** in the header to access survey-wide settings:

- Survey name and description
- Brand colors and logo
- Start/end dates
- Response limits
- Thank you message

## Saving Your Work

Your survey saves automatically as you work. You'll see "Saved" in the header.

You can also manually save by pressing **Ctrl+S** (or Cmd+S on Mac).

## Preview Mode

Click **Preview** to see your survey as respondents will see it. Test all questions and logic before publishing.
    `,
  },
  'question-types': {
    title: 'Question Types Explained',
    content: `
# Question Types Explained

Survey360 offers a variety of question types to collect different kinds of data. Here's when and how to use each one.

## Text Questions

### Short Text
Best for: Names, titles, brief answers

- Single line input
- Character limit: 250 characters
- Use for: Name, company, job title, short answers

### Long Text
Best for: Detailed feedback, comments, explanations

- Multi-line textarea
- Character limit: 5000 characters
- Use for: Open feedback, descriptions, suggestions

## Choice Questions

### Single Choice (Radio)
Best for: One answer from multiple options

- Only one selection allowed
- Options displayed vertically or horizontally
- Use for: Yes/No, satisfaction levels, preferences

### Multiple Choice (Checkbox)
Best for: Multiple selections from options

- Select any number of options
- Can set min/max selections
- Use for: Features used, interests, multi-select preferences

### Dropdown
Best for: Long lists of options

- Single selection from dropdown menu
- Saves space for many options
- Use for: Countries, categories, long lists

## Rating Questions

### Star Rating
Best for: Quick satisfaction ratings

- 1-5 or 1-10 scale
- Visual star icons
- Use for: Product ratings, satisfaction, recommendations

### Scale (NPS)
Best for: Net Promoter Score

- 0-10 numeric scale
- Calculates NPS automatically
- Use for: Loyalty measurement, recommendation likelihood

## Data Questions

### Number
Best for: Quantities, amounts

- Numeric input only
- Can set min/max values
- Use for: Age, quantity, budget

### Email
Best for: Collecting email addresses

- Validates email format
- Ensures proper formatting
- Use for: Contact collection, follow-ups

### Date
Best for: Dates, appointments

- Calendar picker
- Various date formats
- Use for: Event dates, birthdays, scheduling

### Phone
Best for: Phone numbers

- Formatted phone input
- Country code support
- Use for: Contact collection

## Best Practices

1. **Match question type to data needed** - Use rating for satisfaction, text for feedback
2. **Keep choice lists reasonable** - 5-7 options is ideal for radio buttons
3. **Use required sparingly** - Only require essential questions
4. **Provide clear labels** - Especially for rating scales (1 = Poor, 5 = Excellent)
    `,
  },
  'survey-logic': {
    title: 'Adding Survey Logic & Branching',
    content: `Make your surveys smarter with conditional logic and branching.

## What is Survey Logic?

Survey logic allows you to show or hide questions based on previous answers. This creates a personalized experience for each respondent.

## Types of Logic

### Skip Logic
Skip to a specific question based on an answer:
- If "Yes" → Go to Question 5
- If "No" → Skip to Question 8

### Display Logic
Show/hide questions conditionally:
- Show follow-up only if rating is below 3
- Hide detailed questions if user selects "Not applicable"

### Branch Logic
Create different survey paths:
- Customer path vs. Non-customer path
- Different questions by department

## Setting Up Logic

1. Select a question in the builder
2. Click the **Logic** tab in settings
3. Choose the logic type
4. Set conditions and actions
5. Save your changes

## Example Use Cases

### Customer Satisfaction
- Ask "Were you satisfied?" (Yes/No)
- If No → Show "What could we improve?"
- If Yes → Skip to "Would you recommend us?"

### Product Feedback
- Ask "Which product do you use?"
- Show relevant questions for that product only

## Tips for Effective Logic

- Keep logic simple and testable
- Always preview your survey to verify paths
- Consider edge cases
- Document complex logic for team reference
    `,
  },
  'survey-templates': {
    title: 'Using Survey Templates',
    content: `Get started quickly with our pre-built survey templates.

## Available Templates

### Customer Satisfaction
Perfect for measuring customer happiness:
- Overall satisfaction rating
- NPS (Net Promoter Score)
- Service quality questions
- Improvement suggestions

### Employee Feedback
Gather workplace insights:
- Job satisfaction
- Work-life balance
- Management feedback
- Growth opportunities

### Event Registration
Collect attendee information:
- Contact details
- Session preferences
- Dietary requirements
- Special accommodations

### Product Feedback
Learn what users think:
- Feature usage
- Ease of use
- Feature requests
- Bug reports

### Market Research
Understand your market:
- Demographics
- Buying behavior
- Brand awareness
- Competitor analysis

### Website Feedback
Improve your site:
- Navigation ease
- Content usefulness
- Design feedback
- Performance issues

## Using Templates

1. Click **"New Survey"**
2. Select **"Use Template"**
3. Browse or search templates
4. Click to preview
5. Click **"Use This Template"**
6. Customize as needed
7. Publish when ready

## Customizing Templates

After selecting a template:
- Add or remove questions
- Edit question text
- Change the order
- Update branding
- Modify settings
    `,
  },
  'survey-settings': {
    title: 'Survey Settings & Options',
    content: `Configure your survey exactly how you want it.

## General Settings

### Survey Name & Description
- Give your survey a clear, descriptive name
- Add a description for respondents
- Set internal notes for your team

### Status
- **Draft** - Not yet published, still editing
- **Published** - Live and accepting responses
- **Closed** - No longer accepting responses

## Response Settings

### Response Limits
- Set maximum number of responses
- Limit responses per person
- Set time-based limits

### Anonymous vs. Identified
- **Anonymous** - No identifying information collected
- **Identified** - Track who responded (requires login or email)

## Display Options

### Branding
- Upload your logo
- Set brand colors
- Custom thank you message
- Custom closed message

### Question Display
- One question per page
- All questions on one page
- Progress bar visibility
- Question numbering

## Advanced Settings

### Scheduling
- Set publish date/time
- Set close date/time
- Recurring surveys

### Notifications
- Email on new response
- Daily/weekly summaries
- Threshold alerts

### Access Control
- Public link
- Password protected
- Email invitation only
    `,
  },
  'publishing-survey': {
    title: 'Publishing Your Survey',
    content: `Make your survey live and start collecting responses.

## Before Publishing

### Pre-Launch Checklist
- Review all questions for clarity
- Test the survey yourself
- Check logic and branching
- Verify mobile appearance
- Proofread all text
- Set up notifications

## How to Publish

1. Click **"Preview"** to review your survey
2. Make any final adjustments
3. Click **"Publish"** button
4. Confirm publication
5. Your survey is now live!

## After Publishing

### Get Your Link
- Copy the survey link
- Share via your preferred channels
- Generate QR code if needed

### Monitor Responses
- Check the Responses tab regularly
- Watch for any issues
- Track completion rates

## Making Changes

### While Published
- You can edit text and minor changes
- Adding/removing questions affects data consistency
- Consider closing first for major changes

### Closing the Survey
- Click **"Close Survey"** when done
- Responses are no longer accepted
- You can reopen if needed

## Best Practices

- Publish during business hours
- Have your distribution plan ready
- Monitor early responses for issues
- Send reminders for better response rates
    `,
  },
  'survey-scheduling': {
    title: 'Scheduling Surveys',
    content: `Schedule your surveys to publish and close automatically.

## Setting Up a Schedule

### Publish Date
1. Go to Survey Settings
2. Click **"Schedule"**
3. Select publish date and time
4. Choose timezone
5. Save settings

### Close Date
1. Set when survey should close
2. Responses stop being accepted
3. Survey status changes to "Closed"

## Recurring Surveys

Set up surveys that repeat automatically:

### Frequency Options
- **Daily** - Same survey every day
- **Weekly** - Specific day each week
- **Monthly** - Specific date each month

### Recurring Settings
- Number of occurrences (or no limit)
- End date for recurring
- Automatic notifications

## Timezone Support

Available timezones:
- UTC
- US Eastern/Central/Pacific
- Europe London/Paris/Berlin
- Asia Tokyo/Singapore
- Australia Sydney

## Use Cases

### Monthly Check-ins
Schedule employee satisfaction surveys for the first Monday of each month.

### Event Feedback
Schedule to open when event starts and close 48 hours after.

### Seasonal Research
Run the same survey quarterly to track trends.

## Managing Scheduled Surveys

- View upcoming scheduled surveys
- Edit schedule before publish time
- Cancel scheduled publication
- View schedule history
    `,
  },

// Main Help Center Component
export function Survey360HelpCenter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || null);
  const [activeArticle, setActiveArticle] = useState(searchParams.get('article') || null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [troubleshootingStep, setTroubleshootingStep] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [articleFeedback, setArticleFeedback] = useState({});
  const [copied, setCopied] = useState(false);

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Search functionality
  const searchResults = searchQuery.trim() ? 
    HELP_CATEGORIES.flatMap(cat => 
      cat.articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(article => ({ ...article, category: cat }))
    ) : [];

  // Handle article view
  const handleArticleClick = (categoryId, articleId) => {
    setActiveCategory(categoryId);
    setActiveArticle(articleId);
    setActiveTab('article');
    setSearchParams({ tab: 'article', category: categoryId, article: articleId });
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'article':
        return <ArticleView 
          categoryId={activeCategory} 
          articleId={activeArticle}
          onBack={() => { setActiveTab('home'); setSearchParams({}); }}
          isDark={isDark}
          feedback={articleFeedback}
          setFeedback={setArticleFeedback}
        />;
      case 'faq':
        return <FAQView 
          isDark={isDark} 
          expandedFaq={expandedFaq} 
          setExpandedFaq={setExpandedFaq}
        />;
      case 'troubleshooting':
        return <TroubleshootingView 
          isDark={isDark}
          selectedIssue={selectedIssue}
          setSelectedIssue={setSelectedIssue}
        />;
      case 'shortcuts':
        return <KeyboardShortcutsView isDark={isDark} />;
      case 'whats-new':
        return <WhatsNewView isDark={isDark} />;
      default:
        return <HomeView 
          isDark={isDark}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onArticleClick={handleArticleClick}
          setActiveTab={setActiveTab}
        />;
    }
  };

  return (
    <div className={`min-h-screen ${bgPrimary}`}>
      {/* Header */}
      <div className={`${bgSecondary} border-b ${borderColor} sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/solutions/survey360/app/dashboard')}
                className={textSecondary}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
              <div className={`h-6 w-px ${borderColor}`} />
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-teal-500" />
                <span className={`font-semibold ${textPrimary}`}>Help Center</span>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative w-96">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className={`pl-10 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} ${textPrimary}`}
              />
              {searchQuery && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 ${bgSecondary} border ${borderColor} rounded-lg shadow-xl max-h-80 overflow-y-auto z-50`}>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => { handleArticleClick(result.category.id, result.id); setSearchQuery(''); }}
                      className={`w-full text-left px-4 py-3 ${hoverBg} border-b ${borderColor} last:border-0`}
                    >
                      <p className={`text-sm font-medium ${textPrimary}`}>{result.title}</p>
                      <p className={`text-xs ${textMuted}`}>{result.category.title} • {result.readTime}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className={textSecondary}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle },
              { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
              { id: 'whats-new', label: "What's New", icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (activeTab === 'article' && tab.id === 'home');
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-500/10 text-teal-400'
                      : `${textSecondary} ${hoverBg}`
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
}

// Home View Component
function HomeView({ isDark, searchQuery, searchResults, onArticleClick, setActiveTab }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className={`text-3xl font-bold ${textPrimary} mb-3`}>How can we help you?</h1>
        <p className={textSecondary}>Search our knowledge base or browse categories below</p>
      </div>

      {/* Popular Articles */}
      <div>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
          <Star className="w-5 h-5 text-yellow-500" />
          Popular Articles
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HELP_CATEGORIES.flatMap(cat => 
            cat.articles.filter(a => a.popular).map(article => (
              <button
                key={`${cat.id}-${article.id}`}
                onClick={() => onArticleClick(cat.id, article.id)}
                className={`${bgSecondary} border ${borderColor} rounded-xl p-4 text-left ${hoverBg} transition-all hover:border-teal-500/30`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${cat.color}-500/10`}>
                    <cat.icon className="w-4 h-4" style={{ color: cat.color === 'teal' ? '#14b8a6' : cat.color === 'blue' ? '#3b82f6' : cat.color === 'purple' ? '#a855f7' : cat.color === 'green' ? '#10b981' : '#f59e0b' }} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${textPrimary} mb-1`}>{article.title}</h3>
                    <p className={`text-xs ${textMuted}`}>{cat.title} • {article.readTime}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {HELP_CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className={`${bgSecondary} border ${borderColor} rounded-xl p-5 transition-all hover:border-teal-500/30`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3`} style={{ backgroundColor: `${category.color === 'teal' ? '#14b8a620' : category.color === 'blue' ? '#3b82f620' : category.color === 'purple' ? '#a855f720' : category.color === 'green' ? '#10b98120' : category.color === 'orange' ? '#f59e0b20' : category.color === 'pink' ? '#ec489920' : category.color === 'yellow' ? '#eab30820' : '#6b728020'}` }}>
                  <Icon className="w-5 h-5" style={{ color: category.color === 'teal' ? '#14b8a6' : category.color === 'blue' ? '#3b82f6' : category.color === 'purple' ? '#a855f7' : category.color === 'green' ? '#10b981' : category.color === 'orange' ? '#f59e0b' : category.color === 'pink' ? '#ec4899' : category.color === 'yellow' ? '#eab308' : '#6b7280' }} />
                </div>
                <h3 className={`font-semibold ${textPrimary} mb-1`}>{category.title}</h3>
                <p className={`text-sm ${textMuted} mb-3`}>{category.description}</p>
                <div className="space-y-1">
                  {category.articles.slice(0, 3).map(article => (
                    <button
                      key={article.id}
                      onClick={() => onArticleClick(category.id, article.id)}
                      className={`w-full text-left text-sm ${textSecondary} hover:text-teal-400 transition-colors flex items-center gap-1`}
                    >
                      <ChevronRight className="w-3 h-3" />
                      {article.title}
                    </button>
                  ))}
                  {category.articles.length > 3 && (
                    <p className={`text-xs ${textMuted} pl-4`}>+{category.articles.length - 3} more articles</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('faq')}
          className={`${bgSecondary} border ${borderColor} rounded-xl p-5 text-left ${hoverBg} transition-all`}
        >
          <HelpCircle className="w-6 h-6 text-teal-500 mb-2" />
          <h3 className={`font-semibold ${textPrimary} mb-1`}>Frequently Asked Questions</h3>
          <p className={`text-sm ${textMuted}`}>Quick answers to common questions</p>
        </button>
        <button
          onClick={() => setActiveTab('troubleshooting')}
          className={`${bgSecondary} border ${borderColor} rounded-xl p-5 text-left ${hoverBg} transition-all`}
        >
          <AlertCircle className="w-6 h-6 text-orange-500 mb-2" />
          <h3 className={`font-semibold ${textPrimary} mb-1`}>Troubleshooting</h3>
          <p className={`text-sm ${textMuted}`}>Fix common issues yourself</p>
        </button>
        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`${bgSecondary} border ${borderColor} rounded-xl p-5 text-left ${hoverBg} transition-all`}
        >
          <Keyboard className="w-6 h-6 text-purple-500 mb-2" />
          <h3 className={`font-semibold ${textPrimary} mb-1`}>Keyboard Shortcuts</h3>
          <p className={`text-sm ${textMuted}`}>Work faster with shortcuts</p>
        </button>
      </div>
    </div>
  );
}

// Article View Component
function ArticleView({ categoryId, articleId, onBack, isDark, feedback, setFeedback }) {
  const category = HELP_CATEGORIES.find(c => c.id === categoryId);
  const article = category?.articles.find(a => a.id === articleId);
  const content = ARTICLE_CONTENT[articleId];

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  const handleFeedback = (isHelpful) => {
    setFeedback(prev => ({ ...prev, [articleId]: isHelpful }));
  };

  if (!article || !content) {
    return (
      <div className="text-center py-12">
        <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
        <h2 className={`text-xl font-semibold ${textPrimary} mb-2`}>Article not found</h2>
        <Button onClick={onBack} variant="outline">Go back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button onClick={onBack} className={`${textSecondary} hover:text-teal-400`}>Help Center</button>
        <ChevronRight className={`w-4 h-4 ${textMuted}`} />
        <span className={textSecondary}>{category.title}</span>
        <ChevronRight className={`w-4 h-4 ${textMuted}`} />
        <span className={textPrimary}>{article.title}</span>
      </div>

      {/* Article */}
      <article className={`${bgSecondary} border ${borderColor} rounded-xl p-8`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${category.color === 'teal' ? '#14b8a620' : category.color === 'blue' ? '#3b82f620' : '#6b728020'}` }}>
            <category.icon className="w-5 h-5" style={{ color: category.color === 'teal' ? '#14b8a6' : category.color === 'blue' ? '#3b82f6' : '#6b7280' }} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{content.title}</h1>
            <p className={`text-sm ${textMuted}`}>{article.readTime} read</p>
          </div>
        </div>

        <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
          <div className={`${textSecondary} space-y-4`} dangerouslySetInnerHTML={{ 
            __html: content.content
              .replace(/^# (.*$)/gm, `<h1 class="${textPrimary} text-2xl font-bold mt-8 mb-4">$1</h1>`)
              .replace(/^## (.*$)/gm, `<h2 class="${textPrimary} text-xl font-semibold mt-6 mb-3">$1</h2>`)
              .replace(/^### (.*$)/gm, `<h3 class="${textPrimary} text-lg font-medium mt-4 mb-2">$1</h3>`)
              .replace(/\*\*(.*?)\*\*/g, `<strong class="${textPrimary}">$1</strong>`)
              .replace(/\*(.*?)\*/g, `<em>$1</em>`)
              .replace(/^- (.*$)/gm, `<li class="ml-4">$1</li>`)
              .replace(/\n\n/g, '</p><p class="mb-4">')
          }} />
        </div>

        {/* Feedback */}
        <div className={`mt-8 pt-6 border-t ${borderColor}`}>
          <p className={`text-sm ${textSecondary} mb-3`}>Was this article helpful?</p>
          <div className="flex items-center gap-2">
            <Button
              variant={feedback[articleId] === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFeedback(true)}
              className={feedback[articleId] === true ? 'bg-teal-500' : ''}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Yes
            </Button>
            <Button
              variant={feedback[articleId] === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFeedback(false)}
              className={feedback[articleId] === false ? 'bg-red-500' : ''}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              No
            </Button>
          </div>
          {feedback[articleId] !== undefined && (
            <p className={`text-sm ${textMuted} mt-2`}>
              {feedback[articleId] ? 'Glad this helped! 🎉' : 'Thanks for the feedback. We\'ll improve this article.'}
            </p>
          )}
        </div>
      </article>

      {/* Related Articles */}
      <div className="mt-8">
        <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Related Articles</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {category.articles.filter(a => a.id !== articleId).slice(0, 2).map(relatedArticle => (
            <button
              key={relatedArticle.id}
              onClick={() => window.location.href = `?tab=article&category=${categoryId}&article=${relatedArticle.id}`}
              className={`${bgSecondary} border ${borderColor} rounded-lg p-4 text-left hover:border-teal-500/30 transition-all`}
            >
              <h4 className={`font-medium ${textPrimary} mb-1`}>{relatedArticle.title}</h4>
              <p className={`text-sm ${textMuted}`}>{relatedArticle.readTime}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// FAQ View Component
function FAQView({ isDark, expandedFaq, setExpandedFaq }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Frequently Asked Questions</h1>
        <p className={textSecondary}>Quick answers to common questions about Survey360</p>
      </div>

      <div className="space-y-6">
        {FAQ_DATA.map((section, sectionIdx) => (
          <div key={section.category}>
            <h2 className={`text-lg font-semibold ${textPrimary} mb-3`}>{section.category}</h2>
            <div className={`${bgSecondary} border ${borderColor} rounded-xl overflow-hidden`}>
              {section.questions.map((faq, idx) => {
                const id = `${sectionIdx}-${idx}`;
                const isExpanded = expandedFaq === id;
                return (
                  <div key={idx} className={`border-b ${borderColor} last:border-0`}>
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span className={`font-medium ${textPrimary}`}>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 ${textSecondary} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className={`px-5 pb-4 ${textSecondary}`}>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Troubleshooting View Component
function TroubleshootingView({ isDark, selectedIssue, setSelectedIssue }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const issue = TROUBLESHOOTING_DATA.find(i => i.id === selectedIssue);

  if (issue) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedIssue(null)}
          className={`flex items-center gap-2 ${textSecondary} hover:text-teal-400 mb-6`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to issues
        </button>

        <div className={`${bgSecondary} border ${borderColor} rounded-xl p-6`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${textPrimary} mb-2`}>{issue.title}</h1>
              <div className="flex flex-wrap gap-2">
                {issue.symptoms.map((symptom, idx) => (
                  <Badge key={idx} variant="outline" className={`${borderColor} ${textMuted}`}>
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <h2 className={`font-semibold ${textPrimary} mb-4`}>Try these solutions:</h2>
          <div className="space-y-3">
            {issue.solutions.map((solution, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-teal-400">{idx + 1}</span>
                </div>
                <p className={textSecondary}>{solution}</p>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-teal-500/10' : 'bg-teal-50'} border border-teal-500/30`}>
            <p className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
              <strong>Still having issues?</strong> Contact our support team for personalized help.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Troubleshooting Guide</h1>
        <p className={textSecondary}>Select your issue to get step-by-step solutions</p>
      </div>

      <div className="grid gap-4">
        {TROUBLESHOOTING_DATA.map(issue => (
          <button
            key={issue.id}
            onClick={() => setSelectedIssue(issue.id)}
            className={`${bgSecondary} border ${borderColor} rounded-xl p-5 text-left ${hoverBg} transition-all hover:border-orange-500/30`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${textPrimary} mb-2`}>{issue.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {issue.symptoms.slice(0, 3).map((symptom, idx) => (
                    <Badge key={idx} variant="outline" className={`${borderColor} ${textMuted} text-xs`}>
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${textMuted}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Keyboard Shortcuts View
function KeyboardShortcutsView({ isDark }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Keyboard Shortcuts</h1>
        <p className={textSecondary}>Work faster with these keyboard shortcuts</p>
      </div>

      <div className="space-y-6">
        {KEYBOARD_SHORTCUTS.map(section => (
          <div key={section.category} className={`${bgSecondary} border ${borderColor} rounded-xl p-5`}>
            <h2 className={`font-semibold ${textPrimary} mb-4`}>{section.category}</h2>
            <div className="space-y-3">
              {section.shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={textSecondary}>{shortcut.action}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <React.Fragment key={keyIdx}>
                        <kbd className={`px-2 py-1 text-xs ${textPrimary} ${isDark ? 'bg-white/10' : 'bg-gray-100'} rounded border ${borderColor} font-mono`}>
                          {key}
                        </kbd>
                        {keyIdx < shortcut.keys.length - 1 && (
                          <span className={textSecondary}>+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// What's New View
function WhatsNewView({ isDark }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>What's New</h1>
        <p className={textSecondary}>Latest updates and improvements to Survey360</p>
      </div>

      <div className="space-y-8">
        {WHATS_NEW.map(release => (
          <div key={release.version} className={`${bgSecondary} border ${borderColor} rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-teal-500/20 text-teal-400 border-0">v{release.version}</Badge>
              <span className={textMuted}>{release.date}</span>
            </div>
            <div className="space-y-3">
              {release.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Badge 
                    variant="outline" 
                    className={`shrink-0 ${item.type === 'feature' ? 'border-teal-500/30 text-teal-400' : 'border-blue-500/30 text-blue-400'}`}
                  >
                    {item.type === 'feature' ? 'New' : 'Improved'}
                  </Badge>
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>{item.title}</h4>
                    <p className={`text-sm ${textMuted}`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Survey360HelpCenter;
