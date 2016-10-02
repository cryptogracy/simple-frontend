
function test() {

	// Encrypt
	var ciphertext = CryptoJS.AES.encrypt('my message', '123');
	ciphertext = ciphertext.ciphertext.toString(CryptoJS.enc.Base64);
	console.log(ciphertext);

	// Decrypt
	//var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), '123');
	//var plaintext = bytes.toString(CryptoJS.enc.Utf8);
	//console.log(plaintext);

	var hash = CryptoJS.SHA512(ciphertext);
	var hash = hash.toString(CryptoJS.enc.Base64);
	console.log(hash);

	$.ajax({
		url: '/api/' + hash,
		type: 'PUT',
		data: ciphertext,
		headers: { 'x-http-lifespan': 24*60*3 },
		success: function(result) {
			console.log('success');
		}
	});

}
