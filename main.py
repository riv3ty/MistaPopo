import discord
from discord.ext import commands
import json
import random
import os

# Bot Setup
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Level-Rollen Konfiguration
ROLE_LEVELS = {
    "Baka": range(1, 6),      # Level 1-5
    "Fan": range(6, 11),      # Level 6-10
    "Big Fan": range(11, 16), # Level 11-15
    "Super Fan": range(16, 21), # Level 16-20
    "Weeb": range(21, 26),    # Level 21-25
    "Otaku": range(26, 31)    # Level 26-30
}

# Leveling-Daten Datei
LEVELS_FILE = 'levels.json'

# Überprüfen, ob die Levels-Datei existiert, wenn nicht, erstelle sie
if not os.path.exists(LEVELS_FILE):
    with open(LEVELS_FILE, 'w') as f:
        json.dump({}, f)

# Lade die Level-Daten
def load_levels():
    with open(LEVELS_FILE, 'r') as f:
        return json.load(f)

# Speichere die Level-Daten
def save_levels(data):
    with open(LEVELS_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@bot.event
async def on_ready():
    print(f'{bot.user} ist online!')
    # Setze den benutzerdefinierten Status
    await bot.change_presence(
        activity=discord.Activity(
            type=discord.ActivityType.watching,
            name="ob Umut mal wiederkommen wird?"
        )
    )
    
    # Überprüfe und erstelle Rollen für jeden Server
    for guild in bot.guilds:
        await setup_roles(guild)

async def setup_roles(guild):
    # Definiere die Rollenfarben
    role_colors = {
        "Baka": discord.Color.light_grey(),
        "Fan": discord.Color.green(),
        "Big Fan": discord.Color.blue(),
        "Super Fan": discord.Color.purple(),
        "Weeb": discord.Color.gold(),
        "Otaku": discord.Color.red()
    }
    
    existing_roles = {role.name: role for role in guild.roles}
    
    # Erstelle fehlende Rollen
    for role_name in ROLE_LEVELS.keys():
        if role_name not in existing_roles:
            try:
                await guild.create_role(
                    name=role_name,
                    color=role_colors[role_name],
                    reason="Automatisch erstellte Level-Rolle"
                )
                print(f"Rolle '{role_name}' wurde auf Server '{guild.name}' erstellt")
            except discord.Forbidden:
                print(f"Keine Berechtigung, um Rolle '{role_name}' auf Server '{guild.name}' zu erstellen")
            except Exception as e:
                print(f"Fehler beim Erstellen der Rolle '{role_name}': {str(e)}")

@bot.event
async def on_message(message):
    if message.author.bot:
        return

    # Lade aktuelle Level-Daten
    levels = load_levels()
    user_id = str(message.author.id)

    # Erstelle Eintrag für neuen Nutzer
    if user_id not in levels:
        levels[user_id] = {
            "experience": 0,
            "level": 1
        }

    # Füge zufällige XP zwischen 5 und 15 hinzu
    xp_to_add = random.randint(5, 15)
    levels[user_id]["experience"] += xp_to_add

    # Berechne Level
    current_xp = levels[user_id]["experience"]
    current_level = levels[user_id]["level"]
    xp_needed = current_level * 100

    # Level Up Check
    if current_xp >= xp_needed:
        old_level = current_level
        levels[user_id]["level"] += 1
        new_level = levels[user_id]["level"]
        levels[user_id]["experience"] = 0

        # Erstelle einen schöneren Level-Up Text
        level_up_text = f"🎉 **Level Up!** 🎉\n{message.author.mention} ist nun Level {new_level}!"
        
        # Rolle zuweisen
        for role_name, level_range in ROLE_LEVELS.items():
            if new_level in level_range:
                # Finde die Rolle auf dem Server
                role = discord.utils.get(message.guild.roles, name=role_name)
                
                if role:
                    # Entferne alte Level-Rollen
                    for old_role_name in ROLE_LEVELS.keys():
                        old_role = discord.utils.get(message.guild.roles, name=old_role_name)
                        if old_role in message.author.roles:
                            await message.author.remove_roles(old_role)
                    
                    # Füge neue Rolle hinzu
                    await message.author.add_roles(role)
                    level_up_text += f"\nDu hast die Rolle **{role_name}** erhalten! 🏆"
                else:
                    level_up_text += f"\n⚠️ Die Rolle '{role_name}' existiert nicht auf dem Server!"
                break

        # Sende Level-Up Nachricht
        embed = discord.Embed(
            title="Level Up!",
            description=level_up_text,
            color=discord.Color.green()
        )
        embed.set_thumbnail(url=message.author.avatar.url if message.author.avatar else message.author.default_avatar.url)
        await message.channel.send(embed=embed)

    save_levels(levels)
    await bot.process_commands(message)

@bot.command()
async def rank(ctx):
    levels = load_levels()
    user_id = str(ctx.author.id)

    if user_id not in levels:
        await ctx.send("Du hast noch kein Level!")
        return

    level = levels[user_id]["level"]
    xp = levels[user_id]["experience"]
    xp_needed = level * 100

    embed = discord.Embed(title="Rang-Information", color=discord.Color.blue())
    embed.add_field(name="Level", value=str(level), inline=True)
    embed.add_field(name="XP", value=f"{xp}/{xp_needed}", inline=True)
    embed.set_footer(text=f"Angefordert von {ctx.author.name}")

    await ctx.send(embed=embed)

@bot.command()
async def leaderboard(ctx):
    levels = load_levels()
    
    # Sortiere Nutzer nach Level und XP
    sorted_users = sorted(levels.items(), 
                         key=lambda x: (x[1]["level"], x[1]["experience"]), 
                         reverse=True)[:10]

    embed = discord.Embed(title="Top 10 Leaderboard", color=discord.Color.gold())
    
    for idx, (user_id, user_data) in enumerate(sorted_users, 1):
        user = await bot.fetch_user(int(user_id))
        embed.add_field(
            name=f"#{idx} {user.name}",
            value=f"Level: {user_data['level']} | XP: {user_data['experience']}",
            inline=False
        )

    await ctx.send(embed=embed)

@bot.command()
async def erase(ctx, member: discord.Member = None):
    # Wenn kein Member angegeben ist, nimm den Autor des Commands
    target = member or ctx.author
    
    levels = load_levels()
    user_id = str(target.id)
    
    if user_id not in levels:
        await ctx.send(f"{target.mention} hat noch keinen Level-Status!")
        return
    
    # Speichere alte Werte für die Nachricht
    old_level = levels[user_id]["level"]
    old_xp = levels[user_id]["experience"]
    
    # Setze Level und XP zurück
    levels[user_id] = {
        "experience": 0,
        "level": 1
    }
    
    # Entferne alle Level-Rollen
    for role_name in ROLE_LEVELS.keys():
        role = discord.utils.get(ctx.guild.roles, name=role_name)
        if role and role in target.roles:
            await target.remove_roles(role)
    
    # Füge Anfänger-Rolle hinzu
    baka_role = discord.utils.get(ctx.guild.roles, name="Baka")
    if baka_role:
        await target.add_roles(baka_role)
    
    save_levels(levels)
    
    # Erstelle Embed-Nachricht
    embed = discord.Embed(
        title="Level Reset",
        description=f"Level-Status von {target.mention} wurde zurückgesetzt!",
        color=discord.Color.red()
    )
    embed.add_field(name="Alter Status", value=f"Level: {old_level} | XP: {old_xp}", inline=False)
    embed.add_field(name="Neuer Status", value="Level: 1 | XP: 0", inline=False)
    
    await ctx.send(embed=embed)

# Füge hier deinen Bot-Token ein
bot.run('TOKEN')