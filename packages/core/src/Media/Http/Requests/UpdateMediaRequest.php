<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Media\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

final class UpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.string' => __('core::media.validation_title_invalid'),
            'title.max' => __('core::media.validation_title_too_long'),
            'alt.string' => __('core::media.validation_alt_invalid'),
            'alt.max' => __('core::media.validation_alt_too_long'),
            'meta.array' => __('core::media.validation_meta_invalid'),
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'error' => [
                'code' => 'validation_failed',
                'message' => $validator->errors()->first(),
                'fields' => $validator->errors()->toArray(),
            ],
        ], 422));
    }
}
