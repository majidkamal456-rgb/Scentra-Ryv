"""
URL configuration for startup project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.http import FileResponse, Http404, HttpResponse
from django.urls import include, path, re_path
from django.views.decorators.http import require_GET, require_http_methods
from django.views.static import serve

from store.sitemaps import ProductSitemap, StaticViewSitemap

sitemaps = {
    'products': ProductSitemap,
    'static': StaticViewSitemap,
}

OG_BANNER_FALLBACKS = (
    settings.BASE_DIR / 'static' / 'images' / 'scentra-ryv-og-banner.jpg',
    settings.BASE_DIR / 'staticfiles' / 'images' / 'scentra-ryv-og-banner.jpg',
    settings.BASE_DIR / 'static' / 'images' / 'scentra-ryv-og-banner.png',
    settings.BASE_DIR / 'staticfiles' / 'images' / 'scentra-ryv-og-banner.png',
)


@require_GET
def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /admin/",
        "Allow: /",
        "",
        "Sitemap: https://scentraryv.pk/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


@require_http_methods(['GET', 'HEAD'])
def og_banner(request):
    """Stable URL for social crawlers. Prefer JPEG for WhatsApp large cover preview."""
    banner = next((p for p in OG_BANNER_FALLBACKS if p.is_file()), None)
    if not banner:
        raise Http404('OG banner not found')

    content_type = 'image/jpeg' if banner.suffix.lower() in ('.jpg', '.jpeg') else 'image/png'

    if request.method == 'HEAD':
        response = HttpResponse(content_type=content_type)
        response['Content-Length'] = str(banner.stat().st_size)
        response['Cache-Control'] = 'public, max-age=86400'
        return response

    response = FileResponse(banner.open('rb'), content_type=content_type)
    response['Cache-Control'] = 'public, max-age=86400'
    response['Content-Length'] = str(banner.stat().st_size)
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myproject.urls')),
    path('api/store/', include('store.api_urls')),
    path('robots.txt', robots_txt, name='robots_txt'),
    path('og-banner.png', og_banner, name='og_banner'),
    path('og-banner.jpg', og_banner, name='og_banner_jpg'),
    path(
        'sitemap.xml',
        sitemap,
        {'sitemaps': sitemaps},
        name='django.contrib.sitemaps.views.sitemap',
    ),
    path('', include('store.urls')),
]

# Product images must be reachable with DEBUG=False (single-server deploy).
urlpatterns += [
    re_path(
        r'^media/(?P<path>.*)$',
        serve,
        {'document_root': settings.MEDIA_ROOT},
    ),
]
