import random
from django import template
from bs4 import BeautifulSoup

register = template.Library()

@register.filter
def short_content(post, length=150):
        soup = BeautifulSoup(post.content, "html.parser")
        text = soup.get_text()
        snippet = text[:length] + ('...' if len(text) > length else '')
        
        return f"<p>{snippet}</p>"    