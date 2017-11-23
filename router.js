;(function(window, undefined) {
	var Router = function(routes) {
		return new Router.fn.init(routes);
	};

	Router.fn = Router.prototype = {
		init: function(routes) {
			this.routes = routes.routes;
			this.error = routes.error;
		},

		trigger: function(hash) {
			var routes = this.routes;
			var notRoute = false;
			
			for (let i = 0, len = routes.length; i < len; i++) {
				var routeReg = this.initRegexps(routes[i].path);
				if (routeReg.test(hash[0])) {
					var callback = routes[i].callback || function () {};
					var params = this.getParams(routeReg, hash[0]);
					var query = this.getQuery(hash[1]);
					var req = {
						params: params,
						query: query
					}
					callback.bind(this)(req);
					notRoute = true;
				}
			}

			if (!notRoute) {
				this.error('error');
			}
		},

		initRegexps: function(route) {
			/**
			 * route 正则处理
			 * 第一个正则 匹配: 在/后面可以由接受任意字符,直到遇到下一个/
			 * 第二个正则 并在/前面加转译字符\
			 */
			var routeReg = '';
			routeReg = route.replace(/\/:\w[^\/]+/g, '\/([^\/]+)')
				.replace(/\//g, '\\/');

			return new RegExp('^#' + routeReg + '$');
		},

		getParams: function (routeReg, hash) {
			return routeReg.exec(hash).slice(1);
		},

		getQuery: function (search) {
			let query = {};

			if (typeof search != 'string') {
				return query;
			}

			let arr = search.split('&');
			for (var i = 0, len = arr.length; i < len; i++) {
				let oQuery = arr[i].split('=');
				query[oQuery[0]] = oQuery[1] || null;
			}

			return query;
		}

	}

	Router.fn.init.prototype = Router.fn;

	Router.prototype.run = function() {
		var self = this;
		window.addEventListener('hashchange', function() {
			start();
		}.bind(this), false);
		window.addEventListener('load', function() {
			start();
		}.bind(this), false);

		function start() {
			let hash = window.location.hash.split('?');
			if (hash[0] != '') {
				self.trigger(hash);
			} else {
				window.location.hash = '#/'
			}
		}
	}

	window.Router = Router;
})(window);