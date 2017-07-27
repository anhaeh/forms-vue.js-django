import json

from django.core import serializers
from django.shortcuts import render, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from app.models import Project
from app.forms import ProjectForm


class Index(View):
    template_name = 'app_with_forms.html'

    def get(self, request):
        return render(request, template_name=self.template_name)


@method_decorator(csrf_exempt, name='dispatch')
class Projects(View):

    def get(self, request):
        data = serializers.serialize("json", Project.objects.all())
        return HttpResponse(data, content_type="application/json")

    def delete(self, request):
        data = json.loads(request.body)
        pk = data.get('pk')
        Project.objects.get(pk=pk).delete()
        response = json.dumps({'status': 'ok'})
        return HttpResponse(response, content_type="application/json")

    def post(self, request):
        data = json.loads(request.body)
        form = ProjectForm(data)
        if form.is_valid():
            new_project = form.save()
            response = serializers.serialize("json", [new_project])
        else:
            response = json.dumps({'errors': form.errors})
        return HttpResponse(response, content_type="application/json")
