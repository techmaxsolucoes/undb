import { TableId } from '@undb/core'
import { CompositeSpecification } from '@undb/domain'
import { Ok, Result } from 'oxide.ts'
import { IRLSVisitor } from '../interface.js'
import { RLS } from '../rls.js'

export class WithRLSTableId extends CompositeSpecification<RLS, IRLSVisitor> {
  constructor(public readonly tableId: TableId) {
    super()
  }
  isSatisfiedBy(t: RLS): boolean {
    return t.tableId.equals(this.tableId)
  }
  mutate(t: RLS): Result<RLS, string> {
    t.tableId = this.tableId
    return Ok(t)
  }
  accept(v: IRLSVisitor): Result<void, string> {
    v.withTableId(this)
    return Ok(undefined)
  }
}
