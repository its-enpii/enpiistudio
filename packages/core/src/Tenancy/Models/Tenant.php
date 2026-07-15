<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Tenant extends Model
{
    use HasUuids;
    use SoftDeletes;

    protected $table = 'core_tenants';

    protected $fillable = ['name', 'slug', 'status'];
}
