from djoser.email import ActivationEmail, PasswordResetEmail
from decouple import config

from .tasks import send_djoser_email_task

DOMAIN = config("ALLOWED_ENV_HOST", default="localhost:3000")


class BaseCeleryEmail:
    def send(self, to, *args, **kwargs):
        if kwargs.pop("now", False):
            return super().send(to, *args, **kwargs)

        class_path = f"{self.__class__.__module__}.{self.__class__.__name__}"
        context = self.get_context_data()

        user = context.pop("user")
        context.pop("view", None)
        context.pop("request", None)

        send_djoser_email_task.delay(class_path, user.id, context)


class CustomActivationEmail(BaseCeleryEmail, ActivationEmail):
    template_name = "email/custom_activation.html"

    def get_context_data(self):
        context = super().get_context_data()
        context["domain"] = DOMAIN
        return context


class CustomPasswordResetEmail(BaseCeleryEmail, PasswordResetEmail):
    template_name = "email/custom_password_reset.html"

    def get_context_data(self):
        context = super().get_context_data()
        context["domain"] = DOMAIN
        return context