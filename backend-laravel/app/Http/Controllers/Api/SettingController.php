<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    /**
     * Get settings
     */
    public function index()
    {
        $options = Option::all()->pluck('value', 'key');

        return response()->json([
            'siteTitle' => $options['site_title'] ?? 'NexaRank Agency',
            'tagline' => $options['site_tagline'] ?? 'Strategic Marketing That Drives Measurable Growth',
            'siteUrl' => $options['site_url'] ?? 'http://localhost:3000',
            'adminEmail' => $options['admin_email'] ?? 'ahmadrazaseo86@gmail.com',
            'timezone' => $options['timezone'] ?? 'Asia/Karachi',
            'dateFormat' => $options['date_format'] ?? 'F j, Y',
            'timeFormat' => $options['time_format'] ?? 'g:i a',
            'postsPerPage' => (int) ($options['posts_per_page'] ?? 10),
            'defaultRole' => $options['default_role'] ?? 'SUBSCRIBER',
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $fields = [
            'siteTitle' => 'site_title',
            'tagline' => 'site_tagline',
            'siteUrl' => 'site_url',
            'adminEmail' => 'admin_email',
            'timezone' => 'timezone',
            'dateFormat' => 'date_format',
            'timeFormat' => 'time_format',
            'postsPerPage' => 'posts_per_page',
            'defaultRole' => 'default_role',
        ];

        foreach ($fields as $reqKey => $dbKey) {
            if ($request->has($reqKey)) {
                Option::updateOrCreate(
                    ['key' => $dbKey],
                    [
                        'id' => (string) Str::uuid(),
                        'value' => (string) $request->input($reqKey),
                        'autoload' => true
                    ]
                );
            }
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
