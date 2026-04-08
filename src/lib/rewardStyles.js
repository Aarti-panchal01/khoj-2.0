// Reward color mapping for consistent styling across the app
export const REWARD_STYLES = {
  gratitude: {
    bg: 'bg-gray-100',
    bgOpacity: 'bg-gray-100/90',
    text: 'text-gray-800',
    border: 'border-gray-300',
    hoverBorder: 'hover:border-gray-400',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-600',
    checkmark: 'bg-gray-700',
    ring: 'ring-gray-600',
    emoji: '🙏',
    label: 'Thanks',
    fullLabel: 'Gratitude'
  },
  food_treat: {
    bg: 'bg-orange-400',
    bgOpacity: 'bg-orange-400/90',
    text: 'text-white',
    border: 'border-orange-500',
    hoverBorder: 'hover:border-orange-600',
    selectedBg: 'bg-orange-50',
    selectedBorder: 'border-orange-600',
    checkmark: 'bg-orange-600',
    ring: 'ring-orange-600',
    emoji: '🍕',
    label: 'Food',
    fullLabel: 'Food Treat'
  },
  coffee: {
    bg: 'bg-amber-700',
    bgOpacity: 'bg-amber-700/90',
    text: 'text-white',
    border: 'border-amber-800',
    hoverBorder: 'hover:border-amber-900',
    selectedBg: 'bg-amber-50',
    selectedBorder: 'border-amber-800',
    checkmark: 'bg-amber-800',
    ring: 'ring-amber-800',
    emoji: '☕',
    label: 'Coffee',
    fullLabel: 'Coffee'
  },
  cash_reward: {
    bg: 'bg-green-500',
    bgOpacity: 'bg-green-500/90',
    text: 'text-white',
    border: 'border-green-600',
    hoverBorder: 'hover:border-green-700',
    selectedBg: 'bg-green-50',
    selectedBorder: 'border-green-600',
    checkmark: 'bg-green-600',
    ring: 'ring-green-600',
    emoji: '💰',
    label: 'Cash',
    fullLabel: 'Cash Reward'
  },
  gift: {
    bg: 'bg-purple-500',
    bgOpacity: 'bg-purple-500/90',
    text: 'text-white',
    border: 'border-purple-600',
    hoverBorder: 'hover:border-purple-700',
    selectedBg: 'bg-purple-50',
    selectedBorder: 'border-purple-600',
    checkmark: 'bg-purple-600',
    ring: 'ring-purple-600',
    emoji: '🎁',
    label: 'Gift',
    fullLabel: 'Gift'
  },
  none: {
    bg: 'bg-gray-100',
    bgOpacity: 'bg-gray-100/90',
    text: 'text-gray-700',
    border: 'border-gray-300',
    hoverBorder: 'hover:border-gray-400',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-500',
    checkmark: 'bg-gray-500',
    ring: 'ring-gray-500',
    emoji: '—',
    label: 'None',
    fullLabel: 'No Reward'
  }
};

// Helper function to get reward style
export const getRewardStyle = (rewardType) => {
  return REWARD_STYLES[rewardType] || REWARD_STYLES.none;
};
