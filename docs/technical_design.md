# Technical Design Document

## Restaurant Menu Management System

### Overview

This document outlines the technical design and architecture of the Restaurant Menu Management System, a Rails 8 application that provides APIs for managing restaurant menus and importing restaurant data from JSON files.

### Architecture

The application follows a standard Rails MVC architecture with additional components:

```
+-------------------+
| Client            |
+-------------------+
         │
         │ HTTP
         v
+-------------------+
| Controllers       | ─────────────┐
+-------------------+              │
         │                         │
         v                         v
+-------------------+       +-------------------+
| Services          | ----> | Models            |
+-------------------+       +-------------------+
                                   │
                                   v
                            +-------------------+
                            | Database          |
                            +-------------------+
```

#### Key Components:

1. **Controllers**: Handle HTTP requests and responses
2. **Models**: Represent the database schema and business logic
3. **Services**: Encapsulate complex business operations
4. **Database**: PostgreSQL database for data persistence

### Data Models

#### Entity-Relationship Diagram

```
Restaurant 1 --- * Menu 1 --- * MenuEntry * --- 1 MenuItem
```

#### Database Schema

**restaurants**

- id: bigint (PK)
- name: string
- created_at: datetime
- updated_at: datetime

**menus**

- id: bigint (PK)
- name: string
- restaurant_id: bigint (FK)
- created_at: datetime
- updated_at: datetime

**menu_items**

- id: bigint (PK)
- name: string
- created_at: datetime
- updated_at: datetime

**menu_entries**

- id: bigint (PK)
- menu_id: bigint (FK)
- menu_item_id: bigint (FK)
- price: decimal
- description: text (optional)
- category: string (optional)
- dietary_restrictions: string (optional)
- ingredients: text (optional)
- created_at: datetime
- updated_at: datetime

### Key Design Decisions

#### 1. MenuEntry Join Model

We use a join model (MenuEntry) to connect Menu and MenuItem with an additional price attribute. This design allows:

- Menu items to be used on multiple menus with different prices
- Menu items to maintain global uniqueness in the database
- Efficient retrieval of menu items with their prices for a specific menu

#### 2. Service Objects

We use service objects to encapsulate complex business logic, such as the JSON import process. The `RestaurantImportService` handles:

- JSON parsing and validation
- Data transformation
- Database operations
- Error handling and logging

Benefits:

- Keeps controllers slim
- Improves testability
- Provides a clear separation of concerns

#### 3. Transaction Support

Database operations in the import service are wrapped in a transaction to ensure data integrity. If any operation fails, all changes are rolled back.

```ruby
ActiveRecord::Base.transaction do
  # Database operations
end
```

#### 4. Comprehensive Logging

The import service implements detailed logging for each operation, with different log levels:

- `info`: Successful operations
- `warning`: Non-critical issues
- `error`: Critical errors that cause the import to fail

#### 5. API Structure

The API follows RESTful principles with nested resources where appropriate:

```
/api/v1/restaurants
/api/v1/restaurants/:restaurant_id/menus
/api/v1/restaurants/:restaurant_id/menus/:menu_id/menu_items
```

#### 6. Error Handling

The application implements consistent error handling at multiple levels:

- Controller level: HTTP error responses
- Service level: Detailed error logs and error states
- Model level: Validation errors

### Import Process Flow

The JSON import process follows these steps:

1. Parse the JSON file
2. Validate the overall structure
3. For each restaurant:
   a. Find or create the restaurant
   b. Process each menu
4. For each menu:
   a. Find or create the menu
   b. Process each menu item
5. For each menu item:
   a. Find or create the menu item
   b. Create or update the menu entry with the correct price
6. Return a detailed report with logs

### Testing Strategy

The application uses RSpec for testing, with a focus on:

1. **Unit tests**: Testing individual components in isolation
2. **Integration tests**: Testing components working together
3. **Edge cases**: Testing error handling and unusual scenarios

Key testing considerations:

- Test database transactions and rollbacks
- Test handling of invalid inputs
- Test handling of duplicate items
- Test various JSON formats

### Performance Considerations

1. **Database Indices**

   - Foreign keys (restaurant_id, menu_id, menu_item_id)
   - Unique indices on restaurant names and menu item names

2. **N+1 Query Prevention**

   - Use of eager loading with `includes` and `preload`

3. **Bulk Operations**
   - Transaction wrapping for related operations
   - Optimized find-or-create operations

### Security Considerations

1. **Input Validation**

   - Thorough validation of JSON input
   - Parameter sanitization

2. **Error Messages**

   - Non-revealing error messages in production

### Future Improvements

1. **Authentication and Authorization**

   - User authentication
   - Role-based access control

2. **API Rate Limiting**

   - Prevent abuse of the API

3. **Background Processing**

   - Move large imports to background jobs
   - Provide status updates during import

4. **Caching**

   - Cache frequently accessed data
   - Implement ETags for API responses

5. **Versioning**

   - Improved API versioning strategy
   - Database schema versioning

6. **File Upload Security**

   - Content type validation
   - File size limits

7. **File Upload UI**

   - Allow user to upload JSON files via browser to import restaurants

### Conclusion

The Restaurant Menu Management System is designed to be extensible, maintainable, and well-tested. The architecture follows Rails best practices and introduces additional patterns like service objects to handle complex operations. The system is built to handle the requirements of all three levels of the assignment, with a focus on data integrity, error handling, and performance.
