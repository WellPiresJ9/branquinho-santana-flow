

## Performance Optimization Plan for the CRM

### Problem Analysis

The CRM is loading and rendering **8,652 leads** simultaneously, causing severe performance issues:

1. **KanbanBoard** fetches all 8,652 records and renders each one as a `Draggable` DOM element -- the primary bottleneck
2. **Dashboard** fetches all records a second time (separate query, no pagination)
3. **LeadChart** fetches all records a third time (yet another separate query + real-time channel)
4. Three separate real-time subscriptions on the same `chats` table
5. Debug `console.log` statements firing on every filter change, iterating all data

### Optimization Plan

#### 1. Kanban: Limit rendered cards + "Load More" per column

Instead of rendering all leads per column (e.g., 5,777 in "Em Atendimento"), only render the first 20 leads per column. Add a "Carregar Mais" button at the bottom to load 20 more incrementally. This reduces initial DOM nodes from ~8,600 to ~160.

- Add a `visibleCount` state per column (default 20)
- Slice `column.leads` to `visibleCount` before mapping to `Draggable`
- Show a "Carregar mais (X restantes)" button when there are more leads
- Remove the `ScrollArea` wrapper with fixed max-height (no longer needed since we control count)

#### 2. Memoize LeadCard component

Wrap `LeadCard` with `React.memo` to prevent re-renders when other leads change. This is critical when you have many cards.

#### 3. Dashboard: Use Supabase count queries instead of fetching all rows

Replace fetching all 8,652 records with targeted count queries:
```
supabase.from('chats').select('*', { count: 'exact', head: true }).eq('agendados', true)
```
This returns only the count without transferring any row data.

#### 4. Merge LeadChart data with Dashboard

LeadChart currently makes its own full fetch + real-time subscription. Instead, pass the counts from Dashboard as props to LeadChart, eliminating the duplicate fetch entirely.

#### 5. Remove debug console.logs

Remove the validation `console.log` statements in the `useEffect` that runs on every filter change (lines 273-278 of KanbanBoard).

#### 6. Optimize KanbanBoard data fetching

Only fetch the columns needed for display (`id, nome, telefone, produto_juridico, created_at, em_atendimento, agendados, remarketing, remarketing_pedro, remarketing_julianny, reagendamento, vencemos, perdidos, responsavel, status, hora_reuniao`) instead of `select('*')` which pulls all columns including message-related booleans not used in the Kanban view.

### Technical Details

**Files to modify:**
- `src/components/pipeline/KanbanBoard.tsx` -- Add per-column pagination, remove console.logs, select specific columns, memoize
- `src/components/pipeline/LeadCard.tsx` -- Wrap with `React.memo`
- `src/pages/Dashboard.tsx` -- Replace full fetch with count queries
- `src/components/dashboard/LeadChart.tsx` -- Accept counts as props, remove own data fetching

**Expected impact:**
- Initial DOM nodes: ~8,600 cards down to ~160 cards
- Network data transfer: ~3 full table fetches down to 1 paginated fetch + 5 count queries
- Real-time channels: 3 down to 2
- Significant improvement in rendering, scrolling, and interaction responsiveness

