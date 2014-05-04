function req(url, method, sendInfo) {
	var method = method || 'GET',
		sendInfo = sendInfo || null;
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		if (method == 'POST' || 'PUT') {
			xhr.setRequestHeader("Content-Type", "application/json");
		}
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4){
				if(xhr.status == 200) {
					resolve(xhr.response);
				}
				else {
					reject(Error(xhr.statusText));
				}
			}
		};
		xhr.onerror = function() {
			reject(Error("Network Error"));
		};
		xhr.send(sendInfo);
	});
}

function reqJSON(url, method, sendInfo) {
	return req(url, method, sendInfo)
		.then(JSON.parse)
		.catch(function(err) {
			console.warn("Что-то пошло не так при запросе по адресу ", url, err);
			throw err;
		});
}

var newRecord = {
		"date": "4\/21\/2015",
		"title": "Magic JS",
		"lector": [
			"vasily_poupkine"
		],
		"location": "K1",
		"description": "Class about The Magic JS",
		"level": "D3-D5",
		"notes": "",
		"attendees": [
			"alena_karaba"
		],
		"tags": [
			"magic",
			"js",
			"promises"
		]
	},
	usedUrl = 'http://54.72.3.96:3000/techtalks',
	fragment = document.createDocumentFragment(),
	tbody = document.querySelector('.shedule tbody'),
	newRecordId;


reqJSON(usedUrl, 'POST', JSON.stringify(newRecord))
	.then(function(response) {
		newRecordId = response._id;
		newRecord.notes = "Some notes";
		reqJSON(usedUrl + '/' + newRecordId, 'PUT', JSON.stringify(newRecord))
			.then(function() {
				reqJSON(usedUrl)
					.then(function(response) {
						var j = 1;
						response.forEach(function(i) {
							if(i._id && i.lector) {
								var tr = document.createElement('tr'),
									td1 = document.createElement('td'),
									td2 = document.createElement('td'),
									td3 = document.createElement('td'),
									td4 = document.createElement('td');

								i._id == newRecordId && tr.classList.add('newItem');

								td1.textContent = j++ + '.';
								td2.textContent = i.lector;
								td3.textContent = !!i.title ? i.title : '';
								td4.textContent = !!i.date ? i.date : '';
								tr.appendChild(td1);
								tr.appendChild(td2);
								tr.appendChild(td3);
								tr.appendChild(td4);
								fragment.appendChild(tr);
							}
						});

						tbody.appendChild(fragment);

						reqJSON(usedUrl + '/' + newRecordId, 'DELETE')
							.then(function() {
								reqJSON(usedUrl)
									.then(function(response) {
										console.table(response);
									});
							});
					});
			});
	});
