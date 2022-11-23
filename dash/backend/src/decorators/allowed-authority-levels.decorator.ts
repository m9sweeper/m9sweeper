import {SetMetadata} from '@nestjs/common';

export const AllowedAuthorityLevels = (...roles: string[]) => SetMetadata('allowedAuthorities', roles);
