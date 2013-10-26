document.cookie.replace(/__b=(([^!]+!)([0-9]+))|.$/, // use a regular expression to load the cookie
			function (match, contents, extra, counter) {
			    // if the cookie was not found, then contents will be null and it will have matches the last letter of the cookie stinrg
			    var date=new Date;
			    // increase the counter, or record the date if the is the first time that we have seen this user
			    contents = contents ? contents + (++counter) : date * 1 + '!1';
			    // compute the expiration for the cookie
			    date.setDate(date.getDate() + 365);
			    // set the cookie
			    document.cookie = '__b=' + b + ' ;expires=' + date.toUTCString();
			});
