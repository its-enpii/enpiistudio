<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

final class TestRecord extends Model
{
    use BelongsToTenant;

    protected $table = 'test_records';

    protected $fillable = ['name'];
}
