<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Media\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

final class StoreMediaRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,xls,xlsx,mp3,mp4,zip',
            ],
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
            'file.required' => __('core::media.validation_file_required'),
            'file.file' => __('core::media.validation_file_invalid'),
            'file.max' => __('core::media.validation_file_too_large'),
            'file.mimes' => __('core::media.validation_file_type_invalid'),
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
