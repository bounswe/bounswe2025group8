# Generated migration file
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_task_assignees'),
    ]

    operations = [
        # Add new fields to Review model
        migrations.AddField(
            model_name='review',
            name='accuracy_of_request',
            field=models.FloatField(
                blank=True,
                help_text='Was the task as described in the post?',
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='communication_volunteer_to_requester',
            field=models.FloatField(
                blank=True,
                help_text='Was the requester easy to communicate with?',
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='safety_and_preparedness',
            field=models.FloatField(
                blank=True,
                help_text='Did you feel safe at the location? Was the requester prepared?',
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='reliability',
            field=models.FloatField(
                blank=True,
                help_text='Did the volunteer arrive at the agreed-upon time?',
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='task_completion',
            field=models.FloatField(
                blank=True,
                help_text='Did the volunteer complete the task?',
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='communication_requester_to_volunteer',
            field=models.FloatField(
                blank=True,
                help_text="How clear and polite was the volunteer's communication?",
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AddField(
            model_name='review',
            name='safety_and_respect',
            field=models.FloatField(
                blank=True,
                help_text='Did you feel safe and respected during the interaction?',
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(1.0),
                    django.core.validators.MaxValueValidator(5.0)
                ]
            ),
        ),
        migrations.AlterField(
            model_name='review',
            name='comment',
            field=models.TextField(blank=True),
        ),
        
        # Create TaskReport model
        migrations.CreateModel(
            name='TaskReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(
                    choices=[
                        ('SPAM', 'Spam'),
                        ('INAPPROPRIATE_CONTENT', 'Inappropriate Content'),
                        ('HARASSMENT', 'Harassment'),
                        ('FRAUD', 'Fraud'),
                        ('FAKE_REQUEST', 'Fake Request'),
                        ('NO_SHOW', 'No Show'),
                        ('SAFETY_CONCERN', 'Safety Concern'),
                        ('OTHER', 'Other')
                    ],
                    default='OTHER',
                    max_length=50
                )),
                ('description', models.TextField()),
                ('status', models.CharField(
                    choices=[
                        ('PENDING', 'Pending'),
                        ('UNDER_REVIEW', 'Under Review'),
                        ('RESOLVED', 'Resolved'),
                        ('DISMISSED', 'Dismissed')
                    ],
                    default='PENDING',
                    max_length=20
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('admin_notes', models.TextField(blank=True)),
                ('reporter', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='task_reports_made',
                    to=settings.AUTH_USER_MODEL
                )),
                ('reviewed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='task_reports_reviewed',
                    to='core.administrator'
                )),
                ('task', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='reports',
                    to='core.task'
                )),
            ],options={
                'ordering': ['-created_at'],
            },
        ),
        
        # Create UserReport model
        migrations.CreateModel(
            name='UserReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(
                    choices=[
                        ('SPAM', 'Spam'),
                        ('INAPPROPRIATE_CONTENT', 'Inappropriate Content'),
                        ('HARASSMENT', 'Harassment'),
                        ('FRAUD', 'Fraud'),
                        ('FAKE_REQUEST', 'Fake Request'),
                        ('NO_SHOW', 'No Show'),
                        ('SAFETY_CONCERN', 'Safety Concern'),
                        ('OTHER', 'Other')
                    ],
                    default='OTHER',
                    max_length=50
                )),
                ('description', models.TextField()),
                ('status', models.CharField(
                    choices=[
                        ('PENDING', 'Pending'),
                        ('UNDER_REVIEW', 'Under Review'),
                        ('RESOLVED', 'Resolved'),
                        ('DISMISSED', 'Dismissed')
                    ],
                    default='PENDING',
                    max_length=20
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('admin_notes', models.TextField(blank=True)),
                ('related_task', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='user_reports',
                    to='core.task'
                )),
                ('reported_user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='reports_received',
                    to=settings.AUTH_USER_MODEL
                )),
                ('reporter', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='user_reports_made',
                    to=settings.AUTH_USER_MODEL
                )),
                ('reviewed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='user_reports_reviewed',
                    to='core.administrator'
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        
        # Add unique constraints
        migrations.AlterUniqueTogether(
            name='taskreport',
            unique_together={('task', 'reporter')},
        ),
        migrations.AlterUniqueTogether(
            name='userreport',
            unique_together={('reported_user', 'reporter')},
        ),
    ]