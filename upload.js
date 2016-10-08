sharedsecret = {};

sharedsecret.jsonFormatter = {
	stringify: function (cipherParams) {
		// create json object with ciphertext
		var jsonObj = {
			ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
		};

		// optionally add iv and salt
		if (cipherParams.iv) {
			jsonObj.iv = cipherParams.iv.toString();
		}
		if (cipherParams.salt) {
			jsonObj.s = cipherParams.salt.toString();
		}
		if (cipherParams.filename) {
			jsonObj.filename = cipherParams.filename;
		}

		// stringify json object
		return JSON.stringify(jsonObj);
	},

	parse: function (jsonStr) {
		// parse json string
		var jsonObj = JSON.parse(jsonStr);

		// extract ciphertext from json object, and create cipher params object
		var cipherParams = CryptoJS.lib.CipherParams.create({
			ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
		});

		// extract iv and salt
		if (jsonObj.iv) {
			cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
		}
		if (jsonObj.s) {
			cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
		}
		if (jsonObj.filename) {
			cipherParams.filename = jsonObj.filename;
		}

		return cipherParams;
	}
};

sharedsecret.encrypt = function(data, name, password, callback) {

	// encrypt data
	var encrypted = CryptoJS.AES.encrypt(data, password,
			{ format: sharedsecret.jsonFormatter });
	encrypted.filename = name;
	encrypted_json = encrypted.toString();

	// generate hash
	hash = CryptoJS.SHA512(encrypted_json);
	hash = hash.toString(CryptoJS.enc.hex);

	// Callback after ready
	callback(encrypted_json, hash);
}

sharedsecret.save = function(data, hash, lifespan, callback) {
	$.ajax({
		url: '/api/files/' + hash,
		type: 'PUT',
		data: data,
		headers: { 'x-file-lifespan': lifespan },
		processData: false,
		contentType: 'application/json',
		success: function(result) {
			if (callback) {
				callback(window.location.origin + '/api/files/' + hash);
			}
		}
	});
}

sharedsecret.password = function() {
	return $('#password').val();
}

sharedsecret.lifespan = function() {
	return $('#lifespan').val();
}

sharedsecret.setlink = function(link) {
	$('#link').val(link);
	$('#upload').hide();
	$('#download').show();
	$('#link').focus();
	$('#link').select();
}

sharedsecret.upload = function() {
	var files = document.getElementById('file').files;
	if (files.length != 1) {
		return;
	}
	var file = files[0];
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function(theFile) {
		return function(e) {
			var name = theFile.name;
			var data = e.target.result;
			var callback = function(enc_data, hash) {
				sharedsecret.save(enc_data, hash, sharedsecret.lifespan(),
						sharedsecret.setlink);
			};
			sharedsecret.encrypt(data, name, sharedsecret.password(), callback);
		};
	})(file);

	// Read in the image file as a data URL.
	reader.readAsText(file);
}

sharedsecret.fileselect = function(f) {
	var name = f.files.length ? f.files[0].name : 'Choose a file';
	$('#filelabel').html(name);
}
