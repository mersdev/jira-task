class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.string :status, null: false, default: 'TODO'
      t.string :priority, null: false, default: 'MEDIUM'
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end

    add_index :tasks, :status
  end
end
