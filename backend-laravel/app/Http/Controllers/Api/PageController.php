<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * List pages
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
        $search = $request->query('search');

        $query = Page::with('author');

        if ($status !== 'all') {
            $query->where('status', strtoupper($status));
        }

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $pages = $query->orderBy('order', 'asc')->orderBy('created_at', 'desc')->get();

        $statusCounts = [
            'all' => Page::count(),
            'published' => Page::where('status', 'PUBLISHED')->count(),
            'draft' => Page::where('status', 'DRAFT')->count(),
            'trash' => Page::where('status', 'TRASH')->count(),
        ];

        return response()->json([
            'pages' => $pages,
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Create page
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->title);
        $user = $request->user();

        $page = Page::create([
            'id' => (string) Str::uuid(),
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->content ?? '',
            'excerpt' => $request->excerpt,
            'status' => $request->status ?? 'DRAFT',
            'template' => $request->template ?? 'default',
            'parent_id' => $request->parentId ?? $request->parent_id,
            'order' => $request->order ?? 0,
            'author_id' => $user ? $user->id : Page::first()->author_id ?? (string) Str::uuid(),
            'meta_title' => $request->metaTitle ?? $request->meta_title,
            'meta_description' => $request->metaDescription ?? $request->meta_description,
        ]);

        return response()->json($page, 201);
    }

    /**
     * Show single page
     */
    public function show(string $id)
    {
        $page = Page::with('author')->find($id);
        if (!$page) {
            $page = Page::with('author')->where('slug', $id)->first();
        }

        if (!$page) {
            return response()->json(['error' => 'Page not found'], 404);
        }

        return response()->json($page);
    }

    /**
     * Update page
     */
    public function update(Request $request, string $id)
    {
        $page = Page::find($id);
        if (!$page) {
            return response()->json(['error' => 'Page not found'], 404);
        }

        $data = $request->only(['title', 'content', 'excerpt', 'status', 'template', 'order']);
        if ($request->has('slug')) $data['slug'] = Str::slug($request->slug);
        if ($request->has('metaTitle')) $data['meta_title'] = $request->metaTitle;
        if ($request->has('metaDescription')) $data['meta_description'] = $request->metaDescription;

        $page->update($data);
        return response()->json($page);
    }

    /**
     * Delete page
     */
    public function destroy(string $id)
    {
        $page = Page::find($id);
        if (!$page) {
            return response()->json(['error' => 'Page not found'], 404);
        }

        $page->delete();
        return response()->json(['message' => 'Page deleted successfully']);
    }
}
