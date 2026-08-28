from rest_framework import serializers

from .models import Order, OrderItem, Product, ProductImage
from .shipping import calculate_shipping
from .validators import validate_phone


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'order')


class ProductListSerializer(serializers.ModelSerializer):
    image_main = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'short_description',
            'price',
            'size_ml',
            'stock',
            'image_main',
            'gender',
            'is_featured',
            'in_stock',
        )

    def get_image_main(self, obj):
        request = self.context.get('request')
        if not obj.image_main:
            return None
        url = obj.image_main.url
        if request:
            return request.build_absolute_uri(url)
        return url


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            'description',
            'top_notes',
            'heart_notes',
            'base_notes',
            'images',
        )


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    size = serializers.CharField(required=False, allow_blank=True, default='')


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES)
    items = CheckoutItemSerializer(many=True)

    def validate_phone(self, value):
        import re
        phone = re.sub(r'\D', '', value.strip())
        if phone.startswith('92') and len(phone) == 12:
            phone = '0' + phone[2:]
        validate_phone(phone)
        return phone

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Cart is empty.')
        return value


class SiteConfigSerializer(serializers.Serializer):
    whatsapp_number = serializers.CharField()
    contact_email = serializers.EmailField()
    shipping_nearby_rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    shipping_other_rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    bank_details = serializers.DictField()
