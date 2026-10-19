<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommentController extends Controller
{
    /**
     * List comments
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = Comment::with('post');

        if ($status !== 'all') {
            $query->where('status', strtoupper($status));
        }

        $comments = $query->orderBy('created_at', 'desc')->get();

        $statusCounts = [
            'all' => Comment::count(),
            'approved' => Comment::where('status', 'APPROVED')->count(),
            'pending' => Comment::where('status', 'PENDING')->count(),
            'spam' => Comment::where('status', 'SPAM')->count(),
            'trash' => Comment::where('status', 'TRASH')->count(),
        ];

        return response()->json([
            'comments' => $comments,
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Change comment status (approve, spam, trash)
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:APPROVED,PENDING,SPAM,TRASH',
        ]);

        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['error' => 'Comment not found'], 404);
        }

        $comment->update(['status' => $request->status]);
        return response()->json($comment);
    }

    /**
     * Delete comment
     */
    public function destroy(string $id)
    {
        $comment = Comment::find($id);
        if (!$comment) {
            return response()->json(['error' => 'Comment not found'], 404);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
