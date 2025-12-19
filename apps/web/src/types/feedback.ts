export interface FeedbackConfig {
  [roomId: string]: {
    url: string;
    title: string;
  };
}

export const ROOM_FEEDBACK_URLS: FeedbackConfig = {
  'probability-bay': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdq49_J48zGw5Wie8nstFNLsJujqHd7hcGcexlVxHHHpgfCxQ/viewform?usp=dialog',
    title: 'Probability Bay Feedback'
  },
  'superposition-tower': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd-w1YlD2QojoIb9jBPXgq_2GYgSSdGisTiPGEjWq9-c3kNlQ/viewform',
    title: 'Superposition Tower Feedback'
  },
  'state-chamber': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSeQkSNbQq8l02w2unIx6LuQ0WJ2Xurkh36WvMw6mZdavF6GNg/viewform?usp=dialog',
    title: 'State Chamber Feedback'
  },
  'entanglement-bridge': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfNWVqcH4HY6iJFGSlplbwxVpZi9VsMNHC_zETmZGFbDF3M_Q/viewform?usp=dialog',
    title: 'Entanglement Bridge Feedback'
  },
  'tunneling-vault': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdo6JfuNWf50R7hFWB_rgKsZUG3UdPEXmZiu4iyH6xKSJXouQ/viewform?usp=dialog',
    title: 'Tunneling Vault Feedback'
  }
};