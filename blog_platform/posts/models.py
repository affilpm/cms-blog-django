from django.db import models
from django.contrib.auth import get_user_model
from core.models.base import TimeStampedModel 

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    
    def __str__(self):
        return self.name
    
class Post(TimeStampedModel):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    cover_image = models.ImageField(upload_to='post_images', blank=True, null=True)
    attachment = models.FileField(upload_to='post_attachment', blank=True, null=True)
    view_count = models.PositiveIntegerField(default=0)
    is_draft = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title
    
    @property
    def attachment_name(self):
        if self.attachment:
            return self.attachment.name.split('/')[-1]
        return None
    
    @property
    def attachment_size(self):
        if self.attachment: 
            try:
                self.attachment.size
            except:
                return 0
            return 0
        
    def get_attachment_type(self):
        if self.attachment:
            import mimetypes
            mime_type, _ = mimetypes.guess_type(self.attachment.name)
            return mime_type
        return None        
    
    def total_likes(self):
        return self.reactions.count()
    
    def is_published(self):
        return not self.is_draft
    
    
class PostReaction(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    
    class Meta:
        unique_together = ('user', 'post')
        
    def __str__(self):
        return f"{self.user} liked {self.post}"        

class Comment(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} on {self.post.title}"
        
class PostView(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='views')
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} viewed {self.post.title}"
    
