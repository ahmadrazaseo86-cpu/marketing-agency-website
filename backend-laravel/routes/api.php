<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ElementController;
use App\Http\Controllers\Api\SeoController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| NexaRank CMS - REST API Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);

// Public Page & Element Rendering API (for frontend marketing website)
Route::get('/elements', [ElementController::class, 'show']);
Route::get('/seo/audit', [SeoController::class, 'audit']);
Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);

// Protected NexaRank CMS Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Visual Element Builder (Elementor Alternative)
    Route::put('/elements', [ElementController::class, 'update']);

    // Posts Management
    Route::apiResource('posts', PostController::class);

    // Pages Management
    Route::apiResource('pages', PageController::class);

    // Media Library
    Route::apiResource('media', MediaController::class)->only(['index', 'store', 'destroy']);

    // Comments Management
    Route::get('/comments', [CommentController::class, 'index']);
    Route::put('/comments/{id}', [CommentController::class, 'updateStatus']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
});
