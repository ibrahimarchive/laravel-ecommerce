<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Render a static content page.
     */
    public function show(Page $page): Response
    {
        abort_unless($page->is_published, 404);

        return Inertia::render('Page/Show', [
            'page' => [
                'title' => $page->title,
                'slug' => $page->slug,
                'excerpt' => $page->excerpt,
                'content' => $page->content,
                'meta_title' => $page->meta_title ?? $page->title,
                'meta_description' => $page->meta_description ?? $page->excerpt,
                'updated_at' => $page->updated_at?->toIso8601String(),
            ],
        ]);
    }
}
