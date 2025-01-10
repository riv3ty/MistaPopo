# MistaPopo
Ein, durch ein Schulprojekt ins Leben gerufener, Discord Bot.

## Funktionsweise
Der MistaPopo Bot ist ein Discord Bot, der verschiedene Befehle und Funktionen bietet, um die Interaktion auf Ihrem Discord-Server zu verbessern. Der Bot wurde in Python entwickelt und verwendet die Discord.py-Bibliothek.

### Installation
1. Klone das Repository:
    ```bash
    git clone https://github.com/riv3ty/MistaPopo.git
    ```
2. Navigiere in das Projektverzeichnis:
    ```bash
    cd MistaPopo
    ```
3. Installiere die benötigten Abhängigkeiten:
    ```bash
    pip install discord.py
    ```

### Nutzung
1. Erstelle eine Datei namens `.env` im Hauptverzeichnis des Projekts.
2. Füge die folgende Zeile in die `.env` Datei ein und ersetze `YOUR_BOT_TOKEN` durch den Token deines eigenen Discord Bots:
    ```env
    DISCORD_TOKEN=YOUR_BOT_TOKEN
    ```
3. Starte den Bot:
    ```bash
    python bot.py
    ```

### Hinweise
- Stelle sicher, dass du Python 3.8 oder höher installiert hast.
- Der Bot muss über die notwendigen Berechtigungen verfügen, um auf deinem Server zu funktionieren.

## Token des eigenen Bots eingeben
In der letzten Zeile der `.env` Datei muss der Token deines eigenen Bots eingegeben werden:
```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
```
