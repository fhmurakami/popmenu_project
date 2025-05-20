# PopMenu Project - Frontend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Component Documentation](#component-documentation)
6. [Services](#services)
7. [Testing Strategy](#testing-strategy)
8. [Development Guidelines](#development-guidelines)
9. [Build & Deployment](#build--deployment)

## Overview

The PopMenu frontend is a React-based single-page application built with Rails 8, providing a user-friendly interface for managing restaurants, menus, and menu items. The application emphasizes code quality, testability, and maintainability as required for production environments.

### Key Features

- **Restaurant Management**: Create, view, and manage restaurant profiles
- **Menu Management**: Handle multiple menus per restaurant with intuitive forms
- **Menu Item Management**: Add, edit, and organize menu items across different menus
- **JSON Import**: Upload and process restaurant data from JSON files
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Real-time Feedback**: User-friendly error handling and success notifications

## Architecture

### Design Patterns

- **Component-Based Architecture**: Modular, reusable React components
- **Container/Presentational Pattern**: Separation of business logic and UI concerns
- **Service Layer Pattern**: Centralized API communication through service modules
- **Error Boundary Pattern**: Graceful error handling at component level

### State Management

- **Local State**: React hooks (useState, useEffect) for component-specific state
- **Form State**: Controlled components for form handling
- **API State**: Service layer manages server communication and data fetching

## Technology Stack

| Technology      | Version | Purpose                     |
| --------------- | ------- | --------------------------- |
| React           | 19.1.0  | UI Library                  |
| React DOM       | 19.1.0  | DOM Rendering               |
| React Router    | 7.6.0   | Client-side Routing         |
| Tailwind CSS    | 4.1.5   | Utility-first CSS Framework |
| Bootstrap       | 5.3.6   | Additional UI Components    |
| ESBuild         | 0.25.4  | JavaScript Bundler          |
| Jest            | 29.7.0  | Testing Framework           |
| Testing Library | 16.3.0  | Component Testing Utilities |

### Build Tools

- **ESBuild**: Fast JavaScript bundling with source maps
- **Babel**: JSX and modern JavaScript transpilation
- **Tailwind CLI**: CSS processing and optimization

## Project Structure

```
app/javascript/
├── application.jsx              # Main application entry point
├── application.test.jsx         # Application-level tests
├── components/                  # React components
│   ├── App.jsx                 # Root application component
│   ├── App.test.jsx            # App component tests
│   ├── menu/                   # Menu-related components
│   │   ├── MenuForm.jsx        # Menu creation/editing form
│   │   ├── MenuForm.test.jsx   # Menu form tests
│   │   ├── MenuInfo.jsx        # Menu detail display
│   │   ├── MenuInfo.test.jsx   # Menu info tests
│   │   ├── MenuList.jsx        # Menu listing component
│   │   └── MenuList.test.jsx   # Menu list tests
│   ├── menu-item/              # Menu item components
│   │   ├── MenuItemForm.jsx    # Menu item form
│   │   ├── MenuItemForm.test.jsx
│   │   ├── MenuItemList.jsx    # Menu item listing
│   │   └── MenuItemList.test.jsx
│   ├── restaurant/             # Restaurant components
│   │   ├── RestaurantForm.jsx  # Restaurant form
│   │   ├── RestaurantForm.test.jsx
│   │   ├── RestaurantInfo.jsx  # Restaurant detail view
│   │   ├── RestaurantInfo.test.jsx
│   │   ├── RestaurantList.jsx  # Restaurant listing
│   │   └── RestaurantList.test.jsx
│   └── shared/                 # Shared/common components
│       ├── Navbar.jsx          # Navigation component
│       └── Navbar.test.jsx     # Navigation tests
├── services/                   # API and business logic
│   ├── __mocks__/              # Service mocks for testing
│   │   └── apiService.js       # Mocked API service
│   ├── apiService.js           # Main API service
│   └── apiService.test.js      # API service tests
└── tests/                      # Testing utilities
    └── testUtils.js            # Shared test helpers
```

## Component Documentation

### Core Components

#### `App.jsx`

**Purpose**: Root application component that sets up routing and global layout.

**Props**: None

**Key Features**:

- React Router setup for client-side navigation
- Global error boundary
- Navbar integration
- Route configuration for all major views

```jsx
// Usage
import App from "./components/App"
ReactDOM.render(<App />, document.getElementById("root"))
```

#### `Navbar.jsx`

**Purpose**: Primary navigation component providing links to all major sections.

**Props**: None

**Features**:

- Responsive design with mobile hamburger menu
- Active link highlighting
- Consistent styling across all pages

### Restaurant Components

#### `RestaurantList.jsx`

**Purpose**: Displays a paginated list of all restaurants.

**Props**: None

**Features**:

- Real-time data fetching
- Loading states
- Error handling
- Responsive grid layout
- Navigation to individual restaurant details

#### `RestaurantForm.jsx`

**Purpose**: Form component for creating and editing restaurants.

**Props**:

- `restaurantId` (optional): ID for editing existing restaurant
- `onSuccess` (function): Callback executed on successful form submission

**Features**:

- Form validation
- Error display
- Success notifications
- Controlled form inputs

#### `RestaurantInfo.jsx`

**Purpose**: Detailed view of a single restaurant and its menus.

**Props**:

- `restaurantId` (required): ID of the restaurant to display

**Features**:

- Restaurant details display
- Associated menus listing
- Navigation to menu details
- Edit restaurant action

### Menu Components

#### `MenuList.jsx`

**Purpose**: Lists all menus for a specific restaurant.

**Props**:

- `restaurantId` (required): ID of the parent restaurant

**Features**:

- Menu cards with basic information
- Links to detailed menu views
- Add new menu functionality
- Responsive layout

#### `MenuForm.jsx`

**Purpose**: Form for creating and editing menu information.

**Props**:

- `restaurantId` (required): ID of the parent restaurant
- `menuId` (optional): ID for editing existing menu
- `onSuccess` (function): Success callback

**Features**:

- Menu name and description fields
- Restaurant association
- Form validation and error handling

#### `MenuInfo.jsx`

**Purpose**: Detailed view of a menu and its items.

**Props**:

- `menuId` (required): ID of the menu to display

**Features**:

- Menu details display
- Menu items listing
- Add menu items functionality
- Edit menu information

### Menu Item Components

#### `MenuItemList.jsx`

**Purpose**: Displays menu items for a specific menu.

**Props**:

- `menuId` (required): ID of the parent menu

**Features**:

- Item cards with name and price
- Sorting and filtering capabilities
- Add new item functionality
- Bulk operations support

#### `MenuItemForm.jsx`

**Purpose**: Form component for managing menu items.

**Props**:

- `menuId` (required): ID of the parent menu
- `itemId` (optional): ID for editing existing item
- `onSuccess` (function): Success callback

**Features**:

- Name, description, and price fields
- Input validation
- Price formatting
- Error handling and user feedback

### Shared Components

#### `Navbar.jsx`

**Purpose**: Application navigation bar with responsive design.

**Features**:

- Navigation links to main sections
  <!-- TODO -->
  <!-- - Brand logo/name -->
  <!-- - Mobile-responsive hamburger menu -->
  <!-- - Active link highlighting -->

## Services

### API Service (`apiService.js`)

The API service provides a centralized interface for all backend communication, following RESTful conventions and providing consistent error handling.

#### Core Methods

```javascript
// Restaurant operations
getRestaurants() // GET /api/restaurants
getRestaurant(id) // GET /api/restaurants/:id
createRestaurant(data) // POST /api/restaurants
updateRestaurant(id, data) // PUT /api/restaurants/:id
deleteRestaurant(id) // DELETE /api/restaurants/:id

// Menu operations
getMenus(restaurantId) // GET /api/restaurants/:id/menus
getMenu(id) // GET /api/menus/:id
createMenu(restaurantId, data) // POST /api/restaurants/:id/menus
updateMenu(id, data) // PUT /api/menus/:id
deleteMenu(id) // DELETE /api/menus/:id

// Menu item operations
getMenuItems(menuId) // GET /api/menus/:id/menu_items
getMenuItem(id) // GET /api/menu_items/:id
createMenuItem(menuId, data) // POST /api/menus/:id/menu_items
updateMenuItem(id, data) // PUT /api/menu_items/:id
deleteMenuItem(id) // DELETE /api/menu_items/:id

// Import operations
importData(file) // POST /api/import
```

#### Error Handling

The service provides consistent error handling with standardized error objects:

```javascript
{
  message: 'Human-readable error message',
  status: 404,
  details: { /* Additional error details */ }
}
```

#### Authentication & Headers

All requests include:

- CSRF token for Rails security
- Content-Type headers
- Accept headers for JSON responses

## Testing Strategy

### Testing Philosophy

- **100% Test Coverage**: Every component and service is thoroughly tested
- **Behavior-Driven Testing**: Tests focus on user interactions and expected outcomes
- **Integration Testing**: Components are tested with their dependencies
- **Mocking Strategy**: External dependencies are mocked for isolation

### Testing Tools

#### Jest Configuration

```javascript
// jest.config.js
module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
	moduleNameMapper: {
		"\\.(css|less|scss|sass)$": "identity-obj-proxy",
	},
	collectCoverageFrom: [
		"app/javascript/**/*.{js,jsx}",
		"!app/javascript/**/*.test.{js,jsx}",
	],
}
```

#### Test Utilities

- **Custom Render**: Wraps components with necessary providers (Router, etc.)
- **Mock Services**: Comprehensive mocking of API services
- **Test Data Factories**: Consistent test data generation

### Component Testing Patterns

#### Basic Component Test

```javascript
import { render, screen } from "@testing-library/react"
import { renderWithRouter } from "../tests/testUtils"
import RestaurantList from "./RestaurantList"

describe("RestaurantList", () => {
	test("renders restaurant list correctly", () => {
		renderWithRouter(<RestaurantList />)
		expect(screen.getByText("Restaurants")).toBeInTheDocument()
	})
})
```

#### Form Testing

```javascript
import userEvent from "@testing-library/user-event"

test("submits form with valid data", async () => {
	const user = userEvent.setup()
	const onSuccess = jest.fn()

	render(<RestaurantForm onSuccess={onSuccess} />)

	await user.type(screen.getByLabelText("Name"), "Test Restaurant")
	await user.click(screen.getByRole("button", { name: /save/i }))

	expect(onSuccess).toHaveBeenCalled()
})
```

#### API Service Testing

```javascript
import apiService from "./apiService"

describe("apiService", () => {
	beforeEach(() => {
		global.fetch = jest.fn()
	})

	test("getRestaurants returns restaurant data", async () => {
		const mockData = [{ id: 1, name: "Test Restaurant" }]
		fetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ restaurants: mockData }),
		})

		const result = await apiService.getRestaurants()
		expect(result).toEqual(mockData)
	})
})
```

### Test Coverage Goals

- **Components**: 100% line and branch coverage
- **Services**: 100% line and branch coverage
- **Integration**: Critical user paths covered
- **Error Scenarios**: All error paths tested

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test MenuForm.test.jsx
```

## Development Guidelines

### Code Style

#### React Best Practices

- **Functional Components**: Use hooks over class components
- **Prop Types**: Define prop types for all components (when using TypeScript)
- **Key Props**: Always provide keys for list items
- **Conditional Rendering**: Use logical operators for simple conditions

#### JavaScript Standards

- **ES6+ Syntax**: Use modern JavaScript features
- **Destructuring**: Extract props and state cleanly
- **Arrow Functions**: Consistent function declarations
- **Async/Await**: Prefer over Promise chains

#### CSS/Styling

- **Tailwind First**: Use utility classes for styling
- **Component Classes**: Create component-specific classes when needed
- **Responsive Design**: Mobile-first approach
- **Semantic HTML**: Use appropriate HTML elements

### Performance Considerations

#### Component Optimization

- **React.memo**: Wrap pure components to prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive calculations and functions
- **Lazy Loading**: Implement code splitting for large components

#### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Code Splitting**: Split bundles by route or feature
- **Asset Optimization**: Compress images and fonts

### Accessibility

#### ARIA Standards

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Provide labels for interactive elements
- **Focus Management**: Ensure keyboard navigation works
- **Color Contrast**: Meet WCAG guidelines

#### Testing Accessibility

- **Screen Reader**: Test with screen reader software
- **Keyboard Navigation**: Ensure all functionality is keyboard accessible
- **Color Independence**: Don't rely solely on color for information

## Build & Deployment

### Development Build

```bash
# Start development server
rails server

# Build JavaScript in watch mode
npm run build:watch

# Build CSS in watch mode
npm run build:css:watch
```

### Production Build

```bash
# Build optimized JavaScript
npm run build

# Build optimized CSS
npm run build:css

# Precompile Rails assets
rails assets:precompile
```

### Environment Configuration

#### Development

- Source maps enabled
- Hot reloading
- Verbose error messages
- Development React build

#### Production

- Minified bundles
- Optimized assets
- Error boundaries
- Production React build

### Deployment Checklist

1. **Code Quality**

   - [ ] All tests passing
   - [ ] 100% test coverage maintained
   - [ ] No console errors or warnings
   - [ ] Code reviewed and approved

2. **Performance**

   - [ ] Bundle size optimized
   - [ ] Images compressed
   - [ ] Lazy loading implemented
   - [ ] Performance metrics meet targets

3. **Security**

   - [ ] CSRF protection enabled
   - [ ] XSS prevention measures
   - [ ] Content Security Policy configured
   - [ ] Dependencies updated and secure

4. **Accessibility**
   - [ ] WCAG 2.1 AA compliance
   - [ ] Screen reader tested
   - [ ] Keyboard navigation verified
   - [ ] Color contrast checked

---

## Conclusion

This frontend documentation provides a comprehensive overview of the PopMenu project's React implementation, demonstrating the technical skills and attention to detail expected by prospective employers. The architecture emphasizes maintainability, testability, and scalability - key qualities for production applications.

The component-based structure, comprehensive testing strategy, and clear development guidelines showcase best practices in modern React development while maintaining the simplicity and clarity valued in interview projects.
