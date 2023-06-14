import { EVT_RECORD_ALL, type IRecordEvents } from '@undb/core'
import type { IEventHandler } from '@undb/domain'
import { withTableEvents, type IWebhookRepository } from '@undb/integrations'
import type { ILogger } from '@undb/logger'
import type { IWebhookHttpService } from './webhook.http-service.js'

export class WebhookEventsHandler implements IEventHandler<IRecordEvents> {
  constructor(
    protected readonly logger: ILogger,
    protected readonly httpService: IWebhookHttpService,
    protected readonly repo: IWebhookRepository,
  ) {}

  async handle(event: IRecordEvents): Promise<void> {
    this.logger.info('handling event %s of payload: %j', event.name, event.payload)

    const tableId = event.payload.tableId
    const spec = withTableEvents(tableId, [EVT_RECORD_ALL, event.name])
    const webhooks = await this.repo.find(spec)

    for (const webhook of webhooks) {
      this.httpService.handle(webhook, event)
    }
  }
}
