local wezterm = require 'wezterm'
local config = wezterm.config_builder()

config.default_prog = { 'C:\\Program Files\\Git\\bin\\bash.exe', '-l' }

return config
