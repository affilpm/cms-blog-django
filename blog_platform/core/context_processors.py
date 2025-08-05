from .utils.jwt_helper import JWTHelper

def jwt_user_context(request):
    access_token = request.COOKIES.get('access_token')
    user = None
    if access_token and JWTHelper.is_token_valid(access_token):
        user = JWTHelper.get_user_from_token(access_token)
       
    return {
        'user_is_authenticated': user is not None,
        'current_user': user
    }    