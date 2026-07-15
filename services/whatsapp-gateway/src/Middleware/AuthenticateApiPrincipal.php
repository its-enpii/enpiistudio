<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Middleware;

use Closure;
use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class AuthenticateApiPrincipal
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! is_string($token) || ! str_contains($token, '.')) {
            throw new GatewayApiException('UNAUTHENTICATED', 'Authentication is required.', 401);
        }

        [$keyId, $secret] = explode('.', $token, 2);

        if ($keyId === '' || $secret === '') {
            throw new GatewayApiException('UNAUTHENTICATED', 'Authentication is required.', 401);
        }

        $principal = ApiPrincipal::query()
            ->where('key_id', $keyId)
            ->where('status', 'active')
            ->first();

        if ($principal === null || ! password_verify($secret, $principal->key_hash)) {
            throw new GatewayApiException('UNAUTHENTICATED', 'Authentication is required.', 401);
        }

        $request->attributes->set('principal', $principal);

        return $next($request);
    }
}
