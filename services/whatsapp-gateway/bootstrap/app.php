<?php

declare(strict_types=1);

use EnpiiStudio\WhatsAppGateway\Commands\CreatePrincipalCommand;
use EnpiiStudio\WhatsAppGateway\Commands\PurgeIdempotencyCommand;
use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use EnpiiStudio\WhatsAppGateway\Middleware\AssignRequestId;
use EnpiiStudio\WhatsAppGateway\Middleware\AuthenticateApiPrincipal;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(api: __DIR__.'/../routes/api.php', commands: __DIR__.'/../routes/console.php')
    ->withCommands([CreatePrincipalCommand::class, PurgeIdempotencyCommand::class])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(AssignRequestId::class);
        $middleware->alias(['gateway.auth' => AuthenticateApiPrincipal::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request): bool => true);
        $exceptions->dontReport([
            GatewayApiException::class,
            ValidationException::class,
            AuthenticationException::class,
            HttpExceptionInterface::class,
        ]);
        $exceptions->render(function (GatewayApiException $exception, Request $request) {
            return response()->json([
                'code' => $exception->errorCode,
                'message' => $exception->getMessage(),
                'request_id' => $request->attributes->get('request_id'),
                'retryable' => $exception->retryable,
            ], $exception->httpStatus);
        });
        $exceptions->render(function (ValidationException $exception, Request $request) {
            return response()->json([
                'code' => 'VALIDATION_FAILED',
                'message' => 'The request payload is invalid.',
                'request_id' => $request->attributes->get('request_id'),
                'retryable' => false,
            ], 422);
        });
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            return response()->json([
                'code' => 'UNAUTHENTICATED',
                'message' => 'Authentication is required.',
                'request_id' => $request->attributes->get('request_id'),
                'retryable' => false,
            ], 401);
        });
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            return response()->json([
                'code' => $exception->getStatusCode() === 404 ? 'NOT_FOUND' : 'HTTP_ERROR',
                'message' => $exception->getStatusCode() === 404 ? 'Resource was not found.' : 'The request could not be processed.',
                'request_id' => $request->attributes->get('request_id'),
                'retryable' => false,
            ], $exception->getStatusCode());
        });
        $exceptions->render(function (Throwable $exception, Request $request): Response {
            return response()->json([
                'code' => 'INTERNAL_ERROR',
                'message' => 'The request could not be completed.',
                'request_id' => $request->attributes->get('request_id'),
                'retryable' => true,
            ], 500);
        });
    })
    ->create();
