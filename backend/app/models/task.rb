class Task < ApplicationRecord
  belongs_to :user, optional: true
  has_many :subtasks, dependent: :destroy

  enum :status, { TODO: "TODO", IN_PROGRESS: "IN_PROGRESS", DONE: "DONE" }
  enum :priority, { LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH" }

  validates :title, presence: true
  validates :status, presence: true

  after_save :update_status_from_subtasks, if: :persisted?

  def update_status_from_subtasks
    return if subtasks.empty?

    if subtasks.all?(&:completed)
      update(status: "DONE") if status != "DONE"
    elsif subtasks.any?(&:completed)
      update(status: "IN_PROGRESS") if status == "TODO"
    end
  end

  def to_json
    {
      id: id.to_s,
      title: title,
      description: description || "",
      status: status,
      priority: priority,
      createdAt: created_at.to_i,
      subtasks: subtasks.map { |s| { id: s.id.to_s, title: s.title, completed: s.completed } },
      userId: user_id
    }
  end
end
