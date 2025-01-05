import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_METADATA } from '../constants/decorator.constants';

/**
 * 权限字符串
 */
export const Permission = (perms) => SetMetadata(PERMISSIONS_METADATA, perms);