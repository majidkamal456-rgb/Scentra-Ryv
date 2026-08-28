from django.http import HttpResponse


class SimpleCorsMiddleware:
    """Lightweight CORS for the Next.js storefront (no extra package)."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS' and request.path.startswith('/api/'):
            response = HttpResponse()
        else:
            response = self.get_response(request)

        origin = request.headers.get('Origin', '')
        from django.conf import settings
        allowed = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        if origin in allowed or getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False):
            response['Access-Control-Allow-Origin'] = origin or '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Accept, Content-Type, Authorization, X-CSRFToken'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
        return response
