export const PAY_CYCLE_TYPES = ['calendar', 'last_weekday', 'custom_day', 'bi_weekly'];

export const PAY_CYCLE_OPTIONS = [
  {
    value: 'calendar',
    label: 'Calendar Month',
    description: 'Standard calendar months (Jan 1-31, Feb 1-28, etc.)',
    requiresPayDay: false,
    icon: '📅'
  },
  {
    value: 'last_weekday',
    label: 'Last Weekday of Month',
    description: 'Last working day (Mon-Fri) of each month',
    requiresPayDay: false,
    icon: '💼'
  },
  {
    value: 'custom_day',
    label: 'Specific Day of Month',
    description: 'Set a specific day (e.g., 25th of every month)',
    requiresPayDay: true,
    payDayRange: { min: 1, max: 31 },
    payDayLabel: 'Pay Day (1-31)',
    icon: '📆'
  },
  {
    value: 'bi_weekly',
    label: 'Bi-Weekly',
    description: 'Every 2 weeks on a specific day',
    requiresPayDay: true,
    payDayRange: { min: 0, max: 6 },
    payDayLabel: 'Pay Day (Day of Week)',
    payDayOptions: [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ],
    icon: '🔄'
  }
];

export const OFFSET_OPTIONS = [
  { value: 0, label: 'Same day as payday', description: 'Period starts on payday' },
  { value: 1, label: '1 day after payday', description: 'Period starts next day (Recommended)' },
  { value: 2, label: '2 days after payday', description: 'Period starts 2 days after' }
];

export const UserSettingsInterface = {
  id: 'number',
  user_id: 'number',
  pay_cycle_type: 'string',
  pay_day: 'number | null',
  cycle_start_offset: 'number',
  created_at: 'string',
  updated_at: 'string | null'
};

export const CreateUserSettingsRequest = {
  pay_cycle_type: 'string',
  pay_day: 'number | null',
  cycle_start_offset: 'number'
};

export const UpdateUserSettingsRequest = {
  pay_cycle_type: 'string',
  pay_day: 'number | null',
  cycle_start_offset: 'number'
};
