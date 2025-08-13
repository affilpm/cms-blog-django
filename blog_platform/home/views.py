from django.views.generic import TemplateView
from core.views.mixins import JWTLoginRequiredMixin, NormalUserOnlyMixin
from django.views import View
from posts.models import Post
from django.shortcuts import render
from posts.utils.ip import get_client_ip
from users.models import CustomUser
from django.db.models import Q
    
class HomeView(NormalUserOnlyMixin, View):
    template_name = 'home/home.html'
    
    def get(self, request, *args, **kwargs):
        # top posts by view count
        featured_posts = Post.objects.select_related('author', 'category').prefetch_related('comments').filter(is_draft=False).order_by('-view_count', '-created_at')[:3]

        recent_posts = Post.objects.prefetch_related('author', 'category').prefetch_related('comments').filter(is_draft=False).order_by('-created_at')[:2]
        
        total_posts = Post.objects.filter(is_draft=False).count()
        
        total_readers = CustomUser.objects.filter(Q(is_superuser=False) | Q(is_staff=False)).count()
        
        total_writers = CustomUser.objects.filter(Q(is_superuser=True) | Q(is_superuser=True)).count()
        
        context = {
            'featured_posts':featured_posts,
            'recent_posts':recent_posts,
            'total_posts': total_posts,
            'total_readers': total_readers,
            'total_writers': total_writers
        }
        
        return render(request, self.template_name, context=context)

class PostListView(NormalUserOnlyMixin, View):
    template_name = 'home/post_list.html'
    
    def get(self, request, *args, **kwargs):
        # top posts by view count
        posts = Post.objects.select_related('author', 'category').prefetch_related('comments').filter(is_draft=False).order_by('-view_count', '-created_at')
        
        return render(request, self.template_name, context={'posts':posts})

class PostDetailView(NormalUserOnlyMixin, TemplateView):
    template_name = 'home/post_detail.html'    
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post_id = self.kwargs.get('post_id')  
        post_data = Post.objects.get(id=post_id)
        user_id = self.request.user.id
        is_liked = post_data.reactions.filter(user_id = user_id).exists()
        context['post'] = post_data
        context['is_liked'] = is_liked
        return context        
        
