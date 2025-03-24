import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetUserId = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  if (request.user && request.user.sub) {
    return parseInt(request.user.sub, 10)
  }

  return null
})
