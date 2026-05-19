# Champion List Component

Angular standalone component for displaying a paginated, filterable list of League of Legends champions.

## Features

- **Data Merging**: Combines champions from Data Dragon API with custom entries from json-server
- **Client-side Filtering**: Filter by champion name (search) and role (Fighter, Mage, Assassin, Tank, Support, Marksman)
- **Pagination**: Displays 30 champions per page with navigation controls
- **Loading & Error States**: Shows appropriate messaging during data fetching
- **Responsive Grid**: Champion cards with images and clickable links to detail pages

## Component Files

### `champion-list.component.ts`
Main component that:
- Fetches champions from both Data Dragon API (via `DataDragonService`) and json-server
- Merges data with json-server entries taking precedence (custom data overrides)
- Implements reactive filtering using Angular signals and effects
- Manages pagination state

### `pagination.component.ts`
Standalone pagination component with:
- First/Previous/Next/Last page navigation buttons
- Current page indicator
- Disabled states for boundary pages

### `data-dragon.service.ts`
Service for Data Dragon API access:
- Fetches current API version
- Retrieves all champions or individual champion details
- Generates champion image URLs

## Services Used

- **DataDragonService**: Fetches champions from Riot's Data Dragon CDN
- **JsonServerService**: Accesses local json-server for custom champion data
- **HttpClient**: Handles HTTP requests

## Reactive Architecture

Uses Angular signals for state management:
- `ddChampions`: Data Dragon champions array
- `serverChampions`: Custom server champions
- `loading`: Loading state flag
- `error`: Error message
- `searchText`: Search filter (bound to input)
- `selectedRole`: Role filter (bound to dropdown)
- `currentPage`: Current pagination page
- `mergedChampions`: Computed merged data
- `filteredChampions`: Computed filtered results
- `paginatedChampions`: Computed paginated results

## CSS Classes

The component uses these CSS classes (from `app/src/index.css`):
- `.page`: Main page wrapper
- `.filters-bar`: Container for search and role filters
- `.champion-grid`: CSS Grid for champion cards (auto-fill layout)
- `.champion-card`: Individual champion card link
- `.champion-card-name`: Champion name text
- `.loading-msg`: Loading state message
- `.error-msg`: Error state message
- `.pagination`: Pagination controls container

## Routing

Route: `/champions`
Default: Redirects to `/champions`

## Data Flow

1. Component loads → fetches from both sources
2. Data merged (server overrides DD)
3. User interacts with filters → signals update
4. Effects recalculate merged → filtered → paginated data
5. Template renders current page

## Configuration

- **PER_PAGE**: 30 champions per page
- **ROLES**: ['Fighter', 'Mage', 'Assassin', 'Tank', 'Support', 'Marksman']
- **JSON Server URL**: http://localhost:3000/champions

## Imports

The component requires:
- CommonModule (for *ngIf, *ngFor)
- RouterLink (for navigation)
- HttpClientModule (for HTTP calls)
- FormsModule (for two-way binding with [(ngModel)])
- PaginationComponent (child component)
