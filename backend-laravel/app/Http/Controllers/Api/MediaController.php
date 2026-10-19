<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * List all media files
     */
    public function index(Request $request)
    {
        $type = $request->query('type');
        $search = $request->query('search');

        $query = Media::query();

        if ($type && $type !== 'all') {
            $query->where('mime_type', 'like', "{$type}%");
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        $media = $query->orderBy('created_at', 'desc')->get();
        return response()->json($media);
    }

    /**
     * Upload new media file
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $user = $request->user();

        $path = $file->store('uploads', 'public');
        $url = Storage::url($path);

        $media = Media::create([
            'id' => (string) Str::uuid(),
            'filename' => $file->hashName(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'url' => $url,
            'path' => $path,
            'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'uploader_id' => $user ? $user->id : (string) Str::uuid(),
        ]);

        return response()->json($media, 201);
    }

    /**
     * Delete media item
     */
    public function destroy(string $id)
    {
        $media = Media::find($id);
        if (!$media) {
            return response()->json(['error' => 'Media not found'], 404);
        }

        if ($media->path && Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        $media->delete();
        return response()->json(['message' => 'Media deleted successfully']);
    }
}
