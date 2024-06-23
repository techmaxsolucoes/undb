import type { Base, IBaseOutboxService } from "@undb/base"
import { singleton } from "@undb/di"
import type { Database } from "../db"
import { injectDb } from "../db.provider"
import { OutboxMapper } from "../outbox.mapper"
import { outbox } from "../tables"

@singleton()
export class BaseOutboxService implements IBaseOutboxService {
  constructor(
    @injectDb()
    private readonly db: Database,
  ) {}

  async save(r: Base): Promise<void> {
    const values = r.domainEvents.map(OutboxMapper.fromEvent)
    if (!values.length) return
    await this.db.insert(outbox).values(values)
    r.removeEvents(r.domainEvents)
  }
}
