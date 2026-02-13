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
  // Sharing & Distribution Articles
  'share-link': {
    title: 'Sharing via Link',
    content: `Share your survey with a simple link that works anywhere.

## Getting Your Survey Link

1. Publish your survey
2. Click the **"Share"** button
3. Copy the link from the dialog
4. Share it anywhere!

## Link Types

### Standard Link
- Full URL to your survey
- Works in all browsers
- Best for email and websites

### Shortened Link
- Compact URL using our link shortener
- Perfect for SMS and social media
- Easier to remember and type

## Where to Share

### Email
- Paste link directly in email body
- Add context about the survey
- Include a deadline if applicable

### Social Media
- Works on Facebook, Twitter, LinkedIn
- Use shortened link for character limits
- Add a compelling call-to-action

### Messaging Apps
- WhatsApp, Slack, Teams
- Link preview shows survey title
- Great for quick distribution

### QR Codes
- Generate from share dialog
- Print for physical locations
- Perfect for events and signage

## Tracking Link Performance

- View click counts in analytics
- See where responses come from
- Track conversion rates
    `,
  },
  'qr-codes': {
    title: 'Using QR Codes',
    content: `Generate QR codes for easy survey access on mobile devices.

## What is a QR Code?

A QR code is a scannable image that links directly to your survey. Users scan it with their phone camera to open the survey instantly.

## Generating a QR Code

1. Open your published survey
2. Click the **"Share"** button
3. Go to the **"QR Code"** tab
4. Your QR code is generated automatically
5. Download or print as needed

## Download Options

### Image Formats
- **PNG** - Best for digital use
- **SVG** - Best for print, scalable

### Sizes
- Small (200px) - Business cards
- Medium (400px) - Flyers, posters
- Large (800px) - Banners, signage

## Best Uses for QR Codes

### Events
- Conference feedback
- Workshop evaluations
- Registration check-in

### Retail
- Customer satisfaction surveys
- Product feedback
- Receipt surveys

### Print Materials
- Magazine/newspaper ads
- Direct mail pieces
- Product packaging

### Physical Locations
- Restaurant tables
- Hotel rooms
- Store displays

## Tips for QR Codes

- Ensure good contrast
- Test before printing
- Include a brief instruction
- Add your logo nearby
- Make it big enough to scan
    `,
  },
  'email-invitations': {
    title: 'Sending Email Invitations',
    content: `Send personalized survey invitations directly via email.

## Setting Up Email Invitations

1. Go to your survey
2. Click **"Share"** → **"Email Invitations"**
3. Enter recipient email addresses
4. Customize your message
5. Click **"Send"**

## Adding Recipients

### Manual Entry
- Type or paste email addresses
- One per line or comma-separated
- Validates email format

### Import from File
- Upload CSV with email column
- Map columns if needed
- Handles large lists

## Customizing Your Message

### Subject Line
- Keep it clear and compelling
- Include survey topic
- Add urgency if appropriate

### Email Body
- Personal greeting available
- Explain survey purpose
- Mention estimated time
- Thank them in advance

### Branding
- Your logo included
- Brand colors applied
- Professional appearance

## Tracking & Reminders

### Track Opens & Clicks
- See who opened the email
- Track who clicked the link
- Monitor completion status

### Send Reminders
- To non-responders only
- Customize reminder message
- Set reminder schedule

## Best Practices

- Personalize when possible
- Send at optimal times
- Follow up appropriately
- Respect unsubscribes
    `,
  },
  'embed-website': {
    title: 'Embedding on Your Website',
    content: `Add surveys directly to your website or app.

## Embed Options

### Inline Embed
Survey appears within your page:
- Seamless integration
- Matches your site design
- Good for feedback forms

### Popup Embed
Survey appears as an overlay:
- Triggered by button click
- Doesn't take page space
- Good for optional feedback

### Slide-in Widget
Survey slides in from the side:
- Non-intrusive
- Can trigger on scroll or time
- Good for exit surveys

## Getting the Embed Code

1. Open your survey
2. Click **"Share"** → **"Embed"**
3. Choose embed type
4. Customize appearance
5. Copy the code
6. Paste in your website HTML

## Customization Options

### Size
- Width (px or %)
- Height (px or auto)
- Responsive sizing

### Appearance
- Border style
- Background color
- Padding

### Behavior
- Auto-resize height
- Redirect on completion
- Custom callbacks

## Technical Requirements

- JavaScript enabled
- Modern browser
- HTTPS recommended

## Common Use Cases

- Website feedback forms
- Product satisfaction surveys
- Support ticket follow-ups
- Checkout surveys
    `,
  },
  'link-shortener': {
    title: 'Using the Link Shortener',
    content: `Create compact, memorable links for your surveys.

## Why Use Short Links?

### Character Limits
- SMS has 160 character limit
- Twitter/X has limits too
- Short links save space

### Easier to Share
- Simpler to read aloud
- Easier to remember
- Cleaner appearance

### Tracking
- Built-in click tracking
- See link performance
- A/B test different links

## Creating Short Links

1. Open your survey
2. Click **"Share"**
3. Go to **"Link"** tab
4. Click **"Shorten Link"**
5. Copy your shortened URL

## Short Link Format

Your links look like:
- https://survey.link/abc123
- Automatically generated
- Always available while survey is active

## Managing Short Links

### View Analytics
- Total clicks
- Unique visitors
- Geographic data

### Deactivate
- Short link stops working
- Original link still works
- Can reactivate later

## Best Practices

- Use for SMS campaigns
- Include in social posts
- Add to print materials
- Track campaign performance
    `,
  },
  // Responses Articles
  'viewing-responses': {
    title: 'Viewing Responses',
    content: `See all responses to your surveys in one place.

## Accessing Responses

1. Go to **"Responses"** from the sidebar
2. Select a survey (or view all)
3. Browse individual responses

## Response List View

### Information Shown
- Response ID
- Submission date/time
- Completion status
- Key answers summary

### Sorting Options
- Newest first
- Oldest first
- By completion status
- By specific answer

## Individual Response View

Click any response to see:
- All questions and answers
- Time spent on survey
- Submission metadata
- Response history

## Response Status

### Complete
- All required questions answered
- Survey was submitted
- Counts toward totals

### Partial
- Started but not finished
- May have some answers
- Can be excluded from reports

### In Progress
- Currently being filled out
- Updates in real-time
- May convert to complete

## Quick Actions

- **Export** - Download response data
- **Delete** - Remove a response
- **Flag** - Mark for follow-up
- **Notes** - Add internal comments
    `,
  },
  'filtering-responses': {
    title: 'Filtering & Searching Responses',
    content: `Find specific responses quickly with powerful filters.

## Basic Search

Type in the search box to find:
- Specific text in responses
- Email addresses
- Response IDs

## Filter Options

### By Date
- Today
- Last 7 days
- Last 30 days
- Custom date range

### By Status
- Complete only
- Partial only
- All responses

### By Answer
- Filter by specific question
- Match exact answers
- Include/exclude values

## Advanced Filtering

### Multiple Filters
Combine filters for precise results:
- Date AND Status
- Question answer AND Date
- Multiple question conditions

### Save Filters
1. Create your filter combination
2. Click **"Save Filter"**
3. Name your filter
4. Access from saved filters list

## Using Filters Effectively

### Quality Control
Filter for suspicious responses:
- Very fast completion
- Identical answers
- Inconsistent data

### Segmentation
Analyze specific groups:
- By demographic answers
- By satisfaction level
- By date period

### Follow-up
Find responses needing action:
- Low satisfaction scores
- Specific feedback mentions
- Incomplete submissions
    `,
  },
  'export-responses': {
    title: 'Exporting Responses to Excel',
    content: `Download your survey data for analysis in Excel or other tools.

## Quick Export

1. Go to **"Responses"**
2. Select your survey
3. Click **"Export Excel"**
4. File downloads automatically

## Export Contents

### Summary Sheet
- Survey name and description
- Total responses
- Date range
- Response rate

### Responses Sheet
- One row per response
- One column per question
- Timestamp and metadata
- Formatted headers

## Export Options

### All Responses
- Every response included
- Complete and partial
- Full date range

### Filtered Export
- Apply filters first
- Only matching responses export
- Good for segments

### Date Range
- Select specific period
- Compare time periods
- Historical analysis

## File Format

### Excel (.xlsx)
- Formatted headers
- Auto-width columns
- Ready for analysis

### Data Includes
- Response ID
- Submission timestamp
- All question answers
- Completion status

## Tips for Analysis

- Use Excel pivot tables
- Create charts from data
- Filter and sort in Excel
- Share with stakeholders
    `,
  },
  'response-notifications': {
    title: 'Response Notifications',
    content: `Stay informed when new responses come in.

## Setting Up Notifications

1. Go to your survey settings
2. Find **"Notifications"** section
3. Enable desired notifications
4. Save settings

## Notification Types

### Email Notifications
- Receive email for each response
- Includes summary of answers
- Link to view full response

### Daily Digest
- One email per day
- Summary of all responses
- Sent at set time

### Weekly Summary
- Weekly overview
- Response trends
- Key metrics

### Threshold Alerts
- Alert when reaching response goal
- Notify on low satisfaction scores
- Custom conditions

## Managing Notifications

### Who Receives
- Survey creator (default)
- Team members
- External email addresses

### Frequency
- Every response
- Batched (hourly/daily)
- Summary only

### Content
- Full response details
- Summary only
- Key metrics

## Best Practices

- Don't overwhelm inbox
- Use digest for high-volume surveys
- Set up alerts for important metrics
- Include team for collaboration
    `,
  },
  // Analytics Articles
  'analytics-overview': {
    title: 'Analytics Dashboard Overview',
    content: `Understand your survey performance at a glance.

## Dashboard Components

### Summary Cards
Quick stats showing:
- Total responses
- Completion rate
- Average time
- Active period

### Response Trends
Line chart showing:
- Responses over time
- 14-day history
- Trend direction

### Completion Rate
Bar chart showing:
- Daily completion rates
- Color-coded performance
- Benchmarks

## Key Metrics Explained

### Response Rate
Percentage of people who started the survey:
- High rate = Good distribution
- Low rate = Check targeting

### Completion Rate
Percentage of starters who finished:
- High rate = Good survey design
- Low rate = Survey may be too long

### Average Time
How long responses take:
- Compare to expected time
- Identify issues if too fast/slow

## Using Analytics

### Identify Problems
- Drop-off points
- Confusing questions
- Technical issues

### Measure Success
- Goal achievement
- Trend improvement
- Benchmark comparison

### Optimize Surveys
- Shorten if completion low
- Simplify complex questions
- Improve instructions
    `,
  },
  'response-charts': {
    title: 'Understanding Response Charts',
    content: `Make sense of the charts in your survey analytics.

## Chart Types

### Bar Charts
Used for:
- Multiple choice questions
- Single select questions
- Categorical data

Reading tips:
- Longer bar = more responses
- Compare relative lengths
- Check percentages

### Pie Charts
Used for:
- Distribution overview
- Single select questions
- Percentage breakdown

Reading tips:
- Larger slice = more responses
- Hover for exact numbers
- Best for 2-6 categories

### Rating Charts
Used for:
- Star ratings
- Scale questions
- NPS scores

Reading tips:
- See distribution across scale
- Calculate average
- Identify trends

### Word Clouds
Used for:
- Text responses
- Open-ended questions
- Common themes

Reading tips:
- Bigger word = more frequent
- Identify key themes
- Look for patterns

## Interacting with Charts

### Hover
- See exact values
- View percentages
- See response counts

### Click
- Filter by segment
- Drill down
- Cross-tabulate

### Export
- Download as image
- Include in reports
- Share with team
    `,
  },
  'completion-rates': {
    title: 'Tracking Completion Rates',
    content: `Monitor and improve how many people finish your surveys.

## Understanding Completion Rate

### Calculation
Completion Rate = (Completed / Started) × 100

### What's Good?
- 80%+ = Excellent
- 60-80% = Good
- 40-60% = Average
- Below 40% = Needs improvement

## Viewing Completion Data

1. Go to survey analytics
2. Find "Completion Rate" section
3. View trend over time
4. Identify patterns

## Factors Affecting Completion

### Survey Length
- Shorter = higher completion
- Aim for under 10 minutes
- Show progress bar

### Question Complexity
- Simple = better
- Clear instructions
- Logical flow

### Mobile Experience
- Mobile-friendly design
- Easy to tap answers
- Readable text

### Technical Issues
- Fast loading
- Error handling
- Save progress

## Improving Completion

### Quick Wins
- Remove unnecessary questions
- Add progress indicator
- Mobile optimize

### Content Changes
- Clearer questions
- Better instructions
- Logical ordering

### Technical Fixes
- Faster loading
- Better error messages
- Auto-save progress
    `,
  },
  'export-reports': {
    title: 'Exporting Analytics Reports',
    content: `Download and share your analytics data.

## Export Options

### Export Image (PNG)
- Visual summary
- Charts and graphs
- Presentation-ready

### Export Report (TXT)
- Text summary
- Key metrics
- Easy to email

### Export JSON
- Raw data
- For further analysis
- API integration

## How to Export

1. Go to survey analytics
2. Click **"Export"** button
3. Choose format
4. Download file

## Report Contents

### Summary Section
- Survey overview
- Date range
- Total responses
- Key metrics

### Response Breakdown
- Per-question analysis
- Charts and data
- Percentages

### Trends
- Time-based data
- Comparison periods
- Growth metrics

## Sharing Reports

### Email
- Attach downloaded files
- Include summary
- Link to live dashboard

### Presentations
- Use PNG exports
- Add to slides
- Include context

### Stakeholders
- Schedule regular reports
- Highlight key findings
- Include recommendations
    `,
  },
  'trends-analysis': {
    title: 'Response Trends Analysis',
    content: `Analyze how survey responses change over time.

## Trends Dashboard

### Response Volume
- Daily response counts
- Week-over-week comparison
- Identify peak times

### Satisfaction Trends
- Average ratings over time
- NPS score changes
- Sentiment shifts

### Completion Trends
- Rate changes over time
- Identify issues
- Measure improvements

## Reading Trend Charts

### Line Charts
- X-axis = Time
- Y-axis = Metric value
- Direction shows trend

### Interpreting Trends

**Upward Trend**
- Increasing responses
- Improving satisfaction
- Growing engagement

**Downward Trend**
- Decreasing activity
- Falling satisfaction
- Needs attention

**Flat Trend**
- Stable performance
- Consistent results
- May need boost

## Using Trends

### Spot Problems Early
- Sudden drops
- Unusual patterns
- Anomalies

### Measure Impact
- After changes
- Campaign effects
- Seasonal patterns

### Plan Ahead
- Predict volumes
- Resource planning
- Goal setting

## Comparing Periods

1. Select date range
2. Choose comparison period
3. View side-by-side
4. Calculate differences
    `,
  },
  // Team Articles
  'team-management': {
    title: 'Managing Team Members',
    content: `Add, manage, and organize your team in Survey360.

## Team Overview

### Viewing Team
1. Go to Settings
2. Click **"Team"**
3. See all members

### Member Information
- Name and email
- Role
- Join date
- Last active

## Adding Members

### Invite Process
1. Click **"Invite Member"**
2. Enter email address
3. Select role
4. Add personal message (optional)
5. Send invitation

### Invitation Status
- **Pending** - Not yet accepted
- **Accepted** - Active member
- **Expired** - Need to resend

## Managing Members

### Change Role
1. Find member in list
2. Click role dropdown
3. Select new role
4. Confirm change

### Remove Member
1. Find member
2. Click **"Remove"**
3. Confirm removal
4. Access revoked immediately

## Team Activity

### View Activity
- Who created surveys
- Who viewed responses
- Recent actions

### Audit Trail
- All team actions logged
- Filter by member
- Filter by action type
    `,
  },
  'roles-permissions': {
    title: 'Roles & Permissions',
    content: `Understand what each role can do in Survey360.

## Available Roles

### Owner
The account creator:
- Full access to everything
- Manage billing
- Delete organization
- Cannot be removed

### Admin
Full access except billing:
- Create/edit all surveys
- Manage team members
- View all responses
- Export all data

### Editor
Content creation focus:
- Create/edit surveys
- View all responses
- Export data
- Cannot manage team

### Viewer
Read-only access:
- View published surveys
- View responses (if permitted)
- Cannot create or edit
- Limited exports

## Permission Matrix

| Action | Owner | Admin | Editor | Viewer |
|--------|-------|-------|--------|--------|
| Create surveys | Yes | Yes | Yes | No |
| Edit surveys | Yes | Yes | Yes | No |
| Delete surveys | Yes | Yes | Own only | No |
| View responses | Yes | Yes | Yes | Limited |
| Export data | Yes | Yes | Yes | Own only |
| Manage team | Yes | Yes | No | No |
| Billing | Yes | No | No | No |

## Choosing Roles

### Give Admin to:
- Managers
- Team leads
- Trusted collaborators

### Give Editor to:
- Survey creators
- Marketing team
- Researchers

### Give Viewer to:
- Stakeholders
- Executives
- External partners
    `,
  },
  'organization-settings': {
    title: 'Organization Settings',
    content: `Configure your organization's Survey360 account.

## Organization Profile

### Basic Info
- Organization name
- Description
- Logo
- Website

### Updating Profile
1. Go to Settings
2. Click **"Organization"**
3. Edit fields
4. Save changes

## Branding Settings

### Default Branding
Set defaults for all surveys:
- Logo
- Primary color
- Secondary color
- Font preference

### Email Branding
Customize invitation emails:
- Header logo
- Footer text
- Brand colors

## Security Settings

### Password Policy
- Minimum length
- Complexity requirements
- Expiration period

### Two-Factor Auth
- Enable for organization
- Require for all members
- Recovery options

### Session Settings
- Timeout duration
- Remember me option
- IP restrictions

## Data Settings

### Data Retention
- How long to keep responses
- Auto-delete settings
- Archive options

### Export Permissions
- Who can export
- Export formats allowed
- Audit logging
    `,
  },
  // Settings Articles
  'profile-settings': {
    title: 'Profile Settings',
    content: `Manage your personal Survey360 profile.

## Accessing Profile

1. Click your avatar (bottom-left)
2. Select **"Settings"**
3. You're on the Profile tab

## Profile Information

### Display Name
- How you appear to team
- Shows on surveys you create
- Can be different from email

### Email Address
- Used for login
- Receives notifications
- Change requires verification

### Profile Picture
- Upload an image
- Or use initials avatar
- Appears across the app

## Updating Profile

1. Edit desired fields
2. Click **"Save Changes"**
3. Changes apply immediately

## Account Security

### Change Password
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click **"Update"**

### Two-Factor Authentication
1. Click **"Enable 2FA"**
2. Scan QR with authenticator app
3. Enter verification code
4. Save backup codes

## Connected Accounts

### Link Accounts
- Google account
- Microsoft account
- Enables SSO login

### Unlink Accounts
1. Find connected account
2. Click **"Disconnect"**
3. Confirm action
    `,
  },
  'notification-preferences': {
    title: 'Notification Preferences',
    content: `Control what notifications you receive.

## Notification Types

### Email Notifications
- New responses
- Survey milestones
- Team activity
- System updates

### In-App Notifications
- Real-time alerts
- Activity feed
- @mentions

### Browser Notifications
- Desktop alerts
- Even when tab is closed
- Quick response awareness

## Configuring Notifications

1. Go to **Settings**
2. Click **"Notifications"**
3. Toggle each type on/off
4. Save preferences

## Email Frequency

### Immediate
- Every notification
- Real-time delivery
- Best for low volume

### Daily Digest
- Once per day
- Combined summary
- Less inbox clutter

### Weekly Summary
- Once per week
- Overview of activity
- Good for managers

## Notification Categories

### Response Alerts
- New response received
- Response milestone reached
- Survey completed goal

### Survey Alerts
- Survey published
- Survey closing soon
- Survey closed

### Team Alerts
- New member joined
- Role changes
- Survey shared with you

### System Alerts
- Maintenance scheduled
- New features
- Important updates
    `,
  },
  'language-settings': {
    title: 'Language & Region Settings',
    content: `Customize Survey360 for your language and location.

## Changing Language

1. Go to **Settings**
2. Find **"Language"** section
3. Select your language
4. Interface updates immediately

## Available Languages

- English (US)
- Spanish (Español)
- French (Français)
- Portuguese (Português)
- Swahili (Kiswahili)
- Arabic (العربية)

## Language Features

### Interface Language
- All menus and buttons
- Help text
- Error messages
- System notifications

### Right-to-Left Support
For Arabic:
- RTL text direction
- Mirrored layout
- Proper alignment

## Region Settings

### Date Format
- MM/DD/YYYY (US)
- DD/MM/YYYY (Europe)
- YYYY-MM-DD (ISO)

### Time Format
- 12-hour (AM/PM)
- 24-hour

### Timezone
- Auto-detect
- Manual selection
- Affects scheduling

## Survey Languages

### Multi-language Surveys
- Create translations
- Respondent chooses language
- Analytics combined

### Default Language
- Set survey default
- Fallback language
- Translation priority
    `,
  },
  'theme-settings': {
    title: 'Theme & Appearance',
    content: `Customize how Survey360 looks for you.

## Theme Options

### Dark Mode
- Easy on eyes
- Great for night use
- Reduces glare
- Modern appearance

### Light Mode
- Traditional appearance
- Better in bright environments
- High contrast
- Print-friendly

### System
- Follows your OS setting
- Auto-switches
- Best of both worlds

## Changing Theme

### Quick Toggle
Click the sun/moon icon in the header

### In Settings
1. Go to **Settings**
2. Find **"Theme"** tab
3. Select preference
4. Preview changes

## Theme Features

### Accent Color
- Teal (default)
- Consistent throughout
- Branded experience

### Contrast
- Optimized for readability
- Accessible colors
- Clear hierarchy

## Display Options

### Sidebar
- Expanded or collapsed
- Remember preference
- Responsive on mobile

### Density
- Comfortable (default)
- Compact for more info
- Touch-friendly on mobile
    `,
  },
  'security-settings': {
    title: 'Security Settings',
    content: `Keep your Survey360 account secure.

## Password Security

### Strong Password
Requirements:
- At least 8 characters
- Mix of upper/lowercase
- Numbers and symbols
- Not easily guessable

### Changing Password
1. Go to Settings > Security
2. Enter current password
3. Enter new password
4. Confirm and save

## Two-Factor Authentication

### Enable 2FA
1. Go to Security settings
2. Click **"Enable 2FA"**
3. Scan QR code with authenticator
4. Enter verification code
5. Save backup codes securely

### Backup Codes
- Get 10 one-time codes
- Use if phone unavailable
- Store securely
- Can regenerate if needed

## Session Security

### Active Sessions
- See all logged-in devices
- Last activity time
- Location (approximate)

### Sign Out Other Sessions
1. View active sessions
2. Click **"Sign out"** next to session
3. Or "Sign out all" for all devices

## Security Recommendations

### Do
- Use unique password
- Enable 2FA
- Review sessions regularly
- Log out on shared devices

### Don't
- Share your password
- Use public WiFi without VPN
- Leave sessions open
- Ignore security alerts
    `,
  },
  // Billing Articles
  'pricing-plans': {
    title: 'Understanding Pricing Plans',
    content: `Learn about Survey360 pricing and features.

## Available Plans

### Free Plan ($0/month)
Perfect for getting started:
- 3 surveys
- 100 responses/month
- Basic analytics
- Email support

### Starter Plan ($15/month)
For small teams:
- Unlimited surveys
- 500 responses/month
- Skip logic
- Remove branding

### Professional Plan ($39/month)
For growing businesses:
- Unlimited surveys
- 2,500 responses/month
- Advanced analytics
- Priority support
- Custom branding

### Business Plan ($79/month)
For larger teams:
- Unlimited surveys
- 10,000 responses/month
- Team collaboration
- API access
- Dedicated support

## Feature Comparison

| Feature | Free | Starter | Pro | Business |
|---------|------|---------|-----|----------|
| Surveys | 3 | Unlimited | Unlimited | Unlimited |
| Responses | 100/mo | 500/mo | 2,500/mo | 10,000/mo |
| Question types | 10 | 10 | 10 | 10 |
| Analytics | Basic | Standard | Advanced | Advanced |
| Support | Email | Email | Priority | Dedicated |

## Choosing a Plan

### Free is best for:
- Testing the platform
- Simple one-time surveys
- Personal use

### Paid plans for:
- Regular survey needs
- Business requirements
- Team collaboration
- Professional features
    `,
  },
  'upgrade-plan': {
    title: 'Upgrading Your Plan',
    content: `Move to a higher plan for more features.

## Why Upgrade?

### More Responses
- Higher monthly limits
- Accommodate growth
- No interruptions

### Better Features
- Advanced analytics
- Skip logic
- Custom branding
- API access

### Priority Support
- Faster responses
- Dedicated help
- Phone support (Business)

## How to Upgrade

1. Go to **Settings**
2. Click **"Billing"**
3. View **"Available Plans"**
4. Click **"Upgrade"** on desired plan
5. Enter payment details
6. Confirm upgrade

## Billing Changes

### Pro-rated
- Pay difference for current period
- New features immediately
- Full price next billing

### Billing Cycle
- Monthly or annual
- Annual saves 20%
- Cancel anytime

## After Upgrading

### Immediate Access
- New limits apply
- Features unlocked
- Settings available

### Confirmation
- Email receipt
- Invoice available
- Updated dashboard

## Downgrading

If you need to downgrade:
1. Consider implications
2. Go to Billing
3. Select lower plan
4. Active at next billing cycle
5. Features reduce accordingly
    `,
  },
  'billing-history': {
    title: 'Viewing Billing History',
    content: `Access your payment records and invoices.

## Accessing Billing History

1. Go to **Settings**
2. Click **"Billing"**
3. Scroll to **"Billing History"**

## Invoice Information

### Each Invoice Shows
- Invoice number
- Date
- Amount
- Payment method
- Status

### Invoice Status
- **Paid** - Successfully processed
- **Pending** - Processing
- **Failed** - Payment issue

## Downloading Invoices

### Individual Invoice
1. Find the invoice
2. Click **"Download"**
3. PDF saves to device

### All Invoices
1. Click **"Download All"**
2. Select date range
3. ZIP file downloads

## Invoice Contents

### Header
- Your organization name
- Billing address
- Invoice number and date

### Line Items
- Plan name
- Billing period
- Amount

### Payment Details
- Payment method used
- Transaction ID
- Amount paid

## Managing Records

### For Accounting
- Download monthly
- Keep for records
- Match to expenses

### For Taxes
- Annual summary available
- Shows all payments
- Export for accountant
    `,
  },
  'payment-methods': {
    title: 'Managing Payment Methods',
    content: `Add, update, or remove payment methods.

## Accepted Payment Methods

### Credit Cards
- Visa
- Mastercard
- American Express

### Other Methods
- PayPal
- Bank transfer (Enterprise)

## Adding Payment Method

1. Go to **Settings** > **Billing**
2. Click **"Payment Methods"**
3. Click **"Add Payment Method"**
4. Enter card details
5. Verify and save

## Updating Payment Method

### Change Default
1. Find the payment method
2. Click **"Make Default"**
3. Future charges use this

### Update Card
1. Find the card
2. Click **"Edit"**
3. Update expiration or address
4. Save changes

## Removing Payment Method

1. Must have another method first
2. Find method to remove
3. Click **"Remove"**
4. Confirm deletion

## Failed Payments

### What Happens
- Email notification sent
- Grace period (usually 7 days)
- Service continues temporarily

### Fixing Issues
1. Check card validity
2. Ensure sufficient funds
3. Update payment method
4. Retry payment

## Security

### Card Storage
- We don't store full card numbers
- Encrypted transmission
- PCI compliant

### Fraud Protection
- Verification required
- Suspicious activity alerts
- Secure checkout
    `,
  },
};
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
          onArticleClick={handleArticleClick}
          onTabChange={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }}
          isDark={isDark}
          feedback={articleFeedback}
          setFeedback={setArticleFeedback}
        />;
      case 'faq':
        return <FAQView 
          isDark={isDark} 
          expandedFaq={expandedFaq} 
          setExpandedFaq={setExpandedFaq}
          onTabChange={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }}
          onArticleClick={handleArticleClick}
        />;
      case 'troubleshooting':
        return <TroubleshootingView 
          isDark={isDark}
          selectedIssue={selectedIssue}
          setSelectedIssue={setSelectedIssue}
          onTabChange={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }}
          onArticleClick={handleArticleClick}
        />;
      case 'shortcuts':
        return <KeyboardShortcutsView 
          isDark={isDark}
          onTabChange={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }}
          onArticleClick={handleArticleClick}
        />;
      case 'whats-new':
        return <WhatsNewView 
          isDark={isDark}
          onTabChange={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }}
          onArticleClick={handleArticleClick}
        />;
      default:
        return <HomeView 
          isDark={isDark}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onArticleClick={handleArticleClick}
          setActiveTab={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }}
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

// Shared Help Sidebar Component
function HelpSidebar({ isDark, activeTab, onTabChange, onArticleClick }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'whats-new', label: "What's New", icon: Sparkles },
  ];

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      {/* Navigation */}
      <div className={`${bgSecondary} border ${borderColor} rounded-xl p-4 sticky top-4`}>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
          <div className="p-1.5 rounded-lg bg-teal-500/20">
            <BookOpen className="w-4 h-4 text-teal-500" />
          </div>
          <span className={`font-medium ${textPrimary}`}>Help Center</span>
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-teal-500/10 text-teal-400 font-medium"
                    : `${textSecondary} ${hoverBg} hover:text-teal-400`
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Browse Categories */}
      <div className={`${bgSecondary} border ${borderColor} rounded-xl p-4 mt-4`}>
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Browse Topics</h4>
        <div className="space-y-1">
          {HELP_CATEGORIES.slice(0, 5).map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onArticleClick(cat.id, cat.articles[0].id)}
                className={`w-full text-left text-sm ${textSecondary} hover:text-teal-400 flex items-center gap-2 py-1.5`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Support */}
      <div className={`${bgSecondary} border ${borderColor} rounded-xl p-4 mt-4`}>
        <h4 className={`text-sm font-medium ${textPrimary} mb-2`}>Need more help?</h4>
        <p className={`text-xs ${textMuted} mb-3`}>Can't find what you're looking for?</p>
        <a 
          href="mailto:support@survey360.io"
          className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </a>
      </div>
    </aside>
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
    <div className="flex gap-8">
      <HelpSidebar 
        isDark={isDark} 
        activeTab="home" 
        onTabChange={setActiveTab}
        onArticleClick={onArticleClick}
      />
      
      <div className="flex-1 min-w-0 space-y-8">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}

// Article View Component
function ArticleView({ categoryId, articleId, onBack, onArticleClick, onTabChange, isDark, feedback, setFeedback }) {
  const category = HELP_CATEGORIES.find(c => c.id === categoryId);
  const article = category?.articles.find(a => a.id === articleId);
  const content = ARTICLE_CONTENT[articleId];

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const handleFeedback = (isHelpful) => {
    setFeedback(prev => ({ ...prev, [articleId]: isHelpful }));
  };

  const handleArticleNav = (newCategoryId, newArticleId) => {
    if (onArticleClick) {
      onArticleClick(newCategoryId, newArticleId);
    }
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

  // Get color style helper
  const getColorStyle = (color) => {
    const colors = {
      teal: { bg: '#14b8a620', text: '#14b8a6' },
      blue: { bg: '#3b82f620', text: '#3b82f6' },
      purple: { bg: '#a855f720', text: '#a855f7' },
      green: { bg: '#10b98120', text: '#10b981' },
      orange: { bg: '#f59e0b20', text: '#f59e0b' },
      pink: { bg: '#ec489920', text: '#ec4899' },
      yellow: { bg: '#eab30820', text: '#eab308' },
      gray: { bg: '#6b728020', text: '#6b7280' },
    };
    return colors[color] || colors.gray;
  };

  const colorStyle = getColorStyle(category.color);

  return (
    <div className="flex gap-8">
      {/* Left Sidebar - Category Navigation */}
      <aside className={`hidden lg:block w-64 flex-shrink-0`}>
        <div className={`${bgSecondary} border ${borderColor} rounded-xl p-4 sticky top-4`}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: colorStyle.bg }}>
              <category.icon className="w-4 h-4" style={{ color: colorStyle.text }} />
            </div>
            <span className={`font-medium ${textPrimary}`}>{category.title}</span>
          </div>
          <nav className="space-y-1">
            {category.articles.map((art) => (
              <button
                key={art.id}
                onClick={() => handleArticleNav(categoryId, art.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  art.id === articleId
                    ? "bg-teal-500/10 text-teal-400 font-medium"
                    : `${textSecondary} ${hoverBg} hover:text-teal-400`
                )}
              >
                {art.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Links */}
        <div className={`${bgSecondary} border ${borderColor} rounded-xl p-4 mt-4`}>
          <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Quick Links</h4>
          <div className="space-y-2">
            <button onClick={onBack} className={`w-full text-left text-sm ${textSecondary} hover:text-teal-400 flex items-center gap-2`}>
              <Home className="w-3.5 h-3.5" />
              Help Center Home
            </button>
            <button onClick={() => onTabChange && onTabChange('faq')} className={`w-full text-left text-sm ${textSecondary} hover:text-teal-400 flex items-center gap-2`}>
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </button>
            <button onClick={() => onTabChange && onTabChange('troubleshooting')} className={`w-full text-left text-sm ${textSecondary} hover:text-teal-400 flex items-center gap-2`}>
              <AlertCircle className="w-3.5 h-3.5" />
              Troubleshooting
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: colorStyle.bg }}>
              <category.icon className="w-5 h-5" style={{ color: colorStyle.text }} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>{content.title}</h1>
              <p className={`text-sm ${textMuted}`}>{article.readTime} read</p>
            </div>
          </div>

          <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
            <div className={`${textSecondary} space-y-4`} dangerouslySetInnerHTML={{ 
              __html: content.content
                .replace(/^## (.*$)/gm, `<h2 class="${textPrimary} text-xl font-semibold mt-6 mb-3">$1</h2>`)
                .replace(/^### (.*$)/gm, `<h3 class="${textPrimary} text-lg font-medium mt-4 mb-2">$1</h3>`)
                .replace(/\*\*(.*?)\*\*/g, `<strong class="${textPrimary}">$1</strong>`)
                .replace(/\*(.*?)\*/g, `<em>$1</em>`)
                .replace(/^- (.*$)/gm, `<li class="ml-4 mb-1">$1</li>`)
                .replace(/^\d+\. (.*$)/gm, `<li class="ml-4 mb-1 list-decimal">$1</li>`)
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
                {feedback[articleId] ? 'Glad this helped!' : 'Thanks for the feedback. We\'ll improve this article.'}
              </p>
            )}
          </div>
        </article>

        {/* Related Articles - Now in a grid below */}
        <div className="mt-8">
          <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Related Articles</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {category.articles.filter(a => a.id !== articleId).slice(0, 3).map(relatedArticle => (
              <button
                key={relatedArticle.id}
                onClick={() => handleArticleNav(categoryId, relatedArticle.id)}
                className={`${bgSecondary} border ${borderColor} rounded-lg p-4 text-left hover:border-teal-500/30 transition-all`}
              >
                <h4 className={`font-medium ${textPrimary} mb-1`}>{relatedArticle.title}</h4>
                <p className={`text-sm ${textMuted}`}>{relatedArticle.readTime}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Other Categories */}
        <div className="mt-8">
          <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Explore Other Topics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HELP_CATEGORIES.filter(c => c.id !== categoryId).slice(0, 4).map(cat => {
              const catColorStyle = getColorStyle(cat.color);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleArticleNav(cat.id, cat.articles[0].id)}
                  className={`${bgSecondary} border ${borderColor} rounded-lg p-3 text-left hover:border-teal-500/30 transition-all`}
                >
                  <div className="p-1.5 rounded-lg w-fit mb-2" style={{ backgroundColor: catColorStyle.bg }}>
                    <cat.icon className="w-4 h-4" style={{ color: catColorStyle.text }} />
                  </div>
                  <h4 className={`font-medium text-sm ${textPrimary}`}>{cat.title}</h4>
                  <p className={`text-xs ${textMuted}`}>{cat.articles.length} articles</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ View Component
function FAQView({ isDark, expandedFaq, setExpandedFaq, onTabChange, onArticleClick }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="flex gap-8">
      <HelpSidebar 
        isDark={isDark} 
        activeTab="faq" 
        onTabChange={onTabChange}
        onArticleClick={onArticleClick}
      />
      
      <div className="flex-1 min-w-0">
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
    </div>
  );
}

// Troubleshooting View Component
function TroubleshootingView({ isDark, selectedIssue, setSelectedIssue, onTabChange, onArticleClick }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const issue = TROUBLESHOOTING_DATA.find(i => i.id === selectedIssue);

  if (issue) {
    return (
      <div className="flex gap-8">
        <HelpSidebar 
          isDark={isDark} 
          activeTab="troubleshooting" 
          onTabChange={onTabChange}
          onArticleClick={onArticleClick}
        />
        
        <div className="flex-1 min-w-0">
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
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      <HelpSidebar 
        isDark={isDark} 
        activeTab="troubleshooting" 
        onTabChange={onTabChange}
        onArticleClick={onArticleClick}
      />
      
      <div className="flex-1 min-w-0">
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
    </div>
  );
}

// Keyboard Shortcuts View
function KeyboardShortcutsView({ isDark, onTabChange, onArticleClick }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="flex gap-8">
      <HelpSidebar 
        isDark={isDark} 
        activeTab="shortcuts" 
        onTabChange={onTabChange}
        onArticleClick={onArticleClick}
      />
      
      <div className="flex-1 min-w-0">
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
    </div>
  );
}

// What's New View
function WhatsNewView({ isDark, onTabChange, onArticleClick }) {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="flex gap-8">
      <HelpSidebar 
        isDark={isDark} 
        activeTab="whats-new" 
        onTabChange={onTabChange}
        onArticleClick={onArticleClick}
      />
      
      <div className="flex-1 min-w-0">
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
    </div>
  );
}

export default Survey360HelpCenter;
