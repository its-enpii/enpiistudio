<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Audit\Contracts;

interface AuditActorResolver
{
    public function actorId(): ?string;
}
