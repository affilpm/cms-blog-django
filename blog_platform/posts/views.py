from django.shortcuts import render
# from django.views.decorators.cache import never_cache
# from django.utils.decorators import method_decorator 

# @method_decorator(never_cache, name='dispatch')  

def PostView(request):
    return render(request, 'posts/blog_create.html')
