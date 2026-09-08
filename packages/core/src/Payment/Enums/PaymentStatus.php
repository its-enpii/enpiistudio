<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Expired = 'expired';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public static function fromTripay(string $status): self
    {
        return match (strtoupper($status)) {
            'UNPAID' => self::Pending,
            'PAID' => self::Paid,
            'EXPIRED' => self::Expired,
            'FAILED' => self::Failed,
            'REFUND', 'REFUNDED' => self::Refunded,
            default => throw new \InvalidArgumentException("Unknown Tripay status [{$status}]."),
        };
    }

    public static function fromDuitku(string $statusCode): self
    {
        return match ((int) $statusCode) {
            0 => self::Pending,
            1 => self::Paid,
            2 => self::Expired,
            3 => self::Failed,
            5 => self::Refunded,
            default => throw new \InvalidArgumentException("Unknown Duitku status code [{$statusCode}]."),
        };
    }
}
