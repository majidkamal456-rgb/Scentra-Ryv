from django.db import models
from django.db.models import Avg, Count, Q
from django.urls import reverse
from django.utils.text import slugify


class Product(models.Model):
    GENDER_CHOICES = [
        ('unisex', 'Unisex'),
        ('men', 'Men'),
        ('women', 'Women'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=255)
    description = models.TextField()
    top_notes = models.CharField(max_length=255)
    heart_notes = models.CharField(max_length=255)
    base_notes = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size_ml = models.CharField(max_length=20, default='50ml')
    stock = models.PositiveIntegerField(default=50)
    image_main = models.ImageField(upload_to='products/', blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    is_featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('store:product_detail', kwargs={'slug': self.slug})

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def approved_reviews(self):
        return self.reviews.filter(is_approved=True)

    @property
    def average_rating(self):
        if hasattr(self, '_avg_rating'):
            return round(float(self._avg_rating), 1) if self._avg_rating else 0.0
        result = self.approved_reviews.aggregate(avg=Avg('rating'))['avg']
        return round(float(result), 1) if result else 0.0

    @property
    def review_count(self):
        if hasattr(self, '_review_count'):
            return int(self._review_count or 0)
        return self.approved_reviews.count()

    @property
    def rating_breakdown(self):
        """Return 5→1 star histogram rows with count + percent."""
        total = self.review_count
        counts = {i: 0 for i in range(1, 6)}
        for row in self.approved_reviews.values('rating').annotate(c=Count('id')):
            rating = int(row['rating'])
            if rating in counts:
                counts[rating] = row['c']
        return [
            {
                'stars': stars,
                'count': counts[stars],
                'percent': int(round((counts[stars] / total) * 100)) if total else 0,
            }
            for stars in range(5, 0, -1)
        ]


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.product.name} — image {self.pk}'


class ProductReview(models.Model):
    RATING_CHOICES = [(i, f'{i} star{"s" if i != 1 else ""}') for i in range(1, 6)]

    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    image = models.ImageField(upload_to='reviews/images/', blank=True, null=True)
    video = models.FileField(upload_to='reviews/videos/', blank=True, null=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.rating}★ by {self.name} on {self.product.name}'


def annotate_product_ratings(queryset):
    """Attach average rating + review count for list/card views."""
    return queryset.annotate(
        _avg_rating=Avg('reviews__rating', filter=Q(reviews__is_approved=True)),
        _review_count=Count('reviews', filter=Q(reviews__is_approved=True)),
    )


class Order(models.Model):
    PAYMENT_COD = 'cod'
    PAYMENT_BANK = 'bank_transfer'
    PAYMENT_CHOICES = [
        (PAYMENT_COD, 'Cash on Delivery'),
        (PAYMENT_BANK, 'Bank Transfer'),
    ]

    STATUS_PENDING_COD = 'pending_cod'
    STATUS_PENDING_VERIFICATION = 'pending_verification'
    STATUS_PAYMENT_VERIFIED = 'payment_verified'
    STATUS_PROCESSING = 'processing'
    STATUS_SHIPPED = 'shipped'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING_COD, 'Pending - COD'),
        (STATUS_PENDING_VERIFICATION, 'Pending - Awaiting Payment Verification'),
        (STATUS_PAYMENT_VERIFIED, 'Payment Verified'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_SHIPPED, 'Shipped'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    order_number = models.CharField(max_length=20, unique=True, editable=False)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    free_tester = models.ForeignKey(
        'Product',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='free_tester_orders',
        help_text='Free tester perfume chosen with this order (Buy 1 Get Free Tester offer).',
    )
    free_tester_name = models.CharField(
        max_length=200,
        blank=True,
        help_text='Snapshot of free tester product name at order time.',
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_screenshot = models.ImageField(
        upload_to='payment_proofs/',
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Flaship Partners booking
    flaship_booking_id = models.CharField(max_length=64, blank=True)
    flaship_tracking_number = models.CharField(max_length=64, blank=True)
    flaship_courier_code = models.CharField(max_length=32, blank=True)
    flaship_booking_status = models.CharField(max_length=40, blank=True)
    flaship_label_url = models.URLField(max_length=500, blank=True)
    flaship_booking_error = models.CharField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order {self.order_number}'

    def save(self, *args, **kwargs):
        if not self.order_number:
            from django.utils import timezone
            import random
            timestamp = timezone.now().strftime('%y%m%d')
            random_suffix = random.randint(1000, 9999)
            self.order_number = f'SR-{timestamp}-{random_suffix}'
        super().save(*args, **kwargs)

    @property
    def can_move_to_processing(self):
        return (
            self.status in (self.STATUS_PENDING_COD, self.STATUS_PAYMENT_VERIFIED)
            and self.payment_method == self.PAYMENT_COD
            or self.status == self.STATUS_PAYMENT_VERIFIED
        )


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    size_ml = models.CharField(max_length=20)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}x {self.product_name}'

    @property
    def line_total(self):
        return self.price_at_purchase * self.quantity


class StoreSettings(models.Model):
    """
    Singleton store settings — admin only.

    Flaship pickup is chosen here and never shown on the customer checkout page.
    """

    flaship_pickup_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Flaship pickup location used for shipment booking. Leave empty to auto-use the only / default pickup.',
    )
    flaship_pickup_label = models.CharField(
        max_length=255,
        blank=True,
        help_text='Cached label from Flaship (name · city).',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Store settings'
        verbose_name_plural = 'Store settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        if self.flaship_pickup_id:
            label = self.flaship_pickup_label or f'#{self.flaship_pickup_id}'
            return f'Store settings · pickup {label}'
        return 'Store settings · pickup auto'


class FlashipCnAudit(models.Model):
    """
    CN payment / charges audit from Flaship GET /api/integration/payments/.

    Compares courier CN charges vs customer shipping charged on the store order
    to compute shipping profit and margin ratio.
    """

    tracking_number = models.CharField(max_length=64, unique=True, db_index=True)
    order = models.ForeignKey(
        Order,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='flaship_audits',
    )
    order_number = models.CharField(max_length=32, blank=True, db_index=True)
    external_ref_no = models.CharField(max_length=64, blank=True)
    courier_code = models.CharField(max_length=32, blank=True)
    shipment_status = models.CharField(max_length=40, blank=True)
    finance_status = models.CharField(max_length=40, blank=True)
    settlement_status = models.CharField(max_length=40, blank=True, db_index=True)
    settlement_date = models.CharField(max_length=32, blank=True)
    cheque_no = models.CharField(max_length=64, blank=True)
    arrival_weight = models.CharField(max_length=20, blank=True)

    cod_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    line_net = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    delivery_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    osa_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    core_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    income_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    withholding_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_charges = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Total charges billed on the CN by courier/Flaship.',
    )

    customer_shipping = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='Delivery charges collected from customer on the store order.',
    )
    order_subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    shipping_profit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='customer_shipping − total_charges',
    )
    shipping_margin_pct = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text='Shipping profit ÷ customer shipping × 100 (or -100 if free ship + courier cost).',
    )
    contribution_profit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text='order_subtotal − total_charges (product revenue after courier cost)',
    )
    contribution_margin_pct = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text='contribution_profit ÷ order_subtotal × 100',
    )

    raw_payload = models.JSONField(default=dict, blank=True)
    synced_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-synced_at']
        verbose_name = 'Flaship CN audit'
        verbose_name_plural = 'Flaship CN audits'

    def __str__(self):
        return f'CN {self.tracking_number} · charges {self.total_charges}'
