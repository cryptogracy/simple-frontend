var JsonFormatter = {
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


function testEnc() {

	// Encrypt
	var encrypted = CryptoJS.AES.encrypt("Message", "123", { format: JsonFormatter });
	encrypted.filename = 'filename.txt';
	encrypted_json = encrypted.toString();
	console.log(encrypted);
	console.log(encrypted_json);

	hash = CryptoJS.SHA512(encrypted_json);
	hash = hash.toString(CryptoJS.enc.hex);
	console.log(hash);

	$.ajax({
		url: '/api/' + hash,
		type: 'PUT',
		data: encrypted_json,
		headers: { 'x-http-lifespan': 1 },
		processData: false,
		contentType: 'application/json',
		success: function(result) {
			console.log('success');
			$('#dec').show();
		}
	});

}

function testDec() {

	$.ajax({
		url: '/api/' + hash,
		type: 'GET',
		success: function(result) {
			console.log(result);
			//result = encrypted_json;
			//console.log(result);

			// Decrypt
			var decrypted = CryptoJS.AES.decrypt(result, "123", { format: JsonFormatter });
			var decrypted_str = CryptoJS.enc.Utf8.stringify(decrypted);
			console.log(decrypted_str);

			$('#msg').html(decrypted_str);
		}
	});
}


// --------------------------------------

function encrypt(data, name, password, callback) {

	// encrypt data
	console.log(data);
	console.log(name);
	console.log(password);
	var encrypted = CryptoJS.AES.encrypt(data, password, { format: JsonFormatter });
	encrypted.filename = name;
	encrypted_json = encrypted.toString();

	// generate hash
	hash = CryptoJS.SHA512(encrypted_json);
	hash = hash.toString(CryptoJS.enc.hex);

	$.ajax({
		url: '/api/' + hash,
		type: 'PUT',
		data: encrypted_json,
		headers: { 'x-http-lifespan': 24*60*3 },
		processData: false,
		contentType: 'application/json',
		success: function(result) {
			if (callback) {
				callback(window.location.origin + '/api/' + hash);
			}
		}
	});

}

function password() {
	return $('#password').val();
}

function setLink(link) {
	$('#link').val(link);
	$('#upload').hide();
	$('#download').show();
	$('#link').focus();
	$('#link').select();
}

function upload(evt) {
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
			encrypt(data, name, password(), setLink);
		};
	})(file);

	// Read in the image file as a data URL.
	reader.readAsText(file);
}

function fileselect(f) {
	var name = f.files.length ? f.files[0].name : 'Choose a file';
	$('#filelabel').html(name);
}
