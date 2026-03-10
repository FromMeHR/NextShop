from django.utils.html import escape
from rest_framework import serializers


class SanitizeSerializerMixin:
    def sanitize_fields(self, internal_value, fields_to_sanitize):
        errors = {}
        for field_name in fields_to_sanitize:
            if field_name in internal_value and isinstance(internal_value[field_name], str):
                original_value = internal_value[field_name]
                escaped_value = escape(original_value).strip().replace("&#x27;", "'")

                max_length = self.fields[field_name].max_length
                if max_length and len(escaped_value) > max_length:
                    errors[field_name] = f"Значення занадто довге після обробки спецсимволів."
                else:
                    internal_value[field_name] = escaped_value
        if errors:
            raise serializers.ValidationError(errors)
        return internal_value