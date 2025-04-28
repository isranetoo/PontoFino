from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer, RegisterSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
