# Snapshot UI — Code-First Reference

Complete component API, hooks, and Jeopardy API reference for writing React/TypeScript with the Snapshot UI library.

---

## Setup

```tsx
import { ComponentName } from '@lastshotlabs/snapshot/ui'
```

### Two component tiers

**`*Base` components** — pure React, plain props, no context required. Use these for most work.

**Feature components** (e.g. `StatCardBase`, `DataTableBase`) — take focused props for app-owned data, callbacks, loading state, slots, and styling. Use these when you want richer UI without handing control to a generated runtime.

### Token setup (call once at app root)

```tsx
import { resolveTokens, injectStyleSheet } from '@lastshotlabs/snapshot/ui'

injectStyleSheet(resolveTokens({ flavor: 'neutral' }))
// Other built-in flavors: 'slate', 'rose', 'blue', 'green', 'orange', 'violet'
```

---

## Design Tokens

Never hardcode colors, spacing, or sizes. Always use CSS custom properties.

**Colors**
```
var(--sn-color-primary)               var(--sn-color-primary-foreground)
var(--sn-color-secondary)             var(--sn-color-secondary-foreground)
var(--sn-color-muted)                 var(--sn-color-muted-foreground)
var(--sn-color-accent)                var(--sn-color-accent-foreground)
var(--sn-color-destructive)           var(--sn-color-destructive-foreground)
var(--sn-color-success)               var(--sn-color-success-foreground)
var(--sn-color-warning)               var(--sn-color-warning-foreground)
var(--sn-color-info)                  var(--sn-color-info-foreground)
var(--sn-color-background)            var(--sn-color-foreground)
var(--sn-color-card)                  var(--sn-color-card-foreground)
var(--sn-color-border)
var(--sn-color-input)
var(--sn-color-ring)
var(--sn-chart-1) … var(--sn-chart-5)
```

**Spacing:** `var(--sn-spacing-2xs/xs/sm/md/lg/xl/2xl/3xl)`  
**Radius:** `var(--sn-radius-none/xs/sm/md/lg/xl/full)`  
**Font size:** `var(--sn-font-size-xs/sm/md/lg/xl/2xl/3xl/4xl)`  
**Font weight:** `var(--sn-font-weight-light/normal/medium/semibold/bold)`  
**Shadow:** `var(--sn-shadow-none/xs/sm/md/lg/xl)`  
**Duration:** `var(--sn-duration-instant/fast/normal/slow)`

---

## Layout

### `RowBase`
```tsx
interface RowBaseProps {
  children: ReactNode
  gap?: string                                          // token name or CSS value
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  align?: 'start' | 'center' | 'end' | 'stretch'
  wrap?: boolean
  overflow?: string
  maxHeight?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

<RowBase gap="md" justify="between" align="center">...</RowBase>
```

### `ColumnBase`
```tsx
interface ColumnBaseProps {
  children?: ReactNode
  gap?: string
  align?: string
  justify?: string
  overflow?: string
  maxHeight?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `StackBase`
```tsx
interface StackBaseProps {
  children: ReactNode
  gap?: string
  align?: 'start' | 'center' | 'end' | 'stretch'
  maxWidth?: string
  overflow?: string
  id?: string; className?: string; style?: CSSProperties
}
```

### `BoxBase`
```tsx
interface BoxBaseProps {
  children?: ReactNode
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ContainerBase`
```tsx
interface ContainerBaseProps {
  children?: ReactNode
  center?: boolean
  padding?: string
  // maxWidth via style or tokens
  id?: string; className?: string; style?: CSSProperties
}
```

### `GridBase`
```tsx
interface GridBaseProps {
  children?: ReactNode
  columns?: number | string    // e.g. 3 or "repeat(3, 1fr)"
  rows?: string
  areas?: string[]
  gap?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SectionBase`
```tsx
interface SectionBaseProps {
  children?: ReactNode
  height?: string
  align?: string
  justify?: string
  bleed?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SpacerBase`
```tsx
interface SpacerBaseProps {
  flex?: string | number
  axis?: 'x' | 'y'
  id?: string; className?: string; style?: CSSProperties
}
```

### `SplitPaneBase`
```tsx
interface SplitPaneBaseProps {
  children: [ReactNode, ReactNode]
  direction?: 'horizontal' | 'vertical'
  defaultSplit?: number       // percentage, e.g. 50
  minSize?: number            // px
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CollapsibleBase`
```tsx
interface CollapsibleBaseProps {
  children?: ReactNode
  trigger?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  duration?: string
  onOpenChange?: (open: boolean) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `Card` / `CardBase`
```tsx
// CardBase: plain props
<CardBase title="Match Details" subtitle="Round 1">
  {children}
</CardBase>

// CardBase with slots for targeted styling
<CardBase title="Match" slots={{ root: { className: "match-card" } }}>
  {children}
</CardBase>
```

### `Layout` (page shell)
```tsx
<Layout config={{
  variant: 'sidebar',        // 'sidebar' | 'top-nav' | 'minimal' | 'full-width'
  sidebarWidth: 240,
}} />
```

### `Nav` / navigation sub-components
```tsx
import { Nav, NavLinkBase, NavLogoBase, NavSectionBase,
         NavSearchBase, NavDropdownBase, NavUserMenuBase } from '@lastshotlabs/snapshot/ui'

<Nav config={{
  logo: { text: 'Jeopardy', path: '/' },
  items: [
    { type: 'nav-link', label: 'Matches', path: '/matches', icon: 'trophy' },
    { type: 'nav-section', label: 'Library', items: [...] },
  ],
  userMenu: { name: user.name, avatar: user.avatarUrl, items: [...] },
}} />

// Nav sub-components:
interface NavLogoBaseProps {
  text?: string; src?: string; path?: string; logoHeight?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

interface NavLinkBaseProps {
  label: string; path: string; icon?: string; badge?: string | number
  active?: boolean; disabled?: boolean; external?: boolean
  matchChildren?: boolean; authenticated?: boolean; roles?: string[]
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

interface NavSectionBaseProps {
  label?: string; collapsible?: boolean; defaultCollapsed?: boolean
  children?: ReactNode
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

interface NavSearchBaseProps {
  placeholder?: string; shortcut?: string
  onSearch?: (value: string) => void
  onValueChange?: (value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

interface NavDropdownBaseProps {
  label?: string; icon?: string; current?: boolean; disabled?: boolean
  align?: 'start' | 'end'; trigger?: 'click' | 'hover'; width?: string
  children?: ReactNode
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

interface NavUserMenuBaseItem { label: string; icon?: string; onClick?: () => void; destructive?: boolean }
interface NavUserMenuBaseProps {
  name?: string; email?: string; avatar?: string; initials?: string
  items?: NavUserMenuBaseItem[]
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `Outlet`
Router outlet placeholder — no props needed.

---

## Data Display

### `StatCardBase`
```tsx
interface StatCardTrend {
  direction: 'up' | 'down' | 'flat'
  value: string            // formatted, e.g. "+12%"
  percentage: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface StatCardBaseProps {
  label: string
  value: string | null
  isLoading?: boolean
  error?: string | null
  icon?: string
  iconColor?: string
  loadingVariant?: 'skeleton' | 'pulse'
  trend?: StatCardTrend | null
  onClick?: () => void
  emptyMessage?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

<StatCardBase label="Active Matches" value="12" icon="trophy"
  trend={{ direction: 'up', value: '+3', percentage: 33, sentiment: 'positive' }} />
```

### `DataTableBase` + `useDataTable`
```tsx
interface DataTableBaseColumn {
  field: string
  label: string
  sortable?: boolean
  format?: 'date' | 'number' | 'currency' | 'badge' | 'boolean' | 'avatar' | 'progress' | 'link' | 'code'
  badgeColors?: Record<string, string>    // value → color token e.g. { active: 'success' }
  avatarField?: string                    // sibling field for avatar src
  linkTextField?: string
  divisor?: number
  prefix?: string; suffix?: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableBasePagination {
  currentPage: number; totalPages: number
  pageSize: number; totalRows: number
}

// useDataTable — handles sort / filter / pagination state
const {
  rows,           // Record<string, unknown>[] — current page data
  columns,        // ResolvedColumn[]
  sort,           // { column: string; direction: 'asc' | 'desc' } | null
  pagination,     // PaginationState
  onSort,         // (column: string) => void
  onPageChange,   // (page: number) => void
  onSearch,       // (query: string) => void
  selectedRows,   // Record<string, unknown>[]
  onSelectRow,    // (row, selected) => void
  onSelectAll,    // (selected) => void
} = useDataTable({
  data: matches,
  columns: [
    { field: 'title', label: 'Title', sortable: true },
    { field: 'status', label: 'Status', format: 'badge',
      badgeColors: { active: 'success', draft: 'secondary', archived: 'muted' } },
    { field: 'createdAt', label: 'Created', format: 'date', sortable: true },
  ],
  defaultSort: { column: 'createdAt', direction: 'desc' },
  pageSize: 20,
})

<DataTableBase
  rows={rows}
  columns={columns}
  sort={sort}
  pagination={pagination}
  onSort={onSort}
  onPageChange={onPageChange}
  onSearch={onSearch}
  selectable
  selectedRows={selectedRows}
  onSelectRow={onSelectRow}
  onSelectAll={onSelectAll}
  onRowClick={(row) => navigate(`/matches/${row.id}`)}
  isLoading={isLoading}
  emptyMessage="No matches found"
  density="default"           // 'compact' | 'default' | 'comfortable'
/>
```

### `DetailCardBase` + `useDetailCard`
```tsx
interface DetailCardBaseField {
  field: string; label: string; value: unknown
  format?: 'text' | 'boolean' | 'date' | 'datetime' | 'number' | 'currency'
         | 'badge' | 'email' | 'url' | 'link' | 'image' | 'list'
  copyable?: boolean; divisor?: number
  slots?: Record<string, Record<string, unknown>>
}

interface DetailCardBaseAction {
  label: string; icon?: string
  onAction: () => void
  slots?: Record<string, Record<string, unknown>>
}

interface DetailCardBaseProps {
  data: Record<string, unknown> | null
  fields: DetailCardBaseField[]
  title?: string
  actions?: DetailCardBaseAction[]
  isLoading?: boolean; error?: ReactNode; emptyMessage?: string
  loadingContent?: ReactNode
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

// useDetailCard — fetches + resolves fields from a config
const { data, fields, title, isLoading, error, refetch } = useDetailCard({
  data: 'GET /api/matches/:id',
  params: { id: matchId },
  fields: 'auto',
})

<DetailCardBase
  data={data}
  fields={fields}
  title={title}
  isLoading={isLoading}
  actions={[{ label: 'Start', icon: 'play', onAction: startMatch }]}
/>
```

### `ListBase`
```tsx
interface ListBaseItem {
  id: string
  title: string
  description?: string
  avatar?: string
  badge?: string | number
  onClick?: () => void
  slots?: Record<string, Record<string, unknown>>
}

interface ListBaseProps {
  items: ListBaseItem[]
  divider?: boolean
  isLoading?: boolean; error?: ReactNode; emptyMessage?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

<ListBase items={players.map(p => ({
  id: p.id, title: p.displayName, description: p.role,
  badge: p.score.toLocaleString(),
}))} divider />
```

### `Feed` / `FeedBase`
```tsx
// Config-driven (fetches its own data):
<Feed config={{
  data: 'GET /api/matches/:id/replay',
  params: { id: matchId },
  avatar: 'playerAvatar', title: 'action',
  description: 'details', timestamp: 'createdAt',
  relativeTime: true, pageSize: 20,
  poll: { interval: 5000 },
}} />
```

### `Chart` / `ChartBase`
```tsx
import type { ChartConfig, SeriesConfig } from '@lastshotlabs/snapshot/ui'

<Chart config={{
  chartType: 'bar',    // 'bar'|'line'|'area'|'pie'|'donut'|'sparkline'|'radar'|'scatter'|'treemap'|'funnel'
  data: scoreHistory,  // or 'GET /api/...'
  xKey: 'displayName',
  series: [{ key: 'score', label: 'Score', color: 'primary' }],
  height: 300,
  legend: true, grid: true, tooltip: true,
}} />
```

### `BadgeBase`
```tsx
interface BadgeBaseProps {
  label: string
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline'
  icon?: string; size?: 'sm' | 'md'; rounded?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

<BadgeBase label="Active" variant="success" />
<BadgeBase label="Final Jeopardy" variant="warning" icon="star" />
```

### `AvatarBase`
```tsx
interface AvatarBaseProps {
  src?: string; name?: string; alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  status?: 'online' | 'offline' | 'busy' | 'away'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `AvatarGroupBase`
```tsx
interface AvatarGroupBaseProps {
  items: { src?: string; name?: string }[]
  max?: number; size?: 'xs' | 'sm' | 'md' | 'lg'
  overlap?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `AlertBase`
```tsx
interface AlertBaseProps {
  title?: string; description?: string; icon?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  dismissible?: boolean; onDismiss?: () => void
  actionLabel?: string; onAction?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ProgressBase`
```tsx
interface ProgressBaseProps {
  value: number              // 0–100
  max?: number; label?: string; showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SkeletonBase`
```tsx
interface SkeletonBaseProps {
  lines?: number; width?: string; height?: string
  variant?: 'text' | 'circle' | 'rect'
  animated?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `EmptyStateBase`
```tsx
interface EmptyStateBaseProps {
  title: string; description?: string; icon?: string; iconColor?: string
  size?: 'sm' | 'md' | 'lg'
  actionLabel?: string; onAction?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TooltipBase`
```tsx
interface TooltipBaseProps {
  text: string; children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ScrollAreaBase`
```tsx
interface ScrollAreaBaseProps {
  children?: ReactNode
  orientation?: 'vertical' | 'horizontal' | 'both'
  maxHeight?: string; maxWidth?: string
  showScrollbar?: 'auto' | 'always' | 'hover'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `FilterBarBase`
```tsx
interface FilterBarFilter {
  key: string; label: string
  type: 'select' | 'text' | 'date'
  options?: string[]
}

interface FilterBarBaseProps {
  filters: FilterBarFilter[]
  showSearch?: boolean; searchPlaceholder?: string
  onChange?: (state: { search: string; filters: Record<string, string> }) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `EntityPickerBase`
```tsx
interface EntityPickerEntity { id: string; label: string; avatar?: string; description?: string }

interface EntityPickerBaseProps {
  entities: EntityPickerEntity[]
  value?: string | string[]; label?: string
  multiple?: boolean; searchable?: boolean; maxHeight?: string
  isLoading?: boolean; error?: string
  onChange?: (value: string | string[]) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `HighlightedTextBase`
```tsx
interface HighlightedTextBaseProps {
  text: string; highlight?: string
  caseSensitive?: boolean; highlightColor?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `FavoriteButtonBase`
```tsx
interface FavoriteButtonBaseProps {
  active?: boolean; size?: 'sm' | 'md' | 'lg'
  onToggle?: (active: boolean) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `NotificationBellBase`
```tsx
interface NotificationBellBaseProps {
  count?: number; max?: number; size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  ariaLive?: 'polite' | 'assertive' | 'off'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SaveIndicatorBase`
```tsx
interface SaveIndicatorBaseProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  showIcon?: boolean
  savingText?: string; savedText?: string; errorText?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `VoteBase`
```tsx
interface VoteBaseProps {
  value?: number
  onUpvote?: () => void; onDownvote?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SeparatorBase`
```tsx
interface SeparatorBaseProps {
  orientation?: 'horizontal' | 'vertical'; label?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `KanbanBase`
```tsx
interface KanbanColumnEntry {
  key: string; title: string; color?: string; limit?: number
  slots?: Record<string, Record<string, unknown>>
}

interface KanbanBaseProps {
  columns: KanbanColumnEntry[]
  items: Record<string, unknown>[]
  loading?: boolean; error?: { message: string } | null
  columnField?: string          // default: 'status'
  titleField?: string           // default: 'title'
  descriptionField?: string; assigneeField?: string; priorityField?: string
  sortable?: boolean; emptyMessage?: string
  onCardClick?: (item: Record<string, unknown>) => void
  onReorder?: (payload: { id: string | number; columnKey: string; position: number; item: Record<string, unknown> }) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CalendarBase`
```tsx
interface CalendarEventEntry {
  title: string; date: Date; endDate?: Date
  color: string; allDay: boolean
  raw: Record<string, unknown>
}

interface CalendarBaseProps {
  view?: 'month' | 'week'
  events?: CalendarEventEntry[]
  loading?: boolean; error?: { message: string } | null
  todayLabel?: string; showWeekNumbers?: boolean
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEventEntry) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `AuditLogBase`
```tsx
interface AuditLogFilterEntry { field: string; label: string; options: string[] }

interface AuditLogBaseProps {
  items: Record<string, unknown>[]
  loading?: boolean; error?: { message: string } | null
  userField?: string; actionField?: string; timestampField?: string; detailsField?: string
  filters?: AuditLogFilterEntry[]
  pagination?: false | number       // false = off, number = pageSize. Default: 20
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `NotificationFeedBase`
```tsx
interface NotificationFeedBaseProps {
  items: Record<string, unknown>[]
  loading?: boolean; error?: { message: string } | null
  titleField?: string; messageField?: string; timestampField?: string
  readField?: string; typeField?: string   // type: 'info'|'success'|'warning'|'error'
  showMarkAllRead?: boolean; maxHeight?: string; emptyMessage?: string
  clickable?: boolean
  onItemClick?: (item: Record<string, unknown>) => void
  onMarkAllRead?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Forms & Inputs

### `AutoForm` + `useAutoForm`
```tsx
// Config-driven (simplest):
<AutoForm config={{
  submit: 'POST /api/matches',
  fields: [
    { key: 'title', label: 'Title', inputType: 'text', required: true },
    { key: 'visibility', label: 'Visibility', inputType: 'select',
      options: ['private', 'public', 'protected'] },
  ],
  submitLabel: 'Create Match',
  onSuccess: (result) => navigate(`/matches/${result.id}`),
}} />

// Headless:
const { values, errors, handleChange, handleSubmit, isSubmitting, reset } = useAutoForm({
  fields: [{ key: 'title', label: 'Title', inputType: 'text', required: true }],
  onSubmit: async (values) => {
    const match = await api.post('/api/matches', values)
    navigate(`/matches/${match.id}`)
  },
})
```

### `Button` / `ButtonBase`
```tsx
interface ButtonBaseProps {
  label: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  icon?: string; iconPosition?: 'left' | 'right'
  disabled?: boolean; fullWidth?: boolean; isLoading?: boolean
  onClick?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

<ButtonBase label="Start Match" variant="default" icon="play" onClick={startMatch} />
<ButtonBase label="End Match" variant="destructive" onClick={endMatch} />
```

### `IconButtonBase`
```tsx
interface IconButtonBaseProps {
  icon: string; ariaLabel: string
  tooltip?: string; size?: 'sm' | 'md' | 'lg'
  shape?: 'square' | 'circle'; disabled?: boolean
  onClick?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `InputField`
```tsx
interface InputFieldProps {
  label?: string; placeholder?: string; value?: string
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  required?: boolean; disabled?: boolean; readonly?: boolean
  maxLength?: number; pattern?: string
  helperText?: string; errorText?: string; icon?: string
  onChange?: (value: string) => void
  onBlur?: () => void; onFocus?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TextareaField`
```tsx
interface TextareaFieldProps {
  label?: string; placeholder?: string; value?: string
  required?: boolean; disabled?: boolean; readonly?: boolean
  maxLength?: number; helperText?: string; errorText?: string
  rows?: number
  onChange?: (value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SelectField`
```tsx
interface SelectFieldProps {
  label?: string; placeholder?: string
  options?: string[] | { label: string; value: string }[]
  value?: string; defaultValue?: string
  disabled?: boolean; searchable?: boolean; clearable?: boolean; multiple?: boolean
  loading?: boolean; error?: string | null
  onChange?: (value: string | string[]) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `MultiSelectField`
```tsx
interface MultiSelectFieldOption { label: string; value: string; description?: string }

interface MultiSelectFieldProps {
  label?: string; placeholder?: string
  options?: MultiSelectFieldOption[]
  value?: string[]; defaultValue?: string[]
  disabled?: boolean; searchable?: boolean; maxSelected?: number
  loading?: boolean; error?: string | null
  onChange?: (value: string[]) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `DatePickerField`
```tsx
interface DatePickerPreset { label: string; start: string; end: string }
interface DatePickerDisabledEntry { dayOfWeek: number[] }

interface DatePickerFieldProps {
  label?: string; placeholder?: string
  mode?: 'single' | 'range' | 'multiple'
  format?: string           // display format
  valueFormat?: 'iso' | 'unix' | 'locale'
  min?: string; max?: string    // YYYY-MM-DD
  presets?: DatePickerPreset[]
  disabledDates?: (string | DatePickerDisabledEntry)[]
  onChange?: (value: unknown) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SliderField`
```tsx
interface SliderFieldProps {
  label?: string; value?: number | [number, number]
  min?: number; max?: number; step?: number
  range?: boolean; showValue?: boolean; showLimits?: boolean; disabled?: boolean
  onChange?: (value: number | [number, number]) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `SwitchField`
```tsx
interface SwitchFieldProps {
  label?: string; description?: string
  checked?: boolean; defaultChecked?: boolean
  disabled?: boolean; size?: 'sm' | 'md' | 'lg'
  color?: string
  onChange?: (checked: boolean) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ToggleField`
```tsx
interface ToggleFieldProps {
  label?: string; icon?: string
  variant?: 'outline' | 'default'; size?: 'sm' | 'md' | 'lg'
  pressed?: boolean; defaultPressed?: boolean; disabled?: boolean
  onChange?: (pressed: boolean) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ToggleGroupBase`
```tsx
interface ToggleGroupItem { value: string; label?: string; icon?: string; disabled?: boolean }

interface ToggleGroupBaseProps {
  items: ToggleGroupItem[]
  value?: string | string[]; defaultValue?: string | string[]
  mode?: 'single' | 'multiple'; size?: 'sm' | 'md' | 'lg'; disabled?: boolean
  onChange?: (value: string | string[]) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ColorPickerField`
```tsx
interface ColorPickerFieldProps {
  label?: string; defaultValue?: string
  format?: 'hex' | 'rgb' | 'hsl'
  showAlpha?: boolean; allowCustom?: boolean; swatches?: string[]
  onChange?: (value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TagSelectorField`
```tsx
interface TagSelectorTag { value: string; label: string; color?: string }

interface TagSelectorFieldProps {
  label?: string
  tags?: TagSelectorTag[]
  value?: string[]; defaultValue?: string[]
  allowCreate?: boolean; maxTags?: number
  onChange?: (values: string[]) => void
  onCreate?: (label: string, value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `InlineEditField`
```tsx
interface InlineEditFieldProps {
  value?: string; placeholder?: string
  inputType?: 'text' | 'email' | 'number' | 'url'
  cancelOnEscape?: boolean; fontSize?: string
  onSave?: (value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `QuickAddField`
```tsx
interface QuickAddFieldProps {
  placeholder?: string; icon?: string
  submitOnEnter?: boolean; showButton?: boolean
  buttonText?: string; clearOnSubmit?: boolean
  onSubmit?: (value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `LocationInputField`
```tsx
interface LocationResult { address: string; lat?: number; lng?: number; placeId?: string }

interface LocationInputFieldProps {
  label?: string; placeholder?: string; helperText?: string; errorText?: string
  required?: boolean; disabled?: boolean; value?: string
  results?: LocationResult[]; loading?: boolean
  onSearch?: (query: string) => void
  onSelect?: (location: LocationResult) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `Wizard` + `useWizard`
```tsx
// Config-driven:
<Wizard config={{
  steps: [
    { label: 'Rules', components: [...] },
    { label: 'Board', components: [...] },
    { label: 'Players', components: [...] },
  ],
  onComplete: (allValues) => createMatch(allValues),
}} />

// Headless:
const {
  currentStep, totalSteps, next, prev,
  canNext, canPrev, isLast, allValues,
  goToStep,
} = useWizard({ steps: ['rules', 'board', 'players'] })
```

---

## Navigation

### `TabsBase` / `TabsComponent`
```tsx
interface TabsBaseTab { value: string; label: string; icon?: string; badge?: string | number; disabled?: boolean }

interface TabsBaseProps {
  tabs: TabsBaseTab[]
  value?: string; defaultValue?: string
  variant?: 'default' | 'underline' | 'pills'
  onChange?: (value: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `AccordionBase`
```tsx
interface AccordionBaseItem { label: string; content?: ReactNode; disabled?: boolean }

interface AccordionBaseProps {
  items: AccordionBaseItem[]
  mode?: 'single' | 'multiple'; defaultOpen?: string[]
  icon?: string; iconPosition?: 'left' | 'right'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `BreadcrumbBase`
```tsx
interface BreadcrumbBaseItem { label: string; path?: string; icon?: string }

interface BreadcrumbBaseProps {
  items: BreadcrumbBaseItem[]
  maxItems?: number; includeHome?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `StepperBase`
```tsx
interface StepperBaseStep { label: string; description?: string; icon?: string; error?: boolean }

interface StepperBaseProps {
  steps: StepperBaseStep[]
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  clickable?: boolean; disabled?: boolean
  onStepClick?: (index: number) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TreeViewBase`
```tsx
interface TreeViewBaseItem {
  id: string; label: string; icon?: string; badge?: string | number
  disabled?: boolean; children?: TreeViewBaseItem[]
}

interface TreeViewBaseProps {
  items: TreeViewBaseItem[]
  selectable?: boolean; multiSelect?: boolean
  showIcon?: boolean; showConnectors?: boolean
  onSelect?: (value: string) => void
  emptyMessage?: string; isLoading?: boolean; error?: ReactNode
  onRetry?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `PrefetchLinkBase`
```tsx
interface PrefetchLinkBaseProps {
  to: string; children?: ReactNode
  prefetch?: 'hover' | 'visible' | 'viewport' | 'eager' | 'none'
  target?: string; rel?: string
  onPrefetch?: (to: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Overlays

### `ModalComponent` / `ModalBase` + `useModalManager`
```tsx
// Imperative:
const modal = useModalManager()
modal.open('create-match')
modal.close('create-match')

// Config-driven:
<ModalComponent config={{
  id: 'create-match',
  title: 'Create Match',
  size: 'md',              // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  content: [...],
  footer: [
    { label: 'Cancel', variant: 'outline', action: { type: 'close-modal', modal: 'create-match' } },
    { label: 'Create', action: { type: 'api', method: 'POST', endpoint: '/api/matches' } },
  ],
}} />
```

### `DrawerComponent` / `DrawerBase`
```tsx
<DrawerComponent config={{
  id: 'player-details',
  title: 'Player',
  side: 'right',           // 'left' | 'right'
  size: 'md',
  content: [...],
}} />
```

### `PopoverBase`
```tsx
interface PopoverBaseProps {
  trigger: ReactNode; children: ReactNode
  title?: string; description?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CommandPaletteBase`
```tsx
interface CommandPaletteBaseItem { label: string; description?: string; icon?: string; shortcut?: string; onSelect?: () => void }
interface CommandPaletteBaseGroup { label: string; items: CommandPaletteBaseItem[] }

interface CommandPaletteBaseProps {
  open: boolean; onClose: () => void
  groups?: CommandPaletteBaseGroup[]
  placeholder?: string; emptyMessage?: string; maxHeight?: string
  query?: string; onQueryChange?: (query: string) => void
  shortcutHint?: string
  onSelect?: (item: CommandPaletteBaseItem) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ContextMenuBase`
```tsx
interface ContextMenuBaseItem { label: string; icon?: string; disabled?: boolean; destructive?: boolean; onClick?: () => void }
type ContextMenuBaseEntry = ContextMenuBaseItem | { type: 'separator' }

interface ContextMenuBaseProps {
  items: ContextMenuBaseEntry[]; children?: ReactNode
  onSelect?: (item: ContextMenuBaseItem) => void
  onOpenChange?: (open: boolean) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `DropdownMenuBase`
```tsx
interface DropdownMenuBaseTrigger { label?: string; icon?: string }
interface DropdownMenuBaseItem { label: string; icon?: string; disabled?: boolean; destructive?: boolean; onClick?: () => void }
type DropdownMenuBaseEntry = DropdownMenuBaseItem | { type: 'separator' } | { type: 'label'; text: string }

interface DropdownMenuBaseProps {
  trigger: DropdownMenuBaseTrigger
  items: DropdownMenuBaseEntry[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  onSelect?: (item: DropdownMenuBaseItem, index: number) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `HoverCardBase`
```tsx
interface HoverCardBaseProps {
  trigger: ReactNode; children: ReactNode
  openDelay?: number; closeDelay?: number
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'; width?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `useToastManager` / `ToastContainer`
```tsx
// At root:
<ToastContainer />

// Anywhere:
const toast = useToastManager()
toast.show({ message: 'Correct!', variant: 'success' })
toast.show({ message: 'Wrong answer', variant: 'destructive', duration: 3000 })
toast.show({ message: 'Time is running out', variant: 'warning' })
```

### `useConfirmManager` / `ConfirmDialog`
```tsx
// At root:
<ConfirmDialog />

// Anywhere:
const confirm = useConfirmManager()
const confirmed = await confirm.ask({
  title: 'End match?',
  message: 'This will end the game for all players.',
  confirmLabel: 'End Match',
  cancelLabel: 'Cancel',
})
if (confirmed) endMatch()
```

---

## Content

### `HeadingBase`
```tsx
interface HeadingBaseProps {
  text: string; level?: 1 | 2 | 3 | 4 | 5 | 6
  align?: 'left' | 'center' | 'right'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TextBase`
```tsx
interface TextBaseProps {
  value?: string
  variant?: 'default' | 'muted' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `LinkBase`
```tsx
interface LinkBaseProps {
  text: string; to: string
  icon?: string; badge?: string
  external?: boolean; disabled?: boolean; current?: boolean
  align?: 'left' | 'center' | 'right'
  variant?: 'default' | 'muted' | 'button' | 'navigation'
  onNavigate?: (to: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `MarkdownBase`
```tsx
interface MarkdownBaseProps {
  content: string; maxHeight?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CodeBase`
```tsx
interface CodeBaseProps {
  value: string; fallback?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CodeBlockBase`
```tsx
interface CodeBlockBaseProps {
  code: string; language?: string; title?: string
  highlight?: number[]; showLineNumbers?: boolean; showCopy?: boolean
  maxHeight?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `RichTextEditorBase`
```tsx
interface RichTextEditorBaseProps {
  content?: string; placeholder?: string
  readonly?: boolean; mode?: 'edit' | 'preview' | 'split'
  toolbar?: boolean | string[]
  minHeight?: string; maxHeight?: string
  onChange?: (content: string) => void
  renderPreview?: (content: string) => ReactNode
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `RichInputBase`
```tsx
interface RichInputBaseProps {
  placeholder?: string; readonly?: boolean
  features?: string[]       // e.g. ['bold', 'italic', 'emoji', 'mention']
  sendOnEnter?: boolean; maxLength?: number
  minHeight?: string; maxHeight?: string; showSendButton?: boolean
  onSend?: (data: { html: string; text: string }) => void
  onChange?: (data: { html: string; text: string }) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `BannerBase`
```tsx
interface BannerBaseProps {
  children?: ReactNode; height?: string
  align?: 'left' | 'center' | 'right'
  background?: { image?: string; color?: string; overlay?: string }
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CompareViewBase`
```tsx
interface CompareViewBaseProps {
  left: string; right: string
  leftLabel?: string; rightLabel?: string
  maxHeight?: string; showLineNumbers?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `FileUploaderBase`
```tsx
interface UploadFileEntry { id: string; name: string; size: number; status: 'pending' | 'uploading' | 'done' | 'error'; progress?: number; error?: string }

interface FileUploaderBaseProps {
  variant?: 'dropzone' | 'button' | 'compact'
  label?: string; description?: string
  maxFiles?: number; maxSize?: number; accept?: string
  files?: UploadFileEntry[]
  onFilesAdded?: (files: File[]) => void
  onFileRemoved?: (id: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `LinkEmbedBase`
```tsx
interface LinkEmbedMeta {
  title?: string; description?: string; image?: string
  favicon?: string; siteName?: string; color?: string; html?: string
}

interface LinkEmbedBaseProps {
  url: string; meta?: LinkEmbedMeta
  allowIframe?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TimelineBase`
```tsx
interface TimelineItemEntry {
  id: string; title: string; description?: string
  timestamp?: string; icon?: string; color?: string
}

interface TimelineBaseProps {
  items: TimelineItemEntry[]
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `DividerBase`
```tsx
interface DividerBaseProps {
  label?: string; orientation?: 'horizontal' | 'vertical'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Communication

### `ChatWindowBase`
Composable chat shell — you bring the thread, input, and typing indicator.
```tsx
interface ChatWindowBaseProps {
  title?: string; subtitle?: string; showHeader?: boolean
  height?: string                    // default: 'clamp(300px, 70vh, 500px)'
  threadSlot: ReactNode              // e.g. <MessageThreadBase messages={...} />
  inputSlot: ReactNode               // e.g. <RichInputBase onSend={...} />
  typingSlot?: ReactNode             // e.g. <TypingIndicatorBase users={...} />
  showTypingIndicator?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}

<ChatWindowBase
  title="Game Chat"
  threadSlot={<MessageThreadBase messages={messages} contentField="text" />}
  typingSlot={<TypingIndicatorBase users={typingUsers} />}
  inputSlot={<RichInputBase sendOnEnter onSend={({ text }) => sendMessage(text)} />}
/>
```

### `MessageThreadBase`
```tsx
interface MessageThreadBaseProps {
  messages?: Record<string, unknown>[]
  loading?: boolean; error?: ReactNode; emptyText?: string
  contentField?: string           // default: 'content'
  authorNameField?: string        // default: 'author.name'
  authorAvatarField?: string      // default: 'author.avatar'
  timestampField?: string         // default: 'timestamp'
  embedsField?: string            // default: 'embeds'
  showTimestamps?: boolean; showEmbeds?: boolean; groupByDate?: boolean
  maxHeight?: string
  onMessageClick?: (message: Record<string, unknown>) => void
  renderEmbed?: (embed: Record<string, unknown>, index: number) => ReactNode
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CommentSectionBase`
```tsx
interface CommentSectionBaseProps {
  comments?: Record<string, unknown>[]
  loading?: boolean; error?: ReactNode; emptyText?: string
  authorNameField?: string; authorAvatarField?: string
  contentField?: string; timestampField?: string
  sortOrder?: 'newest' | 'oldest'
  showDelete?: boolean
  onDelete?: (comment: Record<string, unknown>) => void
  inputSlot?: ReactNode           // rendered at the bottom for new comments
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `EmojiPickerBase`
```tsx
interface EmojiPickerBaseProps {
  perRow?: number; maxHeight?: string; categories?: string[]
  customEmojis?: CustomEmoji[]
  onSelect?: (payload: { emoji: string; name: string; url?: string; shortcode?: string; isCustom: boolean }) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `GifPickerBase`
```tsx
interface GifEntry { id: string; url: string; preview?: string; title?: string; width?: number; height?: number }

interface GifPickerBaseProps {
  columns?: number; maxHeight?: string; placeholder?: string; attribution?: string
  gifs?: GifEntry[]; loading?: boolean
  onSelect?: (gif: GifEntry) => void
  onSearchChange?: (query: string) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `ReactionBarBase`
```tsx
interface ReactionEntry { emoji: string; count: number; active?: boolean }

interface ReactionBarBaseProps {
  reactions?: ReactionEntry[]
  showAddButton?: boolean
  onReactionClick?: (emoji: string, wasActive: boolean) => void
  onEmojiSelect?: (payload: { emoji: string; name: string; isCustom: boolean }) => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `PresenceIndicatorBase`
```tsx
interface PresenceIndicatorBaseProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'dnd'
  label?: string; showDot?: boolean; showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `TypingIndicatorBase`
```tsx
interface TypingUser { name: string; avatar?: string }

interface TypingIndicatorBaseProps {
  users: TypingUser[]; maxDisplay?: number
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Commerce

### `PricingTableBase`
```tsx
interface PricingFeatureEntry { text: string; included?: boolean }
interface PricingTierEntry {
  name: string; price: string | number; period?: string
  description?: string; badge?: string; highlighted?: boolean
  features: PricingFeatureEntry[]
  actionLabel?: string; onAction?: () => void
}

interface PricingTableBaseProps {
  tiers: PricingTierEntry[]
  variant?: 'cards' | 'table'; currency?: string; columns?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Media

### `SnapshotImageBase`
```tsx
interface SnapshotImageBaseProps {
  src: string; alt: string; width: number; height?: number
  quality?: number; format?: 'avif' | 'webp' | 'jpeg' | 'png' | 'original'
  sizes?: string; priority?: boolean
  placeholder?: 'blur' | 'empty' | 'skeleton'
  loading?: 'lazy' | 'eager'; aspectRatio?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `VideoBase`
```tsx
interface VideoBaseProps {
  src: string; poster?: string
  controls?: boolean; autoPlay?: boolean; loop?: boolean; muted?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `CarouselBase`
```tsx
interface CarouselBaseProps {
  children: ReactNode[]
  autoPlay?: boolean; interval?: number
  showArrows?: boolean; showDots?: boolean
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `EmbedBase`
```tsx
interface EmbedBaseProps {
  url: string; title?: string; aspectRatio?: string   // default: '16/9'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Primitives

### `FloatingMenuBase`
```tsx
type FloatingMenuBaseEntry =
  | { type: 'item'; label: string; icon?: string; destructive?: boolean; disabled?: boolean; onAction?: () => void }
  | { type: 'separator' }
  | { type: 'label'; text: string }

interface FloatingMenuBaseProps {
  triggerLabel?: string; triggerIcon?: string
  items?: FloatingMenuBaseEntry[]
  open?: boolean; align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Feedback

### `DefaultLoadingBase`
```tsx
interface DefaultLoadingBaseProps {
  label?: string; size?: 'sm' | 'md' | 'lg'
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
<DefaultLoadingBase label="Loading match..." size="md" />
```

### `DefaultErrorBase`
```tsx
interface DefaultErrorBaseProps {
  title?: string; description?: string
  showRetry?: boolean; retryLabel?: string; onRetry?: () => void
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `DefaultNotFoundBase`
```tsx
interface DefaultNotFoundBaseProps {
  title?: string; description?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

### `DefaultOfflineBase`
```tsx
interface DefaultOfflineBaseProps {
  title?: string; description?: string
  id?: string; className?: string; style?: CSSProperties
  slots?: Record<string, Record<string, unknown>>
}
```

---

## Headless Hooks

### `useDataTable`
See DataTableBase section above.

### `useAutoForm`
See AutoForm section above.

### `useDetailCard`
See DetailCardBase section above.

### `useWizard`
See Wizard section above.

### `useNav`
```tsx
const { items, activeItem, setActiveItem } = useNav(config)
```

### `usePoll`
```tsx
import { usePoll } from '@lastshotlabs/snapshot/ui'

usePoll({
  onPoll: fetchGameState,
  interval: 3000,
  enabled: matchIsActive,
  pauseWhenHidden: true,    // pauses when browser tab is hidden
})
```

### `useInfiniteScroll`
```tsx
import { useInfiniteScroll } from '@lastshotlabs/snapshot/ui'

const sentinelRef = useInfiniteScroll({
  hasNextPage, isLoading,
  loadNextPage: () => fetchMore(),
  threshold: 200,       // px from bottom to trigger
})

// Render a sentinel div at the bottom of your list:
<div ref={sentinelRef} />
```

### `useBreakpoint` / `useResponsiveValue`
```tsx
import { useBreakpoint, useResponsiveValue } from '@lastshotlabs/snapshot/ui'

const { breakpoint } = useBreakpoint()
// breakpoint: 'default' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const columns = useResponsiveValue({ default: 1, md: 2, lg: 3 })
```

### `useUrlSync`
```tsx
import { useUrlSync } from '@lastshotlabs/snapshot/ui'

// Keeps local state in sync with URL query params:
useUrlSync({
  params: { status: 'status', page: 'p' },
  state: { status, page },
  onStateFromUrl: ({ status, page }) => { setStatus(status); setPage(Number(page)) },
  replace: true,
  enabled: true,
})
```

### `useAutoBreadcrumbs`
```tsx
import { useAutoBreadcrumbs } from '@lastshotlabs/snapshot/ui'

const breadcrumbs = useAutoBreadcrumbs({ auto: true, homeLabel: 'Home' })
```

### Context — `usePublish` / `useSubscribe`
Used for cross-component binding (requires `PageContextProvider`):
```tsx
import { usePublish, useSubscribe } from '@lastshotlabs/snapshot/ui'

// Publish a value from component id 'match-table':
const publish = usePublish('match-table')
publish({ selected: clickedRow })

// Subscribe to it from another component:
const selectedMatch = useSubscribe({ from: 'match-table.selected' })
```

### `useActionExecutor`
```tsx
import { useActionExecutor } from '@lastshotlabs/snapshot/ui'
import type { ActionConfig } from '@lastshotlabs/snapshot/ui'

const execute = useActionExecutor()

execute({ type: 'navigate', path: '/matches/123' })
execute({ type: 'api', method: 'POST', endpoint: '/api/matches/:id/start', params: { id: matchId } })
execute({ type: 'toast', message: 'Match started!', variant: 'success' })
execute({ type: 'open-modal', modal: 'player-details' })
execute({ type: 'refresh', target: 'match-table' })
```

### Drag & Drop
```tsx
import {
  DndContext, SortableContext, DragOverlay,
  closestCenter, useSortable, verticalListSortingStrategy,
  arrayMove, useDndSensors, getSortableStyle,
} from '@lastshotlabs/snapshot/ui'

function SortableItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={getSortableStyle(transform, transition, isDragging)}
         {...attributes} {...listeners}>
      {children}
    </div>
  )
}

function SortableList({ items, onReorder }) {
  const sensors = useDndSensors()
  const [activeId, setActiveId] = useState(null)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) {
          onReorder(arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)))
        }
        setActiveId(null)
      }}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(id => <SortableItem key={id} id={id}>{id}</SortableItem>)}
      </SortableContext>
    </DndContext>
  )
}
```

---

# Jeopardy API Reference

Base URL: configured via `JEOPARDY_API_URL` env var (default `http://localhost:3000`).

**Auth:**
- Browser: session cookie set by `/auth/*` flows
- Non-browser: `x-user-token: <jwt>` header

---

## REST Endpoints

### System
```
GET  /api/health              → { ok: boolean, app: string }
GET  /api/ready               → { ok: boolean, ready: boolean }
GET  /api/jeopardy/status     → { ok: boolean, gameType: string, phase: string }
```

### Guest Session
```
POST   /api/guest/session
  body: { displayName?: string, issuingMatchId?: string }
  → { guest: { userId, displayName, expiresAt }, session }

DELETE /api/guest/session     [auth]
  body: { sessionId?: string }
```

### Matches
```
POST  /api/matches            [auth]
  body: match config object
  → match record

GET   /api/matches
  query: hostUserId, status, visibility (private|public|protected)
  → { items: Match[] }

GET   /api/matches/:id
  → { match, players, accessEntries }

GET   /api/matches/:id/state
  → JeopardySessionState (see type below)

POST  /api/matches/:id/start              [auth]
POST  /api/matches/:id/pause              [auth]
POST  /api/matches/:id/resume             [auth]
POST  /api/matches/:id/end                [auth]

POST  /api/matches/:id/evaluate-answer
  body: { submission: string, answer: string, language?: string }
  → { accepted: boolean, borderline: boolean, reason: string }
```

### Match Access
```
GET  /api/matches/:id/access              [auth]  → { items: AccessEntry[] }
POST /api/matches/:id/join                [auth]  body: { role?, team? }
POST /api/matches/:id/request-join        [auth]
POST /api/matches/:id/approve/:entryId    [auth]
POST /api/matches/:id/invites             [auth]  body: { userId, displayName }
POST /api/matches/:id/reservations        [auth]  body: { userId, displayName }
POST /api/matches/:id/ban/:entryId        [auth]
POST /api/matches/:id/waitlist/:entryId/promote  [auth]
```

### Match Players
```
POST  /api/matches/:id/host-players                [auth]  body: { displayName, role?, team? }
PATCH /api/matches/:id/players/:playerId           [auth]  body: { displayName?, isActive? }
PATCH /api/matches/:id/players/:playerId/team      [auth]  body: { team }
PATCH /api/matches/:id/players/:playerId/role      [auth]  body: { role }
POST  /api/matches/:id/players/:playerId/replace   [auth]  body: { userId, displayName }
```

### Host Controls (all require auth + host role)
```
POST /api/matches/:id/host/advance
  body: {}

POST /api/matches/:id/host/select-clue
  body: { clueId: string, categorySlot: number, clueSlot: number }

POST /api/matches/:id/host/select-buzz-winner
  body: { playerId: string }

POST /api/matches/:id/host/designate-responder
  body: { playerId: string }

POST /api/matches/:id/host/judge-attempt
  body: { correct: boolean, delta?: number, playerId?: string, value?: number }

POST /api/matches/:id/host/reopen-buzz
  body: {}

POST /api/matches/:id/host/kill-clue
  body: { reason?: string }

POST /api/matches/:id/host/score-adjust
  body: { playerId: string, delta: number, reason?: string }

POST /api/matches/:id/host/reveal-media
  body: { mediaIndex: number }

PATCH /api/matches/:id/host/board
  body: { patch: object }
```

### Replay
```
GET  /api/matches/:id/replay       [auth]  query: audience, includeReplay
POST /api/exports/matches/:id/replay  [auth]  body: { format? }
GET  /api/matches/:id/export/json  [auth]
```

### Library
Kinds: `clue-set` · `generator-template` · `round-template` · `board-template` · `game-rules`
```
GET    /api/library/:kind
  query: workflowStatus, scopeKind, visibility, q (search)
  → { items: [...] }

POST   /api/library/:kind                          [auth]
GET    /api/library/:kind/:id
PATCH  /api/library/:kind/:id                      [auth]
GET    /api/library/:kind/:id/versions
POST   /api/library/:kind/:id/versions             [auth]
GET    /api/library/:kind/:id/versions/:versionId
POST   /api/library/:kind/:id/submit               [auth]
POST   /api/library/:kind/:id/approve              [auth]
POST   /api/library/:kind/:id/reject               [auth]
POST   /api/library/:kind/:id/publish              [auth]
POST   /api/library/:kind/:id/archive              [auth]
```

### Board Builds
```
POST  /api/board-builds           [auth]
  body: { title, generatorTemplateId, clueSetVersionId, generatorSeed, scopeKind, scopeId, notes }

GET   /api/board-builds/:id
PATCH /api/board-builds/:id       [auth]  body: { title?, notes?, status? }
POST  /api/board-builds/:id/regenerate        [auth]  body: { generatorSeed? }
POST  /api/board-builds/:id/save-as-clue-set  [auth]  body: { title, tags, visibility }
POST  /api/board-builds/:id/create-match      [auth]  body: { title, hostUserId, visibility }
```

### Discovery
```
GET  /api/discovery
  query: q, kind, scopeKind, language, visibility, owner, ownerUserId,
         publicationStatus, difficulty, ratingMin, tags

POST /api/discovery/:kind/:id/rating       [auth]
POST /api/discovery/:kind/:id/preferences  [auth]
```

### Import / Export
```
POST /api/imports/library/json   [auth]
POST /api/imports/library/csv    [auth]  body: { kind, csv } or { kind, rows: [...] }
POST /api/exports/library/:kind/:id/json
```

### Moderation
```
POST /api/moderation/reports     [auth]
  body: { contentType, contentId, reason, description }
GET  /api/moderation/cases       [auth]  query: status
POST /api/moderation/cases/:id/actions  [auth]
```

---

## WebSocket — `/game`

```
ws://host/game    (dev)
wss://host/game   (prod)
```

### Connect & authenticate
```ts
const ws = new WebSocket('ws://localhost:3000/game')

ws.onopen = () => {
  // Non-browser clients: send auth token
  ws.send(JSON.stringify({ type: 'auth', token: jwt }))

  // Subscribe to a match
  ws.send(JSON.stringify({ type: 'game:subscribe', sessionId: matchId }))
}
```

Browser clients using session cookies don't need to send an auth message — the cookie is used on the WS upgrade.

### Messages you send

```ts
// Submit input on a game phase channel:
ws.send(JSON.stringify({
  type: 'game:input',
  sessionId: matchId,        // the match id
  channel: 'buzzer',         // see channel table below
  input: { action: 'buzz' },
  clientId: crypto.randomUUID(), // optional idempotency key
}))
```

#### Channel → input shape

| Channel | Active during | Input |
|---------|--------------|-------|
| `buzzer` | `buzzing` phase | `{ action: 'buzz' }` |
| `regularAnswer` | `regular-answer` | `{ answer: string }` |
| `dailyDoubleWager` | `daily-double-wager` | `{ amount: number }` |
| `dailyDoubleAnswer` | `daily-double-answer` | `{ answer: string }` |
| `finalWager` | `final-wager` | `{ amount: number }` |
| `finalAnswer` | `final-answer` | `{ answer: string }` |
| `spectatorPrediction` | `buzzing` | `{ predictedPlayerId: string }` |
| `spectatorQuiz` | `regular-answer` | `{ answer: string }` |
| `spectatorReaction` | most phases (free) | `{ reaction: string }` |
| `audienceVote` | when voting open | `{ vote: string }` |

### Messages you receive

```ts
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data)
  switch (msg.type) {
    case 'game:input.ack':
      // { type, accepted: boolean, channel, clientId?, reason? }
      break
    default:
      if (msg.type.startsWith('jeopardy:')) {
        // { type: 'jeopardy:<event>', phase, round, state: JeopardySessionState }
        setGameState(msg.state)
        setPhase(msg.phase)
      }
  }
}
```

#### Jeopardy events received

| `type` | Fired when |
|--------|-----------|
| `jeopardy:lobby.entered` | Match in lobby |
| `jeopardy:board.select` | Controller selecting a clue |
| `jeopardy:clue.reveal` | Clue revealed |
| `jeopardy:buzz.opened` | Buzzer window opens |
| `jeopardy:buzz.closed` | Buzzer window closes |
| `jeopardy:regular-answer.opened` | Answer window opens |
| `jeopardy:regular-resolution.ready` | Judging complete |
| `jeopardy:daily-double.wager` | DD wager phase |
| `jeopardy:daily-double.answer` | DD answer phase |
| `jeopardy:daily-double.resolution` | DD judged |
| `jeopardy:round.transition` | Next round starting |
| `jeopardy:final.category` | Final category revealed |
| `jeopardy:final.wager` | Final wager phase |
| `jeopardy:final.clue` | Final clue revealed |
| `jeopardy:final.answer` | Final answer phase |
| `jeopardy:final.resolution` | Final Jeopardy judged |

---

## Live Game State (`JeopardySessionState`)

Carried in every WS broadcast and from `GET /api/matches/:id/state`:

```ts
type JeopardySessionState = {
  roundIndex: number

  board: {
    revealedClueIds: string[]
    deadClueIds: string[]
    currentClueId: string | null
    currentCategorySlot: number | null
    currentClueSlot: number | null
  }

  control: {
    controllerPlayerId: string | null
    controllerTeamId: string | null
    policy: 'answerer-controls' | 'round-robin' | 'host-picks'
    designatedResponderPlayerId: string | null
    lastIdleAdvanceAt: string | null       // ISO8601
  }

  buzz: {
    open: boolean
    claimedBy: string | null
    buzzOrder: string[]                    // playerIds in order of buzz
    lockedOutPlayerIds: string[]
    attemptNumber: number
    pendingWinnerPlayerId: string | null
  }

  currentAttempt: {
    attemptId: string
    playerId: string | null
    teamId: string | null
    designatedPlayerId: string | null
    buzzedByPlayerId: string | null
    captureMode: 'spoken' | 'device'
    submission?: unknown
    judged: boolean
  } | null

  wagers: {
    dailyDouble?: Record<string, number>   // playerId → amount
    final?: Record<string, number>
  }

  finalRound: {
    categoryRevealed: boolean
    clueRevealed: boolean
    answersRevealed: boolean
    judgedPlayerIds: string[]
    designatedPlayerIds?: Record<string, string>   // teamId → playerId
    submittedPlayerIds?: string[]
  }

  spectators: {
    reactionCounts?: Record<string, number>        // emoji → count
    predictionCounts?: Record<string, number>      // playerId → count
    audienceVoteCounts?: Record<string, number>
    audienceVotes?: Record<string, string>         // userId → choice
    lastAudienceVoteKey?: string | null
  }
}
```

### Game phases

| Phase | Channels open | Advances when |
|-------|--------------|---------------|
| `lobby` | — | Host calls `advance` |
| `board-select` | Controller picks | `select-clue` host action |
| `clue-reveal` | — | Auto or host |
| `buzzing` | `buzzer`, `spectatorPrediction`, `spectatorReaction` | First buzz or timeout |
| `regular-answer` | `regularAnswer`, `spectatorQuiz`, `spectatorReaction` | Submitted or timeout |
| `judging` | — | `judge-attempt` host action |
| `daily-double-wager` | `dailyDoubleWager` | Submitted or timeout |
| `daily-double-answer` | `dailyDoubleAnswer` | Submitted or timeout |
| `final-wager` | `finalWager` (all) | All submitted or timeout |
| `final-answer` | `finalAnswer` (all) | All submitted or timeout |
| `round-end` | — | Host calls `advance` |
| `game-over` | — | — |

---

## WebSocket Client Example

```ts
class JeopardySocket {
  private ws: WebSocket
  private handlers = new Map<string, ((msg: unknown) => void)[]>()

  constructor(private matchId: string, private token?: string) {
    this.ws = new WebSocket(`${WS_BASE}/game`)
    this.ws.onopen = () => {
      if (this.token) this.send({ type: 'auth', token: this.token })
      this.send({ type: 'game:subscribe', sessionId: this.matchId })
    }
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as { type: string }
      this.handlers.get(msg.type)?.forEach(fn => fn(msg))
      this.handlers.get('*')?.forEach(fn => fn(msg))
    }
  }

  send(payload: unknown) { this.ws.send(JSON.stringify(payload)) }

  on(type: string, fn: (msg: unknown) => void): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, [])
    this.handlers.get(type)!.push(fn)
    return () => { const arr = this.handlers.get(type)!; arr.splice(arr.indexOf(fn), 1) }
  }

  buzz() { this.send({ type: 'game:input', sessionId: this.matchId, channel: 'buzzer', input: { action: 'buzz' } }) }
  submitAnswer(answer: string) { this.send({ type: 'game:input', sessionId: this.matchId, channel: 'regularAnswer', input: { answer } }) }
  submitFinalWager(amount: number) { this.send({ type: 'game:input', sessionId: this.matchId, channel: 'finalWager', input: { amount } }) }
  submitFinalAnswer(answer: string) { this.send({ type: 'game:input', sessionId: this.matchId, channel: 'finalAnswer', input: { answer } }) }
  sendReaction(reaction: string) { this.send({ type: 'game:input', sessionId: this.matchId, channel: 'spectatorReaction', input: { reaction } }) }
  close() { this.ws.close() }
}

// React hook:
function useGameSocket(matchId: string, token?: string) {
  const [state, setState] = useState<JeopardySessionState | null>(null)
  const [phase, setPhase] = useState<string>('lobby')
  const socketRef = useRef<JeopardySocket | null>(null)

  useEffect(() => {
    const socket = new JeopardySocket(matchId, token)
    socketRef.current = socket
    socket.on('*', (msg: any) => {
      if (msg.state) { setState(msg.state); setPhase(msg.phase ?? phase) }
    })
    return () => socket.close()
  }, [matchId])

  return { state, phase, socket: socketRef.current }
}
```
