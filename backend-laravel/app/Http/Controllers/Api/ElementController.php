<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ElementController extends Controller
{
    /**
     * Get visual elements for a given page
     */
    public function show(Request $request)
    {
        $page = $request->query('page', 'home');
        $optionKey = "nexarank_elements_{$page}";

        $option = Option::where('key', $optionKey)->first();

        if ($option) {
            $elements = json_decode($option->value, true);
            if ($elements) {
                return response()->json([
                    'elements' => $elements,
                    'page' => $page
                ]);
            }
        }

        // Return default marketing website element structure
        return response()->json([
            'elements' => $this->getDefaultElements($page),
            'page' => $page,
        ]);
    }

    /**
     * Save updated visual elements from the Visual Builder
     */
    public function update(Request $request)
    {
        $request->validate([
            'page' => 'required|string',
            'elements' => 'required|array',
        ]);

        $page = $request->input('page');
        $elements = $request->input('elements');
        $optionKey = "nexarank_elements_{$page}";

        Option::updateOrCreate(
            ['key' => $optionKey],
            [
                'id' => (string) Str::uuid(),
                'value' => json_encode($elements, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
                'autoload' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Visual elements for '{$page}' saved successfully.",
            'elements' => $elements,
        ]);
    }

    /**
     * Default elements matching the live agency website
     */
    private function getDefaultElements(string $page): array
    {
        return [
            'hero' => [
                'badge' => 'Strategic Digital Growth Agency',
                'title' => 'Strategic Marketing That Drives Measurable Growth',
                'subtitle' => 'We help businesses in Pakistan and beyond build strong brands, generate qualified leads and achieve sustainable growth through data-driven digital marketing.',
                'ctaPrimaryText' => 'Explore Our Services',
                'ctaPrimaryLink' => '/services',
                'ctaSecondaryText' => 'Contact Us Today',
                'ctaSecondaryLink' => '/contact',
                'backgroundImage' => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop',
            ],
            'intro' => [
                'heading' => 'A Marketing Partner You Can Rely On',
                'text' => 'NexaRank was founded in Lahore, Pakistan with a clear mission: to provide businesses with honest, effective and results-driven marketing services.',
                'image' => 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
            ],
            'stats' => [
                ['id' => '1', 'number' => '8+', 'label' => 'Years of Experience'],
                ['id' => '2', 'number' => '200+', 'label' => 'Projects Delivered'],
                ['id' => '3', 'number' => '150+', 'label' => 'Clients Served'],
                ['id' => '4', 'number' => '94%', 'label' => 'Client Retention Rate'],
            ],
            'contactInfo' => [
                'email' => 'ahmadrazaseo86@gmail.com',
                'phone' => '+92 304 4599845',
                'address' => 'Lahore, Punjab, Pakistan',
                'hours' => 'Monday to Friday, 9:00 to 18:00',
            ],
            'ctaBand' => [
                'title' => 'Ready to Scale Your Business?',
                'text' => 'Get in touch with our strategy team for a free marketing consultation and website audit.',
                'buttonText' => 'Request Free Consultation',
                'buttonLink' => '/contact',
            ],
        ];
    }
}
