import * as z from 'zod'
import { recordIdSchema } from '../../record/value-objects/record-id.schema'
import { tableIdSchema } from '../../value-objects'

export const bulkDuplicateRecordsCommandInput = z.object({
  tableId: tableIdSchema,
  ids: recordIdSchema.array().nonempty(),
})
export type IBulkDuplicateRecordsInput = z.infer<typeof bulkDuplicateRecordsCommandInput>
