import type { ISpecification } from "@undb/domain"
import {
  AttachmentEmpty,
  AttachmentEqual,
  CheckboxEqual,
  DateEqual,
  DateIsAfter,
  DateIsBefore,
  DateIsEmpty,
  DateIsSameDay,
  DateIsToday,
  DateIsTomorrow,
  ID_TYPE,
  IdEqual,
  IdIn,
  JsonContains,
  JsonEmpty,
  JsonEqual,
  LongTextEqual,
  NumberEmpty,
  NumberEqual,
  NumberGT,
  NumberGTE,
  NumberLT,
  NumberLTE,
  RatingEqual,
  ReferenceEqual,
  SelectContainsAnyOf,
  SelectEmpty,
  SelectEqual,
  StringContains,
  StringEmpty,
  StringEndsWith,
  StringEqual,
  StringMax,
  StringMin,
  StringStartsWith,
  UrlEqual,
  UserEmpty,
  UserEqual,
  type IRecordVisitor,
  type TableDo,
} from "@undb/table"
import type { EmailEqual } from "@undb/table/src/modules/schema/fields/variants/email-field"
import type { SelectQueryBuilder } from "kysely"

export class RecordSpecReferenceVisitor implements IRecordVisitor {
  constructor(
    private qb: SelectQueryBuilder<any, any, any>,
    private readonly table: TableDo,
  ) {}

  join() {
    return this.qb
  }

  stringEqual(spec: StringEqual): void {}
  longTextEqual(spec: LongTextEqual): void {}
  stringContains(spec: StringContains): void {}
  stringStartsWith(spec: StringStartsWith): void {}
  stringEndsWith(spec: StringEndsWith): void {}
  stringEmpty(spec: StringEmpty): void {}
  stringMin(spec: StringMin): void {}
  stringMax(spec: StringMax): void {}
  numberEqual(spec: NumberEqual): void {}
  numberGT(spec: NumberGT): void {}
  numberGTE(spec: NumberGTE): void {}
  numberLT(spec: NumberLT): void {}
  numberLTE(spec: NumberLTE): void {}
  numberEmpty(spec: NumberEmpty): void {}
  idEqual(spec: IdEqual): void {}
  idIn(spec: IdIn): void {}
  dateIsSameDate(spec: DateIsSameDay): void {}
  dateIsToday(spec: DateIsToday): void {}
  dateIsTomorrow(spec: DateIsTomorrow): void {}
  dateIsYesterday(spec: DateIsTomorrow): void {}
  dateIsBefore(spec: DateIsBefore): void {}
  dateIsAfter(spec: DateIsAfter): void {}
  dateIsEmpty(spec: DateIsEmpty): void {}
  userEqual(spec: UserEqual): void
  userEqual(spec: UserEqual): void {}
  userEmpty(spec: UserEmpty): void
  userEmpty(spec: UserEmpty): void {}
  referenceEqual(spec: ReferenceEqual): void {}
  selectEqual(spec: SelectEqual): void {}
  selectContainsAnyOf(spec: SelectContainsAnyOf): void {
    this.qb = this.qb
      .innerJoin(spec.fieldId.value, `${this.table.id.value}.${ID_TYPE}`, `${spec.fieldId.value}.${ID_TYPE}`)
      .groupBy(`${this.table.id.value}.${ID_TYPE}`)
  }
  selectEmpty(spec: SelectEmpty): void {}
  ratingEqual(s: RatingEqual): void {}
  emailEqual(s: EmailEqual): void {}
  urlEqual(s: UrlEqual): void {}
  attachmentEqual(s: AttachmentEqual): void {}
  attachmentEmpty(s: AttachmentEmpty): void {}
  dateEqual(spec: DateEqual): void {}
  jsonEqual(spec: JsonEqual): void {}
  jsonContains(spec: JsonContains): void {}
  jsonEmpty(spec: JsonEmpty): void {}
  checkboxEqual(spec: CheckboxEqual): void {}
  and(left: ISpecification, right: ISpecification): this {
    left.accept(this)
    right.accept(this)

    return this
  }
  or(left: ISpecification, right: ISpecification): this {
    left.accept(this)
    right.accept(this)
    return this
  }
  not(spec: ISpecification): this {
    return this
  }
  clone(): this {
    return this
  }
}
