from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_bookmark_tags'),
    ]

    operations = [
        migrations.AddField(
            model_name='registereduser',
            name='reset_token',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='registereduser',
            name='reset_token_expiry',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]