from django.shortcuts import render
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator 
from core.views.mixins import SuperUserRequiredMixin
from django.views.generic import TemplateView

@method_decorator(never_cache, name='dispatch')  
class PostCreateView(SuperUserRequiredMixin, TemplateView):
    template_name = 'posts/blog_create.html'
    
@method_decorator(never_cache, name='dispatch')    
class PostEditView(SuperUserRequiredMixin, TemplateView):
    template_name = 'posts/blog_edit.html'
     
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['post_id'] = self.kwargs.get('post_id')
        return context 
