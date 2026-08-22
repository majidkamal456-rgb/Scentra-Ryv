from django import forms

from .models import Order
from .validators import validate_payment_screenshot, validate_phone


class CheckoutForm(forms.ModelForm):
    payment_method = forms.ChoiceField(
        choices=Order.PAYMENT_CHOICES,
        widget=forms.RadioSelect,
        initial=Order.PAYMENT_COD,
    )
    payment_screenshot = forms.FileField(
        required=False,
        validators=[validate_payment_screenshot],
        widget=forms.ClearableFileInput(
            attrs={
                'accept': 'image/jpeg,image/png,application/pdf',
                'class': 'hidden',
                'id': 'payment-screenshot',
            }
        ),
    )

    class Meta:
        model = Order
        fields = [
            'full_name',
            'phone',
            'address',
            'city',
            'email',
            'notes',
            'payment_method',
            'payment_screenshot',
        ]
        widgets = {
            'full_name': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'Your full name',
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': '03XX XXXXXXX',
            }),
            'address': forms.Textarea(attrs={
                'class': 'form-input',
                'rows': 3,
                'placeholder': 'House no, street, area',
            }),
            'city': forms.TextInput(attrs={
                'class': 'form-input',
                'placeholder': 'City',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-input',
                'placeholder': 'Email (optional)',
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-input',
                'rows': 2,
                'placeholder': 'Order notes (optional)',
            }),
        }

    def clean_phone(self):
        phone = self.cleaned_data['phone']
        validate_phone(phone)
        return phone.strip()

    def clean(self):
        cleaned = super().clean()
        payment_method = cleaned.get('payment_method')
        screenshot = cleaned.get('payment_screenshot')

        if payment_method == Order.PAYMENT_BANK and not screenshot:
            self.add_error(
                'payment_screenshot',
                'Payment screenshot is required for bank transfer orders.',
            )
        return cleaned
