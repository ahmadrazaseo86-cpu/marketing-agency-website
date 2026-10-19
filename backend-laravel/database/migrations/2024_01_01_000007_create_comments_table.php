<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('post_id');
            $table->string('author_name');
            $table->string('author_email');
            $table->string('author_url')->nullable();
            $table->string('author_ip')->nullable();
            $table->text('content');
            $table->enum('status', ['APPROVED', 'PENDING', 'SPAM', 'TRASH'])->default('PENDING');
            $table->string('parent_id')->nullable();
            $table->string('user_id')->nullable();
            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
