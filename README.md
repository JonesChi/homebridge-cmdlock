# homebridge-cmdlock

homebridge-plugin for Your PC Command with Apple-Homekit.(by node.js child_process.exec())

# Installation

1. Install homebridge using: sudo npm install -g homebridge
2. Install this plugin using: sudo npm install -g homebridge-cmdlock
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration

Configuration sample:

 ```
"accessories": [
        {
            "accessory": "CmdLock",
            "name": "Door",
            "lock_cmd": "lock door cmd",
            "unlock_cmd": "unlock door cmd",
            "state_cmd": "get lock state cmd",
            "auto_lock": true,
            "auto_lock_delay": 10
        }
    ]

```

# Special thanks

* homebridge-cmd
* homebridge-httplock
