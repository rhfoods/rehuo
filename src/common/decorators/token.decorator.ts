import { SetMetadata } from '@nestjs/common';
import { JwtTypes } from '../constants/system.constant';

export const Token = (type: JwtTypes) => SetMetadata('token', type);
