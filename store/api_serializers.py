from rest_framework import serializers

from .models import Order, OrderItem, Product, ProductImage, ProductReview
from .shipping import calculate_shipping
from .validators import validate_phone


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'order')


class ProductListSerializer(serializers.ModelSerializer):
    image_main = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

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
            'average_rating',
            'review_count',
        )

    def get_image_main(self, obj):
        request = self.context.get('request')
        if not obj.image_main:
            return None
        url = obj.image_main.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def get_average_rating(self, obj):
        return obj.average_rating

    def get_review_count(self, obj):
        return obj.review_count


class ProductReviewSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = (
            'id',
            'name',
            'rating',
            'comment',
            'image',
            'video',
            'created_at',
        )

    def _abs(self, file_field):
        if not file_field:
            return None
        request = self.context.get('request')
        url = file_field.url
        return request.build_absolute_uri(url) if request else url

    def get_image(self, obj):
        return self._abs(obj.image)

    def get_video(self, obj):
        return self._abs(obj.video)


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    rating_breakdown = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            'description',
            'top_notes',
            'heart_notes',
            'base_notes',
            'images',
            'reviews',
            'rating_breakdown',
        )

    def get_reviews(self, obj):
        qs = obj.approved_reviews.all()[:50]
        return ProductReviewSerializer(qs, many=True, context=self.context).data

    def get_rating_breakdown(self, obj):
        return obj.rating_breakdown


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
