<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'url',
        'path',
        'alt_text',
        'title',
        'caption',
        'description',
        'width',
        'height',
        'uploader_id',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
