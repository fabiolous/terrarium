import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'terrarium.db')

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if the column already exists
    cursor.execute("PRAGMA table_info(settings)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'fade_duration_minutes' not in columns:
        # Add the new column
        cursor.execute("ALTER TABLE settings ADD COLUMN fade_duration_minutes INTEGER DEFAULT 30")
        conn.commit()
        print("Successfully added fade_duration_minutes column to settings table")
    else:
        print("Column fade_duration_minutes already exists")
        
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    conn.close()
