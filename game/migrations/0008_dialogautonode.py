# Generated by Django 3.2.8 on 2021-10-21 20:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0007_auto_20211020_1910'),
    ]

    operations = [
        migrations.CreateModel(
            name='DialogAutoNode',
            fields=[
                ('dialognode_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='game.dialognode')),
            ],
            bases=('game.dialognode',),
        ),
    ]
