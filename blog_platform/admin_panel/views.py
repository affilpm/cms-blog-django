from django.shortcuts import render
from core.views.mixins import SuperUserRequiredMixin, ActiveSectionMixin
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from posts.models import Post, PostReaction, Comment
from django.views import View


@method_decorator(never_cache, name='dispatch')
class DashboardView(SuperUserRequiredMixin, ActiveSectionMixin, TemplateView):
    template_name = 'admin_panel/dashboard.html'
    active_section = 'admin_dashboard'
  
@method_decorator(never_cache, name='dispatch')
class UsersListView(SuperUserRequiredMixin, ActiveSectionMixin, TemplateView):
    template_name = 'admin_panel/admin_users_list.html'
    active_section = 'admin_users_list'
    
@method_decorator(never_cache, name='dispatch')
class UserCreateView(SuperUserRequiredMixin, TemplateView):
    template_name = 'admin_panel/admin_user_create.html'

@method_decorator(never_cache, name='dispatch')
class UserEditView(SuperUserRequiredMixin, TemplateView):
    template_name = 'admin_panel/admin_user_edit.html'    
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user_id'] = self.kwargs.get('user_id')
        return context
    
@method_decorator(never_cache, name='dispatch')
class PostListView(SuperUserRequiredMixin, ActiveSectionMixin, TemplateView):
    template_name = 'admin_panel/admin_post_list.html'
    active_section = 'admin_post_list'    
        
@method_decorator(never_cache, name='dispatch')
class AdminPostDetailView(SuperUserRequiredMixin,TemplateView):
    template_name = 'admin_panel/admin_post_detail.html'    
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post_id = self.kwargs.get('post_id')  
        post_data = Post.objects.get(id=post_id)
        user_id = self.request.user.id
        is_liked = post_data.reactions.filter(user_id = user_id).exists()
        context['post'] = post_data
        context['is_liked'] = is_liked
        return context 
           
@method_decorator(never_cache, name='dispatch')
class AdminCommentView(SuperUserRequiredMixin, ActiveSectionMixin, View):    
        template_name = 'admin_panel/admin_comments_list.html'
        active_section = 'admin_comments' 
        
        def get(self, request):
            comments = Comment.objects.all()
            context = {
                'comments': comments,
                'active_section': self.active_section
                }
            return render(request, self.template_name, context=context)
            