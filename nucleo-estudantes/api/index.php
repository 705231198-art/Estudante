<?php
// Simple router entry that delegates to the PHP API implementation
// It allows requests to /api/index.php to be handled by php/api.php

// Adjust working directory
chdir(__DIR__ . '/..');

// Include the main API implementation
require_once __DIR__ . '/../php/api.php';

// php/api.php executes the API when included
