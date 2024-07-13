import { z } from "@undb/zod"
import { FieldValueObject } from "../../field-value"

export const attachmentFieldValueItem = z.object({
  url: z.string(),
  name: z.string(),
  id: z.string(),
  size: z.number(),
  type: z.string(),
})

export type IAttachmentFieldValueItem = z.infer<typeof attachmentFieldValueItem>

export const attachmentFieldValue = attachmentFieldValueItem.array().nullable()

export type IAttachmentFieldValue = z.infer<typeof attachmentFieldValue>

export const mutateAttachmentFieldValueSchema = z.union([
  attachmentFieldValue.optional().nullable(),
  z.object({
    type: z.literal("set"),
    value: attachmentFieldValue,
  }),
])

export type IMutateAttachmentFieldValueSchema = z.infer<typeof mutateAttachmentFieldValueSchema>

export class AttachmentFieldValue extends FieldValueObject<IAttachmentFieldValue> {
  constructor(value: IAttachmentFieldValue) {
    super(value === null ? { value } : value)
  }

  isEmpty() {
    return this.props === null || this.props === undefined || (Array.isArray(this.props) && this.props.length === 0)
  }
}

export function isImage(item: IAttachmentFieldValueItem) {
  return item.type.startsWith("image")
}
