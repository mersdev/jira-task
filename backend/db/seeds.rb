# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create demo user
demo_user = User.find_or_create_by!(email: 'demo@example.com') do |user|
  user.name = 'Demo User'
  user.password = 'demo123'
  user.avatar_url = 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png'
end

# Create additional sample users
sample_users = [
  { name: 'Alice Chen', email: 'alice@example.com', avatar: 5 },
  { name: 'Bob Smith', email: 'bob@example.com', avatar: 12 },
  { name: 'Carol White', email: 'carol@example.com', avatar: 18 },
  { name: 'David Lee', email: 'david@example.com', avatar: 24 },
  { name: 'Eve Brown', email: 'eve@example.com', avatar: 30 }
]

sample_users.each do |user_data|
  User.find_or_create_by!(email: user_data[:email]) do |user|
    user.name = user_data[:name]
    user.password = 'password123'
    user.avatar_url = "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_#{user_data[:avatar]}.png"
  end
end

# Create sample tasks for demo user
sample_tasks = [
  {
    title: 'Welcome to MonoTask',
    description: 'This is a sample task to get you started. You can create, edit, and delete tasks.',
    status: 'TODO',
    priority: 'HIGH',
    subtasks: [
      { title: 'Try creating a new task', completed: false },
      { title: 'Drag and drop to change status', completed: false }
    ]
  },
  {
    title: 'Learn the basics',
    description: 'Explore the different task statuses and priorities.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    subtasks: [
      { title: 'Understand TODO status', completed: true },
      { title: 'Understand IN_PROGRESS status', completed: false }
    ]
  },
  {
    title: 'Complete your first task',
    description: 'Move this task to DONE when all subtasks are completed.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    subtasks: [
      { title: 'Review task details', completed: true },
      { title: 'Mark as complete', completed: false }
    ]
  }
]

sample_tasks.each do |task_data|
  task = Task.find_or_create_by!(title: task_data[:title], user: demo_user) do |task|
    task.description = task_data[:description]
    task.status = task_data[:status]
    task.priority = task_data[:priority]
    task.created_at = Time.current
  end

  task_data[:subtasks].each do |subtask_data|
    Subtask.find_or_create_by!(title: subtask_data[:title], task: task) do |subtask|
      subtask.completed = subtask_data[:completed]
    end
  end
end
