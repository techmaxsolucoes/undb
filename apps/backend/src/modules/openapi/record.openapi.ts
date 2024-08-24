import {
  BulkDeleteRecordsCommand,
  BulkDuplicateRecordsCommand,
  BulkUpdateRecordsCommand,
  CreateRecordCommand,
  CreateRecordsCommand,
  DeleteRecordCommand,
  DuplicateRecordCommand,
  UpdateRecordCommand,
} from "@undb/commands"
import { CommandBus, QueryBus } from "@undb/cqrs"
import { inject, singleton } from "@undb/di"
import { type ICommandBus, type IQueryBus, type PaginatedDTO } from "@undb/domain"
import { injectQueryBuilder, type IQueryBuilder } from "@undb/persistence"
import { GetReadableRecordByIdQuery, GetReadableRecordsQuery } from "@undb/queries"
import { type IRecordReadableValueDTO } from "@undb/table"
import Elysia, { t } from "elysia"
import { withTransaction } from "../../db"

@singleton()
export class RecordOpenApi {
  constructor(
    @inject(QueryBus)
    private readonly queryBus: IQueryBus,

    @inject(CommandBus)
    private readonly commandBus: ICommandBus,
    @injectQueryBuilder()
    private readonly qb: IQueryBuilder,
  ) {}

  public route() {
    return new Elysia().group("", (app) => {
      return app
        .get(
          "/records",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            const result = (await this.queryBus.execute(
              new GetReadableRecordsQuery({ baseName, tableName, ignoreView: true }),
            )) as PaginatedDTO<IRecordReadableValueDTO>
            return {
              total: result.total,
              records: result.values,
            }
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String() }),
            detail: {
              tags: ["Record"],
              summary: "Get records",
              description: "Get records",
            },
          },
        )
        .get(
          "/views/:viewName/records",
          async (ctx) => {
            const { baseName, tableName, viewName } = ctx.params
            const result = (await this.queryBus.execute(
              new GetReadableRecordsQuery({ baseName, tableName, viewName }),
            )) as PaginatedDTO<IRecordReadableValueDTO>
            return {
              total: result.total,
              records: result.values,
            }
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String(), viewName: t.String() }),
            detail: {
              tags: ["Record"],
              summary: "Get records by view id",
              description: "Get records by view id",
            },
          },
        )
        .get(
          "/views/:viewName/records/:recordId",
          async (ctx) => {
            const { baseName, tableName, viewName, recordId } = ctx.params
            const result = await this.queryBus.execute(
              new GetReadableRecordByIdQuery({ baseName, tableName, viewName, id: recordId }),
            )
            return {
              data: result,
            }
          },
          {
            params: t.Object({
              baseName: t.String(),
              tableName: t.String(),
              viewName: t.String(),
              recordId: t.String(),
            }),
            detail: {
              tags: ["Record"],
              summary: "Get record by id in view",
              description: "Get record by id in view",
            },
          },
        )
        .get(
          "/records/:recordId",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            const result = await this.queryBus.execute(
              new GetReadableRecordByIdQuery({ baseName, tableName, id: ctx.params.recordId, ignoreView: true }),
            )
            return {
              data: result,
            }
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String(), recordId: t.String() }),
            detail: {
              tags: ["Record"],
              summary: "Get record by id",
              description: "Get record by id",
            },
          },
        )
        .post(
          "/records",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(new CreateRecordCommand({ baseName, tableName, values: ctx.body.values })),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String() }),
            body: t.Object({ values: t.Record(t.String(), t.Any()) }),
            detail: {
              tags: ["Record"],
              summary: "Create record",
              description: "Create record",
            },
          },
        )
        .post(
          "/records/bulk",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(new CreateRecordsCommand({ baseName, tableName, records: ctx.body.records })),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String() }),
            body: t.Object({ records: t.Array(t.Object({ id: t.Optional(t.String()), values: t.Any() })) }),
            detail: {
              tags: ["Record"],
              summary: "Create records",
              description: "Create records",
            },
          },
        )
        .patch(
          "/records/:recordId",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(
                new UpdateRecordCommand({
                  tableName,
                  baseName,
                  id: ctx.params.recordId,
                  values: ctx.body.values,
                }),
              ),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String(), recordId: t.String() }),
            body: t.Object({ values: t.Record(t.String(), t.Any()) }),
            detail: {
              tags: ["Record"],
              summary: "Update record by id",
              description: "Update record by id",
            },
          },
        )
        .patch(
          "/records",
          async (ctx) => {
            const { tableName, baseName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(
                new BulkUpdateRecordsCommand({
                  tableName,
                  baseName,
                  filter: ctx.body.filter,
                  values: ctx.body.values,
                  isOpenapi: true,
                }),
              ),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String() }),
            body: t.Object({
              filter: t.Any(),
              values: t.Record(t.String(), t.Any()),
            }),
            detail: {
              tags: ["Record"],
              summary: "Update records",
              description: "Update records",
            },
          },
        )
        .post(
          "/records/:recordId/duplicate",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(new DuplicateRecordCommand({ baseName, tableName, id: ctx.params.recordId })),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String(), recordId: t.String() }),
            detail: {
              tags: ["Record"],
              summary: "Duplicate record by id",
              description: "Duplicate record by id",
            },
          },
        )
        .post(
          "/records/duplicate",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(
                new BulkDuplicateRecordsCommand({
                  baseName,
                  tableName,
                  filter: ctx.body.filter,
                  isOpenapi: true,
                }),
              ),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String() }),
            body: t.Object({ filter: t.Any() }),
            detail: {
              tags: ["Record"],
              summary: "Duplicate records",
              description: "Duplicate records",
            },
          },
        )
        .delete(
          "/records/:recordId",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(new DeleteRecordCommand({ baseName, tableName, id: ctx.params.recordId })),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String(), recordId: t.String() }),
            detail: {
              tags: ["Record"],
              summary: "Delete record by id",
              description: "Delete record by id",
            },
          },
        )
        .delete(
          "/records",
          async (ctx) => {
            const { baseName, tableName } = ctx.params
            return withTransaction(this.qb)(() =>
              this.commandBus.execute(
                new BulkDeleteRecordsCommand({
                  baseName,
                  tableName,
                  filter: ctx.body.filter,
                  isOpenapi: true,
                }),
              ),
            )
          },
          {
            params: t.Object({ baseName: t.String(), tableName: t.String() }),
            body: t.Object({ filter: t.Any() }),
            detail: {
              tags: ["Record"],
              summary: "Delete records",
              description: "Delete records",
            },
          },
        )
    })
  }
}