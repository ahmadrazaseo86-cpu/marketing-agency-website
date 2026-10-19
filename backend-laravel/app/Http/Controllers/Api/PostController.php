<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * List posts with filtering, search, status, and pagination
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
        $search = $request->query('search');
        $category = $request->query('category');
        $page = (int) $request->query('page', 1);
        $limit = (int) $request->query('limit', 20);

        $query = Post::with(['author', 'categories', 'tags'])
            ->withCount('comments');

        if ($status !== 'all') {
            $query->where('status', strtoupper($status));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($category) {
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        $total = $query->count();
        $posts = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        $statusCounts = [
            'all' => Post::count(),
            'published' => Post::where('status', 'PUBLISHED')->count(),
            'draft' => Post::where('status', 'DRAFT')->count(),
            'scheduled' => Post::where('status', 'SCHEDULED')->count(),
            'trash' => Post::where('status', 'TRASH')->count(),
        ];

        return response()->json([
            'posts' => $posts,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($total / $limit),
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Create new post
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'status' => 'nullable|in:DRAFT,PUBLISHED,SCHEDULED,TRASH',
        ]);

        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->title);
        $originalSlug = $slug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $user = $request->user();

        $post = Post::create([
            'id' => (string) Str::uuid(),
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->content ?? '',
            'excerpt' => $request->excerpt,
            'status' => $request->status ?? 'DRAFT',
            'visibility' => $request->visibility ?? 'PUBLIC',
            'password' => $request->password,
            'featured_image' => $request->featuredImage ?? $request->featured_image,
            'published_at' => $request->status === 'PUBLISHED' ? now() : $request->publishedAt,
            'author_id' => $user ? $user->id : Post::first()->author_id ?? (string) Str::uuid(),
            'meta_title' => $request->metaTitle ?? $request->meta_title,
            'meta_description' => $request->metaDescription ?? $request->meta_description,
            'focus_keyword' => $request->focusKeyword ?? $request->focus_keyword,
        ]);

        if ($request->has('categoryIds')) {
            $post->categories()->sync($request->categoryIds);
        }

        return response()->json($post->load(['categories', 'tags']), 201);
    }

    /**
     * Show single post
     */
    public function show(string $id)
    {
        $post = Post::with(['author', 'categories', 'tags'])->find($id);

        if (!$post) {
            $post = Post::with(['author', 'categories', 'tags'])->where('slug', $id)->first();
        }

        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    /**
     * Update post
     */
    public function update(Request $request, string $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        $data = $request->only([
            'title', 'content', 'excerpt', 'status', 'visibility',
            'password', 'meta_title', 'meta_description', 'focus_keyword'
        ]);

        if ($request->has('featuredImage')) {
            $data['featured_image'] = $request->featuredImage;
        }

        if ($request->has('metaTitle')) {
            $data['meta_title'] = $request->metaTitle;
        }

        if ($request->has('metaDescription')) {
            $data['meta_description'] = $request->metaDescription;
        }

        if ($request->has('focusKeyword')) {
            $data['focus_keyword'] = $request->focusKeyword;
        }

        if ($request->has('slug')) {
            $data['slug'] = Str::slug($request->slug);
        }

        $post->update($data);

        if ($request->has('categoryIds')) {
            $post->categories()->sync($request->categoryIds);
        }

        return response()->json($post->load(['categories', 'tags']));
    }

    /**
     * Delete post
     */
    public function destroy(string $id)
    {
        $post = Post::find($id);
        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }
}
