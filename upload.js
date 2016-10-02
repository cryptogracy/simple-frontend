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

		// optionally extract iv and salt
		if (jsonObj.iv) {
			cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
		}
		if (jsonObj.s) {
			cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
		}

		return cipherParams;
	}
};

function testEnc() {

	// Encrypt
	var encrypted = CryptoJS.AES.encrypt("Message", "123", { format: JsonFormatter });
	encrypted_json = encrypted.toString();
	console.log(encrypted)
	console.log(encrypted_json)

	hash = CryptoJS.SHA512(encrypted);
	hash = hash.toString(CryptoJS.enc.hex);
	console.log(hash);

	$.ajax({
		url: '/api/' + hash,
		type: 'PUT',
		data: encrypted,
		headers: { 'x-http-lifespan': 24*60*3 },
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
