<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: null,
        ];

        $categories = Category::query()
            ->with('parent:id,name')
            ->withCount(['products', 'children'])
            ->when($filters['q'], fn ($query, $term) => $query->where('name', 'like', "%{$term}%"))
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'parent' => $category->parent?->name,
                'parent_id' => $category->parent_id,
                'products_count' => $category->products_count,
                'children_count' => $category->children_count,
                'is_active' => (bool) $category->is_active,
                'is_featured' => (bool) $category->is_featured,
                'sort_order' => $category->sort_order,
            ]);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Create', [
            'parents' => $this->parentOptions(),
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Category::create($this->attributes($data));

        return redirect()
            ->route('admin.categories.index')
            ->with('success', "Category \"{$data['name']}\" created successfully.");
    }

    /**
     * Show the form for editing the given category.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'parent_id' => $category->parent_id,
                'description' => $category->description,
                'image' => $category->image,
                'meta_title' => $category->meta_title,
                'meta_description' => $category->meta_description,
                'is_active' => (bool) $category->is_active,
                'is_featured' => (bool) $category->is_featured,
                'sort_order' => $category->sort_order,
            ],
            'parents' => $this->parentOptions($category->id),
        ]);
    }

    /**
     * Update the given category.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $this->validated($request, $category);

        $category->update($this->attributes($data, $category));

        return back()->with('success', "Category \"{$category->name}\" updated successfully.");
    }

    /**
     * Delete the given category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        if ($category->children()->exists()) {
            return back()->with('error', 'Move or delete the child categories before deleting this one.');
        }

        $name = $category->name;
        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', "Category \"{$name}\" deleted.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category?->id)],
            'parent_id' => ['nullable', 'integer', Rule::notIn([$category?->id]), 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['required', 'integer', 'min:0'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data, ?Category $category = null): array
    {
        return [
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
            'slug' => filled($data['slug'] ?? null)
                ? $data['slug']
                : Category::generateSlug($data['name'], $category?->id),
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? false),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'sort_order' => $data['sort_order'],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function parentOptions(?int $excludeId = null): array
    {
        return Category::query()
            ->whereNull('parent_id')
            ->when($excludeId !== null, fn ($query) => $query->whereKeyNot($excludeId))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->all();
    }
}
