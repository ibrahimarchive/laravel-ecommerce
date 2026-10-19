<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display a listing of pages.
     */
    public function index(): Response
    {
        $pages = Page::query()
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get()
            ->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'is_published' => (bool) $page->is_published,
                'show_in_footer' => (bool) $page->show_in_footer,
                'sort_order' => $page->sort_order,
                'updated_at' => $page->updated_at->toDateString(),
            ]);

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
        ]);
    }

    /**
     * Show the form for creating a new page.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Create');
    }

    /**
     * Store a newly created page.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Page::create($this->attributes($data));

        return redirect()
            ->route('admin.pages.index')
            ->with('success', "Page \"{$data['title']}\" created successfully.");
    }

    /**
     * Show the form for editing the given page.
     */
    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'is_published' => (bool) $page->is_published,
                'show_in_footer' => (bool) $page->show_in_footer,
                'published_at' => $page->published_at?->toDateString(),
                'sort_order' => $page->sort_order,
            ],
        ]);
    }

    /**
     * Update the given page.
     */
    public function update(Request $request, Page $page): RedirectResponse
    {
        $data = $this->validated($request, $page);

        $page->update($this->attributes($data, $page));

        return back()->with('success', "Page \"{$page->title}\" updated successfully.");
    }

    /**
     * Delete the given page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        $title = $page->title;
        $page->delete();

        return redirect()
            ->route('admin.pages.index')
            ->with('success', "Page \"{$title}\" deleted.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Page $page = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('pages', 'slug')->ignore($page?->id)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
            'show_in_footer' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order' => ['required', 'integer', 'min:0'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data, ?Page $page = null): array
    {
        return [
            'title' => $data['title'],
            'slug' => filled($data['slug'] ?? null)
                ? $data['slug']
                : Page::generateSlug($data['title'], $page?->id),
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? null,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'is_published' => (bool) ($data['is_published'] ?? false),
            'show_in_footer' => (bool) ($data['show_in_footer'] ?? false),
            'published_at' => $data['published_at'] ?? null,
            'sort_order' => $data['sort_order'],
        ];
    }
}
