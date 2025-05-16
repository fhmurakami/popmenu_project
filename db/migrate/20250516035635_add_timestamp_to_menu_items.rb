class AddTimestampToMenuItems < ActiveRecord::Migration[8.0]
  def change
    # Add missing timestamp to menu items
    add_timestamps :menu_items, null: true

    # Backfill created_at and updated_at for existing records
    now = Time.current
    execute <<-SQL
        UPDATE menu_items
        SET created_at = '#{now}', updated_at = '#{now}';
    SQL

    # Add NOT NULL constraint to created_at and updated_at
    change_column_null :menu_items, :created_at, false
    change_column_null :menu_items, :updated_at, false
  end
end
