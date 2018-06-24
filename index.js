var Service, Characteristic;
var exec = require("child_process").exec;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-cmdlock", "CmdLock", CmdLockAccessory);
}


function CmdLockAccessory(log, config) {
	this.log = log;

	this.lock_cmd = config["lock_cmd"];
	this.unlock_cmd = config["unlock_cmd"];
	this.state_cmd = config["state_cmd"];
	this.auto_lock = config["auto_lock"] || false;
	this.auto_lock_delay = config["auto_lock_delay"] || 10;
	this.name = config["name"];
}

CmdLockAccessory.prototype = {

	cmdRequest: function(cmd, callback) {
		exec(cmd,function(error, stdout, stderr) {
				callback(error, stdout, stderr)
			})
	},

	setState: function(state, callback) {
		var lock = (state == Characteristic.LockTargetState.SECURED) ? true : false;
		var cmd;
		if (lock) {
			cmd = this.lock_cmd;
			this.log("Setting lock state to lock");
		} else {
			cmd = this.unlock_cmd;
			this.log("Setting lock state to unlock");
		}

		this.cmdRequest(cmd, function(error, stdout, stderr) {
			if (error) {
				this.log('lock function failed: %s', stderr);
				callback(error);
			} else {
				this.log('lock function succeeded!');
				var currentState = lock ?
					        Characteristic.LockCurrentState.SECURED : Characteristic.LockCurrentState.UNSECURED;
				this.lockService.setCharacteristic(Characteristic.LockCurrentState, currentState);
				this.log(stdout);

				if (!lock && this.auto_lock) {
					setTimeout(function(instance) {
            instance.lockService.setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);
            instance.log('Auto lock function succeeded!');
					}.bind(this), this.auto_lock_delay*1000, this);
				}
				callback();
			}
		}.bind(this));
	},

	getState: function(callback) {
		var cmd = this.state_cmd;
		this.cmdRequest(cmd, function(error, stdout, stderr) {
			var state = error ? false : true;
			if (stderr) {
				self.log("Failed to determine lock state");
				self.log(stderr);
			}

			callback(stderr, state);
		}.bind(this));
	},

	identify: function(callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Lock cmd Manufacturer")
			.setCharacteristic(Characteristic.Model, "Lock cmd Model")
			.setCharacteristic(Characteristic.SerialNumber, "Lock cmd Serial Number");

		this.lockService = new Service.LockMechanism(this.name);
		this.lockService
			.getCharacteristic(Characteristic.LockCurrentState)
			.on('get', this.getState.bind(this));

		this.lockService
			.getCharacteristic(Characteristic.LockTargetState)
			.on('get', this.getState.bind(this))
			.on('set', this.setState.bind(this));

		return [this.lockService];
	}
};
