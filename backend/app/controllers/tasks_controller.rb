class TasksController < ApplicationController
  before_action :set_task, only: %i[show update destroy create_subtask]
  before_action :set_subtask, only: %i[update_subtask destroy_subtask]

  def index
    @tasks = Task.all.order(created_at: :desc)
    render json: @tasks.map(&:to_json)
  end

  def show
    render json: @task.to_json
  end

  def create
    @task = Task.new(task_params)
    @task.created_at = Time.current

    if @task.save
      render json: @task.to_json, status: :created
    else
      render json: @task.errors, status: :unprocessable_content
    end
  end

  def update
    if @task.update(task_params)
      render json: @task.to_json
    else
      render json: @task.errors, status: :unprocessable_content
    end
  end

  def destroy
    @task.destroy!
    head :no_content
  end

  def create_subtask
    @subtask = @task.subtasks.build(subtask_params)

    if @subtask.save
      @task.reload
      render json: @task.to_json, status: :created
    else
      render json: @subtask.errors, status: :unprocessable_content
    end
  end

  def update_subtask
    if @subtask.update(subtask_params)
      @task.reload
      render json: @task.to_json
    else
      render json: @subtask.errors, status: :unprocessable_content
    end
  end

  def destroy_subtask
    @subtask.destroy!
    head :no_content
  end

  private

  def set_task
    @task = Task.find(params.expect(:id))
  end

  def set_subtask
    @task = Task.find(params.expect(:task_id))
    @subtask = @task.subtasks.find(params.expect(:subtask_id))
  end

  def task_params
    params.expect(task: [ :title, :description, :status, :priority ])
  end

  def subtask_params
    params.expect(subtask: [ :title, :completed ])
  end
end
