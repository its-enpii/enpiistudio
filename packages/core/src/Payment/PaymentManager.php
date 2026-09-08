<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment;

use EnpiiStudio\Core\Payment\Contracts\PaymentGateway;
use EnpiiStudio\Core\Payment\Drivers\DuitkuPaymentGateway;
use EnpiiStudio\Core\Payment\Drivers\TripayPaymentGateway;
use EnpiiStudio\Core\Payment\Exceptions\PaymentConfigurationException;

final class PaymentManager
{
    /** @var array<string, callable(array<string, mixed>): PaymentGateway> */
    private array $customCreators = [];

    /** @var array<string, PaymentGateway> */
    private array $resolved = [];

    public function driver(?string $name = null, array $credentials = []): PaymentGateway
    {
        $name ??= (string) config('enpii-core.payment.default', 'tripay');

        if ($name === '') {
            throw new PaymentConfigurationException('Payment driver name cannot be empty.');
        }

        $cacheKey = $name.'|'.md5(serialize($credentials));

        return $this->resolved[$cacheKey] ??= $this->resolve($name, $credentials);
    }

    /**
     * @param  callable(array<string, mixed>): PaymentGateway  $creator
     */
    public function extend(string $name, callable $creator): void
    {
        $name = mb_strtolower($name);
        $this->customCreators[$name] = $creator;
        unset($this->resolved[$name]);
    }

    private function resolve(string $name, array $credentials): PaymentGateway
    {
        $name = mb_strtolower($name);

        if (isset($this->customCreators[$name])) {
            return ($this->customCreators[$name])($credentials ?: $this->credentials($name));
        }

        $values = $credentials ?: $this->credentials($name);

        return match ($name) {
            'tripay' => new TripayPaymentGateway(...$this->tripayCredentials($values)),
            'duitku' => new DuitkuPaymentGateway(...$this->duitkuCredentials($values)),
            default => throw new PaymentConfigurationException("Unsupported payment driver [{$name}]."),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function credentials(string $name): array
    {
        $values = config("enpii-core.payment.drivers.{$name}", []);

        if (! is_array($values)) {
            throw new PaymentConfigurationException("Payment driver [{$name}] configuration must be an array.");
        }

        return $values;
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array{apiKey: string, privateKey: string, merchantCode: string, isProduction: bool, timeout: int}
     */
    private function tripayCredentials(array $values): array
    {
        $apiKey = (string) ($values['api_key'] ?? '');
        $privateKey = (string) ($values['private_key'] ?? '');

        if ($apiKey === '' || $privateKey === '') {
            throw new PaymentConfigurationException('Tripay requires api_key and private_key.');
        }

        return [
            'apiKey' => $apiKey,
            'privateKey' => $privateKey,
            'merchantCode' => (string) ($values['merchant_code'] ?? ''),
            'isProduction' => (bool) ($values['is_production'] ?? false),
            'timeout' => max(1, (int) ($values['timeout'] ?? 15)),
        ];
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array{merchantCode: string, apiKey: string, isProduction: bool, timeout: int}
     */
    private function duitkuCredentials(array $values): array
    {
        $merchantCode = (string) ($values['merchant_code'] ?? '');
        $apiKey = (string) ($values['api_key'] ?? '');

        if ($merchantCode === '' || $apiKey === '') {
            throw new PaymentConfigurationException('Duitku requires merchant_code and api_key.');
        }

        return [
            'merchantCode' => $merchantCode,
            'apiKey' => $apiKey,
            'isProduction' => (bool) ($values['is_production'] ?? false),
            'timeout' => max(1, (int) ($values['timeout'] ?? 15)),
        ];
    }
}
