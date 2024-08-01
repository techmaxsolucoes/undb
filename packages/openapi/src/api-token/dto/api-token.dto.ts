import { z } from "@undb/zod"
import { apiTokenIdSchema } from "../api-token-id.vo"
import { apiTokenTokenSchema } from "../api-token-token.vo"

export const apiTokenDTO = z.object({
  id: apiTokenIdSchema,
  userId: z.string(),
  name: z.string(),
  token: apiTokenTokenSchema,
})

export type IApiTokenDTO = z.infer<typeof apiTokenDTO>