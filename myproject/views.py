from rest_framework import viewsets,filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order

from .serializers import OrderSerializer
class OrderViewSet(viewsets.ModelViewSet):
    queryset=Order.objects.all().order_by('-created_at')
    serializer_class= OrderSerializer
    def get_queryset(self):
        queryset=super().get_queryset()
        search=self.request.query_params.get('search')
        if search:
            queryset=queryset.filter(customer_name__icontains=search) | queryset.filter(product_name__icontains=search)
        return queryset