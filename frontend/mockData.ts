import { Task, TaskStatus, TaskPriority } from './types';

export const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'demo123'
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Market Research & Validation',
    description: 'Conduct comprehensive market analysis to validate the business idea and identify key competitors in the SaaS space.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    createdAt: Date.now() - 500000,
    subtasks: [
        { id: 'st-1', title: 'Identify top 5 direct competitors', completed: true },
        { id: 'st-2', title: 'Conduct customer interview surveys (n=50)', completed: true },
        { id: 'st-3', title: 'Complete SWOT analysis', completed: true }
    ]
  },
  {
    id: 't-2',
    title: 'Legal Entity Registration',
    description: 'Formalize the business structure and ensure all legal compliances are met before financial operations begin.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.HIGH,
    createdAt: Date.now() - 300000,
    subtasks: [
        { id: 'st-4', title: 'File Articles of Organization', completed: true },
        { id: 'st-5', title: 'Obtain EIN from IRS', completed: true },
        { id: 'st-6', title: 'Draft Operating Agreement', completed: false }
    ]
  },
  {
    id: 't-3',
    title: 'MVP Development',
    description: 'Build the Minimum Viable Product focusing on core value propositions to launch for early adopters.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    createdAt: Date.now() - 100000,
    subtasks: [
      { id: 'st-7', title: 'Finalize UI/UX Wireframes', completed: true },
      { id: 'st-8', title: 'Setup CI/CD Pipeline', completed: true },
      { id: 'st-9', title: 'Implement User Authentication', completed: false },
      { id: 'st-10', title: 'Develop Core Feature Set', completed: false }
    ]
  },
  {
    id: 't-4',
    title: 'Go-to-Market Strategy',
    description: 'Prepare marketing channels and sales assets for the upcoming product launch.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    createdAt: Date.now(),
    subtasks: [
      { id: 'st-11', title: 'Design landing page', completed: false },
      { id: 'st-12', title: 'Setup social media profiles', completed: false },
      { id: 'st-13', title: 'Write initial blog content (3 posts)', completed: false },
      { id: 'st-14', title: 'Configure email marketing automation', completed: false }
    ]
  }
];