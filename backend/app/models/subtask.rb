class Subtask < ApplicationRecord
  belongs_to :task

  validates :title, presence: true

  after_save :update_task_status
  after_destroy :update_task_status

  private

  def update_task_status
    return if task.destroyed?

    if task.subtasks.empty?
      task.update(status: "TODO") if task.status != "TODO"
    elsif task.subtasks.all?(&:completed)
      task.update(status: "DONE")
    else
      task.update(status: "IN_PROGRESS") if task.status == "TODO"
    end
  end
end
