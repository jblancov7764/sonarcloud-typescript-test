import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const PERMISSION_KEY = 'permissions';
export const RequieredPermissions = (...permissions: Permission[]) => SetMetadata(PERMISSION_KEY, permissions);