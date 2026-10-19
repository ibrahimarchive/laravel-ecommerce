<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a listing of brands.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: null,
        ];

        $brands = Brand::query()
            ->withCount('products')
            ->when($filters['q'], fn ($query, $term) => $query->where('name', 'like', "%{$term}%"))
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->orderBy('name')
            ->get()
            ->map(fn (Brand $brand): array => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo' => $brand->logo,
                'website' => $brand->website,
                'products_count' => $brand->products_count,
                'is_active' => (bool) $brand->is_active,
                'is_featured' => (bool) $brand->is_featured,
                'sort_order' => $brand->sort_order,
            ]);

        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new brand.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Brands/Create');
    }

    /**
     * Store a newly created brand.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Brand::create($this->attributes($data));

        return redirect()
            ->route('admin.brands.index')
            ->with('success', "Brand \"{$data['name']}\" created successfully.");
    }

    /**
     * Show the form for editing the given brand.
     */
    public function edit(Brand $brand): Response
    {
        return Inertia::render('Admin/Brands/Edit', [
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'description' => $brand->description,
                'logo' => $brand->logo,
                'website' => $brand->website,
                'is_active' => (bool) $brand->is_active,
                'is_featured' => (bool) $brand->is_featured,
                'sort_order' => $brand->sort_order,
            ],
        ]);
    }

    /**
     * Update the given brand.
     */
    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $data = $this->validated($request, $brand);

        $brand->update($this->attributes($data, $brand));

        return back()->with('success', "Brand \"{$brand->name}\" updated successfully.");
    }

    /**
     * Delete the given brand.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        $name = $brand->name;
        $brand->delete();

        return redirect()
            ->route('admin.brands.index')
            ->with('success', "Brand \"{$name}\" deleted.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Brand $brand = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brand?->id)],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:2048'],
            'website' => ['nullable', 'url', 'max:255'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['required', 'integer', 'min:0'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data, ?Brand $brand = null): array
    {
        return [
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null)
                ? $data['slug']
                : Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'logo' => $data['logo'] ?? null,
            'website' => $data['website'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? false),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'sort_order' => $data['sort_order'],
        ];
    }
}
