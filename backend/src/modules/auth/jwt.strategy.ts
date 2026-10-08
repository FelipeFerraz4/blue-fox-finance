import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

export interface KeycloakUser {
  sub: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const issuerUri = configService.get<string>(
      'KEYCLOAK_ISSUER_URI',
      'http://localhost:8080/auth/realms/blue-fox-global-group',
    );

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerUri}/protocol/openid-connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: issuerUri,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any): KeycloakUser {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido ou sem subject (sub)');
    }

    // Extração das roles do Keycloak no realm_access
    const realmAccess = payload.realm_access;
    const rawRoles: string[] = Array.isArray(realmAccess?.roles)
      ? realmAccess.roles
      : [];

    // Normaliza roles: suporta 'ADMIN' e 'ROLE_ADMIN', 'FINANCE_ADMIN' e 'ROLE_FINANCE_ADMIN'
    const normalizedRoles = new Set<string>();
    rawRoles.forEach((role) => {
      normalizedRoles.add(role);
      if (role.startsWith('ROLE_')) {
        normalizedRoles.add(role.substring(5));
      } else {
        normalizedRoles.add(`ROLE_${role}`);
      }
    });

    return {
      sub: payload.sub,
      email: payload.email,
      preferred_username: payload.preferred_username,
      name: payload.name,
      roles: Array.from(normalizedRoles),
    };
  }
}
