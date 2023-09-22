import type { ICreateFieldSchema, IQueryRecordSchema, Records, Table } from '@undb/core'
import {
  TableFactory,
  createFieldSchema,
  createViewsSchema,
  queryRecordValues,
  recordIdSchema,
  tableIdSchema,
  tableNameSchema,
  viewsOrderSchema,
} from '@undb/core'
import { ValueObject } from '@undb/domain'
import { transform } from 'lodash-es'
import { z } from 'zod'

export const templateRecord = z.object({
  id: recordIdSchema,
  values: queryRecordValues,
})

export const templateTableSchema = z.object({
  id: tableIdSchema,
  name: tableNameSchema,
  schema: createFieldSchema.array(),
  views: createViewsSchema.optional(),
  viewsOrder: viewsOrderSchema.optional(),
  records: templateRecord.array().optional(),
})

export const templateExportSchema = z.object({
  tables: templateTableSchema.array(),
})

export type ITemplateExportSchema = z.infer<typeof templateExportSchema>

export class TemplateExport extends ValueObject<ITemplateExportSchema> {
  public get tables() {
    return this.props.tables
  }

  static fromJSON(json: ITemplateExportSchema) {
    return new this(json)
  }

  static fromTables(inputs: { table: Table; records?: IQueryRecordSchema[] }[]): TemplateExport {
    const exp: ITemplateExportSchema = {
      tables: inputs.map(({ table, records }) => {
        const schema = table.schema.toIdMap()
        return {
          id: table.id.value,
          name: table.name.value,
          schema: table.schema.fields.map((f) => {
            if (f.type === 'reference' && f.foreignTableId.isSome() && f.foreignTableId.unwrap() !== table.id.value) {
              return { id: f.id.value, type: 'string', name: f.name.value, required: false, display: false }
            }
            return f.json as ICreateFieldSchema
          }),
          views: table.views.views.map((v) => v.toJSON()),
          viewsOrder: table.viewsOrder.order,
          records: records?.map((record) => ({
            id: record.id,
            values: transform(record.values, (result, value, fieldId) => {
              const field = schema.get(fieldId)
              if (
                field?.type === 'reference' &&
                field.foreignTableId.isSome() &&
                field.foreignTableId.unwrap() !== table.id.value
              ) {
                result[fieldId] = null
              } else {
                result[fieldId] = value
              }
              return result
            }),
          })),
        }
      }),
    }
    return new this(exp)
  }

  toTables(userId: string): { table: Table; records?: Records }[] {
    return this.tables.map((t) => {
      const table = TableFactory.unsafeCreate({
        id: t.id,
        name: t.name,
        schema: t.schema,
        views: t.views,
        viewsOrder: t.viewsOrder,
      }).unwrap()

      const records = t.records?.map((r) => table.createRecord(r.id, r.values, userId))

      return { table, records }
    })
  }
}