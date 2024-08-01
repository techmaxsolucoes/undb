import { inject } from "@undb/di"
import { Option } from "@undb/domain"
import type { IWorkspaceMemberDTO } from "./dto"
import { WorkspaceMember } from "./workspace-member"
import type { WorkspaceMemberComositeSpecification } from "./workspace-member.composite-specification"

export interface IWorkspaceMemberRepository {
  findOneById(id: string): Promise<WorkspaceMember>
  findOneByUserId(userId: string): Promise<Option<WorkspaceMember>>

  insert(member: WorkspaceMember): Promise<void>
  exists(email: string): Promise<boolean>
}

export const WORKSPACE_MEMBER_REPOSITORY = Symbol("IWorkspaceMemberRepository")
export const injectWorkspaceMemberRepository = () => inject(WORKSPACE_MEMBER_REPOSITORY)

export interface IWorkspaceMemberQueryRepository {
  findOneById(id: string): Promise<Option<IWorkspaceMemberDTO>>
  findByIds(ids: [string, ...string[]]): Promise<IWorkspaceMemberDTO[]>
  find(spec: Option<WorkspaceMemberComositeSpecification>): Promise<IWorkspaceMemberDTO[]>
}

export const WORKSPQACE_MEMBER_QUERY_REPOSITORY = Symbol("IWorkspaceMemberQueryRepository")

export const injectWorkspaceMemberQueryRepository = () => inject(WORKSPQACE_MEMBER_QUERY_REPOSITORY)