from django.urls import path

from . import api_views

urlpatterns = [
    path('products/', api_views.product_list, name='api_product_list'),
    path('products/<slug:slug>/', api_views.product_detail, name='api_product_detail'),
    path('config/', api_views.site_config, name='api_site_config'),
    path('checkout/', api_views.checkout_create, name='api_checkout'),
    path('orders/<str:order_number>/', api_views.order_detail, name='api_order_detail'),
    path('returns/', api_views.return_request, name='api_returns'),
]
