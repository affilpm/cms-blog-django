from django.contrib import admin
from .models import Post, Category, PostReaction, Comment

admin.site.register(Post)
admin.site.register(PostReaction)

admin.site.register(Category)
admin.site.register(Comment)


