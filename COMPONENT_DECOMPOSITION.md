# Component Decomposition Summary

This document outlines the refactoring done to decompose monolithic page components into smaller, reusable components.

## Shared Components

### `components/shared/badges.tsx`
- **SeverityBadge**: Renders severity level badges (Critical, High, Medium, Low)
- **StatusBadge**: Renders status badges (Investigating, In Review, Approved, Draft, Submitted, Closed)
- **Badge**: Generic badge component with custom styling
- **SEVERITY_STYLES**: Constant styling map for severity levels
- **STATUS_STYLES**: Constant styling map for status levels

## Dashboard Components

**Page**: `pages/Dashboard.tsx` - Refactored to use composable sub-components

### `components/dashboard/DashboardHeader.tsx`
- Displays page title, date, and "New Incident" button
- Responsible for header layout and navigation

### `components/dashboard/KpiCard.tsx`
- Displays a single KPI (Key Performance Indicator) card
- Shows label, value, delta, trend direction, and icon
- Used in grid layout for multiple KPIs

### `components/dashboard/RecentInvestigationsTable.tsx`
- Renders table of recent investigations
- Displays: ID, Device, Severity, Status, Reviewer, Updated
- Includes row click navigation to investigation detail
- Responsive design with hidden columns on smaller screens

### `components/dashboard/AgentActivityFeed.tsx`
- Live agent activity feed with scrollable content
- Shows agent name, action, status (active/done), and time
- Color-coded by agent type
- Displays "Live" indicator with pulsing dot

### `components/dashboard/QuickActionsPanel.tsx`
- Three quick action buttons for common tasks
- Actions: Submit New Incident, Review Pending Cases, View Critical Alerts
- Accent styling on primary action

## Incident Reporting Components

**Page**: `pages/NewIncident.tsx` - Refactored to use form sub-components

### `components/incidents/FormSection.tsx`
- **FormSection**: Container for grouped form fields with header
- **FormField**: Label + required indicator + input wrapper

### `components/incidents/FileUploadArea.tsx`
- Drag-and-drop file upload interface
- Shows uploaded files with size and delete button
- Handles file input via click or drag events

### `components/incidents/AiClassificationPanel.tsx`
- AI severity classification interface
- Three states: initial (button), classifying (spinner), classified (results)
- Displays severity, confidence %, reasoning, and regulatory alert
- Sticky positioning for sidebar

### `components/incidents/PreviousReviewsPanel.tsx`
- Displays history of previous incident reviews
- Shows agent conclusion and human feedback for each review
- Collapsible review cards with severity color-coding
- Text area to add new human review at bottom

## Investigations List Components

**Page**: `pages/Investigations.tsx` - Refactored to use table and filter components

### `components/investigations/InvestigationsHeader.tsx`
- Page title, investigation count, and "New Incident" button
- Responsive header layout

### `components/investigations/FilterSelect.tsx`
- Styled select dropdown for severity and status filters
- Includes custom chevron icon
- Reusable across multiple filter scenarios

### `components/investigations/InvestigationsTable.tsx`
- Main investigations table with sorting and filtering
- Columns: ID, Device, Severity, Status, Reviewer, Created, Updated
- Click row to navigate to investigation detail
- Includes pagination controls at bottom
- **PaginationControls**: Pagination UI (page numbers, prev/next buttons)

## Investigation Workspace Components

**Page**: `pages/InvestigationWorkspace.tsx` - Heavily refactored for tab-based interface

### `components/workspace/InvestigationHeader.tsx`
- Shows investigation ID, severity badge, status badge
- Device name, manufacturer, facility
- Export and Review action buttons

### `components/workspace/TabNavigation.tsx`
- Tab navigation for: Overview, Agent Activity, Graph, Review, Report, Audit
- Icons for each tab
- Active tab indicator

### `components/workspace/PanelSection.tsx`
- **PanelSection**: Container for grouped information with title
- **Detail**: Label + value display for incident details
- **FindingItem**: Bullet point with colored dot for finding items

### `components/workspace/AgentCard.tsx`
- Card displaying single agent info
- Shows agent icon, name, status indicator, and summary
- Color-coded by agent type

### `components/workspace/MsgBubble.tsx`
- Agent message/event bubble
- Displays: agent name, timestamp, message type, message text
- Color-coded by message type (info, dispatch, tool, result, alert, complete)
- Type badge indicator

### `components/workspace/tabs/index.ts`
Exports for all tab components (see below)

### `components/workspace/tabs/OverviewTab.tsx`
- Three-column layout: Incident details | Agent feed | Findings
- Left panel: Incident Details + Device Information
- Center panel: Live Agent Activity feed
- Right panel: Root Cause Hypotheses, Regulatory/Clinical/Technical/Risk Findings

### `components/workspace/tabs/GraphTab.tsx`
- LangGraph workflow visualization
- SVG-based directed graph showing agent coordination
- Agent nodes with color-coding and status indicators
- Start/end circle nodes
- Agent cards grid below graph

### `components/workspace/tabs/ReviewTab.tsx`
- Placeholder (to be extracted from original InvestigationWorkspace)
- Review decision UI and recommendation details

### `components/workspace/tabs/ReportTab.tsx`
- Placeholder (to be extracted from original InvestigationWorkspace)
- Investigation report content and export options

### `components/workspace/tabs/AuditTab.tsx`
- Placeholder (to be extracted from original InvestigationWorkspace)
- Audit log table with timestamp, actor, type, action

## Data Organization

### `data/investigationData.ts`
Centralized data constants used in InvestigationWorkspace:
- **INCIDENT**: Investigation details object
- **ALL_MESSAGES**: Array of agent messages for feed
- **AGENTS**: Array of agent objects with metadata
- **HYPOTHESES**: Array of hypothesis objects with confidence scores

## Benefits of Refactoring

1. **Reusability**: Components can be used in multiple contexts (e.g., SeverityBadge in dashboard and investigations)
2. **Maintainability**: Smaller, focused components are easier to understand and modify
3. **Testability**: Individual components can be tested in isolation
4. **Scalability**: New features can reuse existing components
5. **Code Organization**: Clear separation of concerns with dedicated files
6. **Props Interface**: Clear component APIs make usage patterns obvious

## Notes for Future Enhancement

- **ReviewTab, ReportTab, AuditTab**: Currently placeholders; extract their full implementations from the original InvestigationWorkspace
- **Data Management**: Consider moving investigation data to a state management solution (Redux, Context, etc.) for larger apps
- **Component Library**: These components form the foundation of a reusable UI library
- **Styling**: All components use Tailwind CSS; consider extracting repeated utility patterns into custom classes
