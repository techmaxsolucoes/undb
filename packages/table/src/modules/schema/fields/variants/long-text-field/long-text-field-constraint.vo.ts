import { Some } from "@undb/domain"
import { z } from "@undb/zod"
import { FieldConstraintVO, baseFieldConstraint } from "../../field-constraint.vo"

export const longTextFieldConstraint = baseFieldConstraint.partial()

export type ILongTextFieldConstraint = z.infer<typeof longTextFieldConstraint>

export class LongTextFieldConstraint extends FieldConstraintVO<ILongTextFieldConstraint> {
  constructor(dto: ILongTextFieldConstraint) {
    super({
      required: dto.required,
    })
  }
  override get schema() {
    let base: z.ZodTypeAny = z.string()
    if (!this.props.required) {
      base = base.optional().nullable()
    }

    return base
  }

  override get mutateSchema() {
    return Some(this.schema)
  }
}