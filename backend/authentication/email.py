from djoser.email import ActivationEmail, PasswordResetEmail
from decouple import config


DOMAIN = config("ALLOWED_ENV_HOST", default="localhost:3000")


class CustomActivationEmail(ActivationEmail):
    template_name = "email/custom_activation.html"
    
    def get_context_data(self):
        context = super().get_context_data()
        context["domain"] = DOMAIN
        return context


class CustomPasswordResetEmail(PasswordResetEmail):
    template_name = "email/custom_password_reset.html"
    
    def get_context_data(self):
        context = super().get_context_data()
        context["domain"] = DOMAIN
        return context