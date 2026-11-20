import type { HomeContent } from '../pt/home';

/** Home page (EN). */
export const homeContent: HomeContent = {
  seo: {
    title: 'Blue Fox Finance · Expense tracking on the web and on Telegram',
    description:
      'Track your spending with installments assigned by your card closing date, bills with due-date alerts, an interactive dashboard and expense logging through Telegram. Free, from the Blue Fox ecosystem.',
    keywords:
      'expense tracker, personal finance, budgeting, credit card installments, credit card statement, bills, Telegram bot, finance dashboard',
  },
  hero: {
    badge: 'BLUE FOX ECOSYSTEM • SMART EXPENSE MANAGEMENT',
    title: 'High-Precision Expense Tracking,',
    highlight: 'on the Web and on Telegram',
    subtitle:
      'Manage multi-item purchases, installments automatically assigned by your card closing date, bills and multiple buyers, and log expenses by chatting with the Telegram bot.',
    secondary: 'Discover Our Story',
  },
  mockup: {
    previewLabel: 'Blue Fox Finance dashboard preview',
    badge: 'LIVE VERSION • v1.6',
    stats: [
      { label: 'Total Expenses', value: 'R$ 14,850.20', sub: 'Current reference month' },
      { label: 'Items & Entries', value: '128 items', sub: 'Categorized purchases' },
      { label: 'Statement Math', value: '100% exact', sub: 'By card closing day' },
      { label: 'Bills', value: '3 due soon', sub: 'Due-date alerts' },
    ],
    strip: [
      'Multi-Item Purchase Entries',
      'Automatic Installment Projection',
      'Registered Item and Store Categories',
      'Expense Logging on Telegram',
    ],
  },
  features: {
    badge: 'AVAILABLE TODAY',
    title: 'What Blue Fox Finance delivers',
    subtitle: 'Production-ready features for day-to-day expense tracking, on your own or as a team.',
    items: [
      {
        name: 'Installments by Closing Date',
        desc: 'Each purchase lands on the right credit card statement, calculated from your card closing day, with no manual adjustments.',
      },
      {
        name: 'Split by Buyer',
        desc: 'See exactly who made each expense within the same purchase or statement, making it easy to settle up with family or partners.',
      },
      {
        name: 'Stores & Categories',
        desc: 'Two-level classification: store categories (Grocery, Pharmacy, E-commerce) and product categories, with custom colors and quick creation right from the entry form.',
      },
      {
        name: 'Interactive Dashboard',
        desc: 'Cross-filtering dashboard: click a month, category, store or buyer and every chart updates. Includes a year-over-year comparison and upcoming commitments.',
      },
      {
        name: 'Bills',
        desc: 'Monthly, yearly and one-off bills with due-date status, alerts in the menu and on the dashboard, and confirmation of payments you have made.',
      },
      {
        name: 'Telegram Bot',
        desc: 'Log expenses, check your monthly summary, confirm payments and add stores and categories from the chat. Everything shows up on the website right away.',
      },
    ],
  },
  about: {
    badge: 'OUR STORY & GOVERNANCE',
    title: 'Where Blue Fox Finance Comes From',
    subtitle:
      'Built in-house by Blue Fox Global Group to keep tight control of expenses, card statements and bills, and now available to everyone.',
    boxes: [
      {
        title: 'Built for the Group’s Governance',
        html: 'It was born from a real need at <strong>Blue Fox Global Group</strong> to manage statements from several corporate cards, purchases made by different members and a budget with mathematical accuracy.',
      },
      {
        title: 'Open to Everyone',
        html: 'Once the calculation engine and buyer split had proven themselves, the platform was opened up so families and outside partners could use the same management tools.',
      },
    ],
    cta: 'Read the Full Story & the Role of Blue Fox Global Group',
  },
  cta: {
    title: 'Access the App',
    subtitle: 'Log in to manage your expenses, records and card statements.',
    updates: 'See Updates & Roadmap',
  },
};
