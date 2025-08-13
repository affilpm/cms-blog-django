from django.contrib import admin
from .models import Post, Category, PostReaction, Comment, PostView

admin.site.register(Post)
admin.site.register(PostReaction)

admin.site.register(Category)
admin.site.register(Comment)
admin.site.register(PostView)



