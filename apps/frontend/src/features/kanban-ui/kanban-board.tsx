import type { IKanbanField } from '@egodb/core'
import { RecordFactory } from '@egodb/core'
import { useGetRecordsQuery } from '@egodb/store'
import styled from '@emotion/styled'
import { useCurrentTable } from '../../hooks/use-current-table'
import { useCurrentView } from '../../hooks/use-current-view'
import { KanbanDateBoard } from './kanban-date-board'
import { KanbanSelectBoard } from './kanban-select-board'

interface IProps {
  field: IKanbanField
}

const Wrapper = styled.div`
  padding-top: '20px';
  height: 100%;
`

export const KanbanBoard: React.FC<IProps> = ({ field }) => {
  const table = useCurrentTable()
  const view = useCurrentView()
  const listRecords = useGetRecordsQuery(
    {
      tableId: table.id.value,
      viewId: view.id.value,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        rawRecords: (Object.values(result.data?.entities ?? {}) ?? []).filter(Boolean),
      }),
    },
  )

  const records = RecordFactory.fromQueryRecords(listRecords.rawRecords, table.schema.toIdMap())

  if (field.type === 'select') {
    return (
      <Wrapper>
        <KanbanSelectBoard field={field} records={records} />
      </Wrapper>
    )
  }

  if (field.type === 'date') {
    return (
      <Wrapper>
        <KanbanDateBoard field={field} />
      </Wrapper>
    )
  }

  return null
}