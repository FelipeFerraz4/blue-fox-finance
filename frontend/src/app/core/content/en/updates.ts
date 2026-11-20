import type { UpdatesContent } from '../pt/updates';

/** Updates page (EN). Bot commands stay as they are: the bot itself is still in Portuguese. */
export const updatesContent: UpdatesContent = {
  seo: {
    title: 'Blue Fox Finance Updates',
    description:
      'What has shipped and what is in progress at Blue Fox Finance: dashboard, bills, Telegram bot, dark theme and accessibility.',
  },
  hero: {
    badge: 'TRANSPARENCY & EVOLUTION',
    title: 'Updates & Roadmap',
    subtitle:
      'Follow in detail what already works in Blue Fox Finance, what we are building right now and what is planned for the future.',
  },
  tabs: {
    label: 'Filter updates',
    all: 'Overview',
    completed: 'Shipped',
    progress: 'In Progress',
    future: 'Roadmap',
  },
  columns: {
    completed: {
      title: 'Available Now',
      counter: 'features',
      desc: 'Fully working, tested features in the current version.',
    },
    progress: {
      title: 'In Progress',
      counter: 'in progress',
      desc: 'Items currently being designed and built.',
    },
    future: {
      title: 'Planned',
      counter: 'on the roadmap',
      desc: 'Modules mapped out in Blue Fox’s continuous evolution pipeline.',
    },
  },
  completed: [
    {
      title: 'Telegram Bot',
      badge: 'Shipped v1.6',
      badgeClass: 'success',
      description:
        'Log expenses, check the month, confirm payments and add records by chatting with the bot. Everything shows up on the website right away.',
      details: [
        '/lancamento with the same fields as the New Entry screen',
        '/resumo, /contas and /ultimos for quick lookups',
        '/cadastrar stores, buyers, payment methods, categories and bills, even in the middle of an entry',
      ],
    },
    {
      title: 'User Management',
      badge: 'Shipped v1.6',
      badgeClass: 'success',
      description: 'Finance admins create new accounts from the Services → Users screen, with access through Blue Fox single sign-on.',
      details: [
        'Email login with a temporary password',
        'Password change required on first login',
        'New users start with the Finance user role',
      ],
    },
    {
      title: 'Interactive Cross-Filtering Dashboard',
      badge: 'Shipped v1.4',
      badgeClass: 'success',
      description: 'Power BI-style dashboard: click a month, category, store or buyer and every chart follows the filter.',
      details: [
        'Spending by the month each installment is paid',
        'Year-over-year comparison and upcoming commitments',
        'Open installment plans and the year’s bills on the same dashboard',
      ],
    },
    {
      title: 'Recurring Bills',
      badge: 'Shipped v1.3',
      badgeClass: 'success',
      description: 'Track monthly, yearly and one-off bills, with due-date status and confirmation of payments made.',
      details: [
        'Status: paid, overdue, due today and upcoming',
        'Card statement calculated as the sum of the month’s installments',
        'Alerts in the menu and at the top of the dashboard',
      ],
    },
    {
      title: 'Blue Fox Single Sign-On (SSO) & Isolated Data',
      badge: 'Shipped v1.2',
      badgeClass: 'success',
      description: 'Log in through Blue Fox Global Group’s identity provider, with each user’s data kept fully separate.',
      details: [
        'OpenID Connect authentication (Keycloak)',
        'Routes and API protected by roles',
        'Each user sees only their own entries and records',
      ],
    },
    {
      title: 'Entries, Statements & Records',
      badge: 'Shipped v1.0',
      badgeClass: 'success',
      description:
        'The core of the app: multi-item purchases, installments assigned by the card closing date and records that speed up every entry.',
      details: [
        'One purchase with a single header and multiple items',
        'Statement month and installments calculated from the closing day',
        'Buyers, stores, categories and entry defaults',
      ],
    },
  ],
  progress: [
    {
      title: 'Automatic Bill Reminders',
      badge: 'In Progress',
      badgeClass: 'warning',
      description: 'Daily reminders for bills that are due soon or overdue, without opening the website.',
      details: [
        'Reminder before the due date and on the day',
        'Sent through Telegram, with other channels under consideration',
        'No repeated reminders for the same bill',
      ],
    },
    {
      title: 'Languages & Country Formats',
      badge: 'In Progress',
      badgeClass: 'warning',
      description: 'The website in Portuguese and English, with currency, dates and numbers in your country’s format.',
      details: [
        'Public pages already available in Portuguese and English',
        'App and Telegram bot in the language you choose',
        'Your country sets the currency and date and number format (e.g. R$ 1.234,56 or $1,234.56)',
      ],
    },
  ],
  future: [
    {
      title: 'Report Export (PDF & Excel/CSV)',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Organized monthly statements for printing, auditing or offline review.',
      details: [
        'Detailed export of statements and installment plans',
        'Spreadsheet compatible with Excel and Google Sheets',
        'Custom filters on export',
      ],
    },
    {
      title: 'Budget Planning (Budget vs. Actual)',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Set spending goals per category and compare them with actual expenses.',
      details: ['Spending cap per expense category', 'Budget usage progress bar', 'Alerts when nearing the cap'],
    },
    {
      title: 'Multi-Currency & Live Exchange Rates',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Log expenses in US dollars (USD) or euros (EUR) with automatic conversion to BRL.',
      details: [
        'Exchange rate from the purchase date or the closing date',
        'Exchange fees and IOF tax for international purchases',
      ],
    },
    {
      title: 'Mobile App (PWA)',
      badge: 'Roadmap',
      badgeClass: 'purple',
      description: 'Install it on Android and iOS phones straight from the browser.',
      details: ['Quick expense entry right from your home screen', 'Background sync'],
    },
  ],
  bottomCta: {
    title: 'Want to try the live version?',
    subtitle: 'Access the app and check out the features already available.',
    button: 'Log In and Get Started',
  },
};
