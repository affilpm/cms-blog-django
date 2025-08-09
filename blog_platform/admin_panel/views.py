from django.shortcuts import render
from core.views.mixins import SuperUserRequiredMixin, ActiveSectionMixin
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator

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
        
        