from django.urls import path

from . import api_views

urlpatterns = [
    path('products/', api_views.product_list, name='api_product_list'),
    path('products/<slug:slug>/', api_views.product_detail, name='api_product_detail'),
    path('products/<slug:slug>/reviews/', api_views.product_review_create, name='api_product_review'),
    path('reviews/', api_views.review_list, name='api_review_list'),
    path('config/', api_views.site_config, name='api_site_config'),
    path('cities/', api_views.shipping_cities, name='api_shipping_cities'),
    path('checkout/', api_views.checkout_create, name='api_checkout'),
    path('orders/<str:order_number>/', api_views.order_detail, name='api_order_detail'),
    path(
        'orders/<str:order_number>/tracking/',
        api_views.order_tracking,
        name='api_order_tracking',
    ),
    path(
        'tracking/<str:tracking_number>/',
        api_views.tracking_by_cn,
        name='api_tracking_by_cn',
    ),
    path('returns/', api_views.return_request, name='api_returns'),
]
