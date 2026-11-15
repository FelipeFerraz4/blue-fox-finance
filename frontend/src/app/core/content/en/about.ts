import type { AboutContent } from '../pt/about';

/** About page (EN). */
export const aboutContent: AboutContent = {
  seo: {
    title: 'About Blue Fox Finance',
    description:
      'Meet Blue Fox Finance: the expense tracking app of the Blue Fox ecosystem, with single sign-on, per-user data isolation and a focus on accessibility.',
  },
  hero: {
    badge: 'HISTORY & CORPORATE GOVERNANCE',
    title: 'About BlueFox Finance',
    html: 'How a tool built in-house to solve the budgeting and spending challenges of <strong>Blue Fox Global Group</strong> grew into an open, high-precision expense tracking platform.',
  },
  foundation: {
    tag: 'THE FOUNDATION',
    title: 'Why was it built?',
    paragraphs: [
      '<strong>BlueFox Finance</strong> was born inside the internal operations of <strong>Blue Fox Global Group</strong> to solve a real and pressing governance problem: keeping tight control of spending, card statements and budget forecasting across several fronts and projects.',
      'With several corporate cards, different closing and due dates, and expenses made by multiple team members, manual methods like spreadsheets kept causing trouble: installments assigned to the wrong month, purchases with no record of who made them, and no clear view of the impact on future cash flow.',
    ],
    highlight:
      'Solution: an algorithm that assigns each purchase to the exact statement based on the card closing day, and records multi-item purchases in a single entry.',
  },
  opening: {
    tag: 'EXPANSION & ACCESS',
    title: 'Opening It to the Public',
    paragraphs: [
      'As the tool matured and its daily use brought budget peace of mind and full predictability to the group’s managers, it became clear that families, small businesses, partners and freelancers face the same struggle every day.',
      'So the app was freed from its strictly internal ties and made public. The platform was refined with a clean interface, two-level categorization (items and stores), split by buyer and an analytics dashboard following the Blue Fox Design System.',
    ],
    highlight:
      'Goal: give any user the same level of control and governance that was once available only to the group’s internal operations.',
  },
  holding: {
    tag: 'THE PARENT HOLDING',
    title: 'What is Blue Fox Global Group?',
    html: '<strong>Blue Fox Global Group</strong> is the holding company that builds, manages and invests in technology ecosystems, financial innovation, infrastructure solutions and multi-sector initiatives. The group is guided by strict principles of information security, operational efficiency and software engineering excellence.',
    pillars: [
      { label: 'Finance & Governance', desc: 'Budget management platforms and accurate spending forecasts.' },
      { label: 'Infrastructure & Cloud', desc: 'Resilient container architecture, high availability and Zero-Trust security.' },
      { label: 'Design & Experience', desc: 'Elegant, consistent visuals through the Blue Fox Design System.' },
    ],
  },
  identity: {
    tag: 'INFRASTRUCTURE & IDENTITY',
    title: 'The Group’s Role in the App & Single Sign-On with Keycloak',
    html: 'In <strong>BlueFox Finance</strong>, <strong>Blue Fox Global Group</strong> acts as the infrastructure provider, the keeper of engineering best practices and the guardian of data security.',
    panelBadge: 'Corporate Security',
    panelTitle: 'Why Keycloak?',
    panelHtml:
      'Access to the app goes through Blue Fox Global Group’s centralized authentication layer, built on <strong>Keycloak Identity & Access Management (IAM)</strong>.',
    points: [
      { title: 'Single Sign-On (SSO):', text: 'One account for every product and tool in the Blue Fox ecosystem.' },
      {
        title: 'OpenID Connect & OAuth2:',
        text: 'The global industry standard for securely exchanging encrypted tokens and protecting sessions.',
      },
      {
        title: 'Role-Based Access Control (RBAC):',
        text: 'Fine-grained permissions and complete isolation of records per user and organization.',
      },
    ],
    footnote: 'The Login button takes you to Blue Fox single sign-on: the same account works across every product in the ecosystem.',
  },
  cta: {
    title: 'Access BlueFox Finance',
    subtitle: 'Log in to explore the app and manage your entries, cards and budgets.',
    updates: 'See Updates & Roadmap',
  },
};
