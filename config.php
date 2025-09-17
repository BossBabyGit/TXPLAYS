<?php
return [
    'database' => [
        'host' => getenv('TXPLAYS_DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('TXPLAYS_DB_PORT') ?: 3306),
        'name' => getenv('TXPLAYS_DB_NAME') ?: 'txplays',
        'user' => getenv('TXPLAYS_DB_USER') ?: 'txplays_app',
        'pass' => getenv('TXPLAYS_DB_PASS') ?: 'change-me',
        'charset' => getenv('TXPLAYS_DB_CHARSET') ?: 'utf8mb4',
    ],
    'discord' => [
        'client_id' => getenv('TXPLAYS_DISCORD_CLIENT_ID') ?: 'YOUR_DISCORD_CLIENT_ID',
        'client_secret' => getenv('TXPLAYS_DISCORD_CLIENT_SECRET') ?: 'YOUR_DISCORD_CLIENT_SECRET',
        'redirect_uri' => getenv('TXPLAYS_DISCORD_REDIRECT_URI') ?: 'http://localhost/discord-callback.php',
        'scopes' => array_values(array_filter(array_map('trim', explode(' ', getenv('TXPLAYS_DISCORD_SCOPES') ?: 'identify email')))),
        'prompt' => getenv('TXPLAYS_DISCORD_PROMPT') ?: null,
    ],
    'app' => [
        'base_url' => getenv('TXPLAYS_BASE_URL') ?: '',
    ],
];
