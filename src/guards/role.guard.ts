import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CONSTANT_TOKEN } from 'src/constants';
import { IRole } from 'src/interfaces/models.interface';
import { IRoleDataResourceRequire, IRoleDataResource } from 'src/interfaces/role.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy role từ Decorator Role
    const requiredRoles = this.reflector.get<IRoleDataResourceRequire>('role', context.getHandler());
    if (!requiredRoles) {
      return true; // Nếu không yêu cầu vai trò, route này không yêu cầu bảo vệ
    }

    // Lấy role từ request.user do đã qua guardAuth
    const request = context.switchToHttp().getRequest();
    const user = request[`${CONSTANT_TOKEN.TOKEN_NAME_USER}`];

    // Kiểm tra xem user có vai trò được yêu cầu không
    const hasRole = user.roles.some((role: IRole) => {
      const dataResources = role.dataSources as IRoleDataResource[];
      return dataResources.some((resource) => {
        return resource.resource === requiredRoles.resource && resource.actions.includes(requiredRoles.action);
      });
    });

    if (!hasRole) {
      throw new ForbiddenException('You are not authorized to access this resource.');
    }

    return true;
  }
}
