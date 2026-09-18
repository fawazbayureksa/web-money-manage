  import {
  FiHome,
  FiSettings,
  FiDollarSign,
  FiMenu,
  FiX,
  FiList,
  FiCreditCard,
  FiTag,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiBell,
  FiPlusCircle,
  FiLayers,
  FiLogOut,
} from 'react-icons/fi';

  export const menuGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', icon: FiHome, path: '/' },
        { label: 'Financials', icon: FiPieChart, path: '/financials' },
      ],
    },
    {
      title: 'Finance & Budget',
      items: [
        { label: 'Transactions', icon: FiList, path: '/transactions' },
        { label: 'Add Transaction', icon: FiPlusCircle, path: '/transaction' },
        { label: 'Debts', icon: FiTrendingDown, path: '/debts' },
        { label: 'Banks', icon: FiDollarSign, path: '/banks' },
        { label: 'Wallets', icon: FiCreditCard, path: '/wallets' },
        { label: 'Budget', icon: FiTrendingUp, path: '/budget' },
        { label: 'Budget Alerts', icon: FiBell, path: '/budget-alerts' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { label: 'Categories', icon: FiLayers, path: '/categories' },
        { label: 'Tags', icon: FiTag, path: '/tags' },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', icon: FiSettings, path: '/settings' },
        { label: 'Logout', icon: FiLogOut, path: '/logout' },
      ],
    },
  ]
