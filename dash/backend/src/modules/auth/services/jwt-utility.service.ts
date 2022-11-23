import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtilityService {
  constructor(private readonly jwtService: JwtService) {}

  async getToken(userProfile: any): Promise<string> {
    const token: string = await this.jwtService.signAsync(JSON.parse(userProfile), {
      expiresIn: '24h'
    });
    return token;
  }

  async verify(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token);
  }
}
