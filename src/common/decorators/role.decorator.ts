import { SetMetadata } from '@nestjs/common';
import { SystemRoleTypes } from '../constants/system.constant';

export const Role = (role: SystemRoleTypes) => SetMetadata('role', role);
