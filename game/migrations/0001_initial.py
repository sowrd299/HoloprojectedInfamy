# Generated by Django 2.2.4 on 2020-12-28 18:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='HackingMap',
            fields=[
                ('short_name', models.SlugField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
            ],
        ),
        migrations.CreateModel(
            name='HackingTool',
            fields=[
                ('short_name', models.SlugField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('text', models.TextField()),
                ('flavor_text', models.TextField()),
                ('cost', models.IntegerField()),
                ('attack_level', models.IntegerField()),
                ('alert_level', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='HackingNode',
            fields=[
                ('short_name', models.SlugField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=64)),
                ('x_pos', models.IntegerField()),
                ('y_pos', models.IntegerField()),
                ('text', models.TextField()),
                ('flavor_text', models.TextField()),
                ('is_secret', models.BooleanField(default=False)),
                ('is_player_start', models.BooleanField(default=False)),
                ('is_enemy_start', models.BooleanField(default=True)),
                ('protection_level', models.IntegerField()),
                ('alert_level', models.IntegerField()),
                ('map_in', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.HackingMap')),
            ],
        ),
        migrations.CreateModel(
            name='HackingLink',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('node_from', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='linksfromset', to='game.HackingNode')),
                ('node_to', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='linkstoset', to='game.HackingNode')),
            ],
        ),
    ]
