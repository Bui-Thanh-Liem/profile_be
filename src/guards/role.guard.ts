import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Enums } from 'liemdev-profile-lib';
import { CONSTANT_DECORATOR } from 'src/constants';
import { CacheService } from 'src/helpers/services/Cache.service';
import { IRole } from 'src/interfaces/models.interface';
import { IRoleCheck, IRoleDataResource, IRoleOnRoute } from 'src/interfaces/role.interface';
import { UserService } from 'src/routers/user/user.service';
import { createKeyUserRole } from 'src/utils/createKeyCache';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    // Lấy role từ decorator coder đã cố định (Nếu không yêu cầu vai trò, route này không yêu cầu bảo vệ)
    const roleOnRoute = this.reflector.get<IRoleOnRoute>(CONSTANT_DECORATOR.KEY_ROLES, context.getHandler());
    if (!roleOnRoute) {
      return true;
    }
    this.logger.debug(`roleOnRoute:: ${JSON.stringify(roleOnRoute)}`);

    // Lấy role từ request.user do đã qua guardAuth
    const request = context.switchToHttp().getRequest();
    const { userId } = request[`user`];

    const redisKey = createKeyUserRole(userId);
    let roleUser: IRoleCheck = await this.cacheService.getCache(redisKey);

    if (!roleUser) {
      this.logger.debug('Call api get roles');
      const user = await this.userService.findOneRelationById(userId);
      const isAdmin = user.isAdmin || user.isSubAdmin;

      if ((!user || !user.roles) && !isAdmin) {
        throw new ForbiddenException('No role info');
      }

      roleUser = {
        isAdmin,
        roles: user.roles,
        roleGroups: user.roleGroups,
      };
      await this.cacheService.setCache(redisKey, roleUser, 300); // TTL 5 phút (hạn chế số lần gọi xuống database)
    }
    this.logger.debug(`roleUser:: ${JSON.stringify(roleUser)}`);

    // Kiểm tra xem user có vai trò được yêu cầu không
    if (roleUser.isAdmin) return true;
    const { roles, roleGroups } = roleUser;

    //
    const _roles = roleGroups.flatMap((rg) => rg.roles as unknown as IRole);

    //
    const hasRole = [...roles, ..._roles].some((role: IRole) => {
      const dataResources = role.dataSources as IRoleDataResource[];
      return dataResources.some((_) => {
        const isResource = _.resource === roleOnRoute.resource;
        const isManage = _.actions.includes(Enums.EActions.MANAGE);
        const isAction = _.actions.includes(roleOnRoute.action as Enums.EActions);
        return isResource && (isAction || isManage);
      });
    });

    console.log('hasRole:::', hasRole);
    if (!hasRole) {
      throw new ForbiddenException('You are not authorized to access or manipulate this resource.');
    }

    return true;
  }
}
