<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttributeController extends Controller
{
    /**
     * Display a listing of attributes.
     */
    public function index(): Response
    {
        $attributes = Attribute::query()
            ->with(['values' => fn ($query) => $query->orderBy('sort_order')])
            ->withCount('values')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Attribute $attribute): array => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'type' => $attribute->type,
                'is_filterable' => (bool) $attribute->is_filterable,
                'is_variation' => (bool) $attribute->is_variation,
                'sort_order' => $attribute->sort_order,
                'values_count' => $attribute->values_count,
                'values' => $attribute->values->map(fn (AttributeValue $value): array => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'slug' => $value->slug,
                    'color_hex' => $value->color_hex,
                    'sort_order' => $value->sort_order,
                ]),
            ]);

        return Inertia::render('Admin/Attributes/Index', [
            'attributes' => $attributes,
        ]);
    }

    /**
     * Show the form for creating a new attribute.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Attributes/Create');
    }

    /**
     * Store a newly created attribute.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $values = $this->valuePayload($request);

        $attribute = DB::transaction(function () use ($data, $values): Attribute {
            $attribute = Attribute::create($this->attributes($data));
            $this->syncValues($attribute, $values);

            return $attribute;
        });

        return redirect()
            ->route('admin.attributes.index')
            ->with('success', "Attribute \"{$attribute->name}\" created successfully.");
    }

    /**
     * Show the form for editing the given attribute.
     */
    public function edit(Attribute $attribute): Response
    {
        $attribute->load(['values' => fn ($query) => $query->orderBy('sort_order')]);

        return Inertia::render('Admin/Attributes/Edit', [
            'attribute' => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'type' => $attribute->type,
                'is_filterable' => (bool) $attribute->is_filterable,
                'is_variation' => (bool) $attribute->is_variation,
                'sort_order' => $attribute->sort_order,
                'values' => $attribute->values->map(fn (AttributeValue $value): array => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'slug' => $value->slug,
                    'color_hex' => $value->color_hex,
                    'sort_order' => $value->sort_order,
                ]),
            ],
        ]);
    }

    /**
     * Update the given attribute.
     */
    public function update(Request $request, Attribute $attribute): RedirectResponse
    {
        $data = $this->validated($request, $attribute);
        $values = $this->valuePayload($request);

        DB::transaction(function () use ($attribute, $data, $values): void {
            $attribute->update($this->attributes($data, $attribute));
            $this->syncValues($attribute, $values);
        });

        return back()->with('success', "Attribute \"{$attribute->name}\" updated successfully.");
    }

    /**
     * Delete the given attribute.
     */
    public function destroy(Attribute $attribute): RedirectResponse
    {
        $name = $attribute->name;
        $attribute->delete();

        return redirect()
            ->route('admin.attributes.index')
            ->with('success', "Attribute \"{$name}\" deleted.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Attribute $attribute = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('attributes', 'slug')->ignore($attribute?->id)],
            'type' => ['required', 'string', 'in:select,color,text'],
            'is_filterable' => ['boolean'],
            'is_variation' => ['boolean'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'values' => ['array'],
            'values.*.id' => ['nullable', 'integer', 'exists:attribute_values,id'],
            'values.*.value' => ['required', 'string', 'max:255'],
            'values.*.color_hex' => ['nullable', 'string', 'max:9'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data, ?Attribute $attribute = null): array
    {
        return [
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null)
                ? $data['slug']
                : Str::slug($data['name']),
            'type' => $data['type'],
            'is_filterable' => (bool) ($data['is_filterable'] ?? false),
            'is_variation' => (bool) ($data['is_variation'] ?? false),
            'sort_order' => $data['sort_order'],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function valuePayload(Request $request): array
    {
        return collect($request->input('values', []))
            ->filter(fn (array $value): bool => filled($value['value'] ?? null))
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $values
     */
    private function syncValues(Attribute $attribute, array $values): void
    {
        $keptIds = [];

        foreach ($values as $index => $value) {
            $slug = Str::slug($value['value']);

            $model = $attribute->values()->updateOrCreate(
                ['id' => $value['id'] ?? null],
                [
                    'value' => $value['value'],
                    'slug' => $slug,
                    'color_hex' => $value['color_hex'] ?? null,
                    'sort_order' => $index,
                ],
            );

            $keptIds[] = $model->id;
        }

        $attribute->values()->whereNotIn('id', $keptIds)->delete();
    }
}
